import { CronJob } from "cron";
import Appointment from "../modules/appointment/appointment.models";
import User from "../modules/auth/auth.models";
import Organization from "../modules/organization/organization.models";
import { sendremindermail } from "../utils/appointmentemail";
import { formatUtcAsIst } from "../utils/timezone";

const REMINDER_HOURS_BEFORE = 24;

async function sendPendingReminders(): Promise<void> {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + REMINDER_HOURS_BEFORE * 60 * 60 * 1000);

    const appointments = await Appointment.find({
        status: "booked",
        reminderSent: false,
        startTime: {
            $gte: now,
            $lte: windowEnd,
        },
    });

    if (!appointments.length) return;

    console.log(`[Reminder] Processing ${appointments.length} appointment(s)...`);

    for (const appt of appointments) {
        try {
            const user = await User.findById(appt.userId).select("name email");
            if (!user?.email) continue;

            const staff = await User.findById(appt.staffId).select("name");
            const org = await Organization.findById(appt.organizationId).select("name");

            const appointmentDateTimeIst = formatUtcAsIst(appt.startTime, "datetime");

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
                `[Reminder] Sent to ${user.email} for appointment at ${appointmentDateTimeIst} IST`
            );
        } catch (err) {
            console.error(`[Reminder] Failed for appointment ${appt._id.toString()}:`, err);
        }
    }
}

export function startReminderScheduler(): void {
    const job = new CronJob(
        "0,15,30,45 * * * *",
        () => {
            sendPendingReminders().catch((err) => {
                console.error("[Reminder] Scheduler error:", err);
            });
        },
        null,
        true,
        "Asia/Kolkata"
    );

    console.log("[Reminder] Scheduler started — runs every 15 minutes (IST).");
    return void job;
}
