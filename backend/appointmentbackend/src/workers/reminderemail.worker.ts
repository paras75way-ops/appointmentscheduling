import { CronJob } from "cron";
import Appointment from "../modules/appointment/appointment.models";
import { sendremindermail } from "../utils/appointmentemail";
import { IUser } from "../modules/auth/auth.types";
import { IOrganization } from "../modules/organization/organization.types";

interface PopulatedUser {
  name: string;
  email: string;
}

interface PopulatedOrg {
  name: string;
}

export const startReminderWorker = (): void => {
  const job = new CronJob(
    "* * * * *",
    async (): Promise<void> => {
      try {
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
        const oneHourTenLater = new Date(now.getTime() + 70 * 60 * 1000);

        const appointments = await Appointment.find({
          startTime: {
            $gte: oneHourLater,
            $lte: oneHourTenLater,
          },
          reminderSent: false,
          status: "booked",
        })
          .populate<{ userId: IUser }>("userId", "name email")
          .populate<{ staffId: IUser }>("staffId", "name")
          .populate<{ organizationId: IOrganization }>("organizationId", "name");

        console.log(`[Reminder Worker] Appointments found: ${appointments.length}`);

        for (const appt of appointments) {
          const user = appt.userId as unknown as PopulatedUser;
          const staff = appt.staffId as unknown as PopulatedUser;
          const org = appt.organizationId as unknown as PopulatedOrg;

          if (!user?.email) {
            console.warn(`[Reminder Worker] Skipping appointment ${String(appt._id)} — no user email`);
            continue;
          }

          const appointmentDateTimeIst = new Date(appt.startTime).toLocaleString(
            "en-IN",
            {
              timeZone: "Asia/Kolkata",
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }
          );

          await sendremindermail({
            to: user.email,
            userName: user.name,
            staffName: staff?.name ?? "your staff member",
            orgName: org?.name ?? "the organization",
            appointmentDateTimeIst,
            notes: appt.notes,
          });

          appt.reminderSent = true;
          await appt.save();

          console.log(
            `[Reminder Worker] Sent to ${user.email} — ${org?.name ?? "org"} / ${staff?.name ?? "staff"} @ ${appointmentDateTimeIst} IST`
          );
        }
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error("[Reminder Worker] Error:", msg);
      }
    },
    null,
    false,
    "Asia/Kolkata"
  );

  job.start();
  console.log("[Reminder Worker] Started — checks every minute (IST).");
};