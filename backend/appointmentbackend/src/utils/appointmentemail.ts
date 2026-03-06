import nodemailer from "nodemailer";

export interface AppointmentReminderPayload {
  to: string;
  userName: string;
  staffName: string;
  orgName: string;
  appointmentDateTimeIst: string;
  notes?: string;
}

export const sendremindermail = async (
  payload: AppointmentReminderPayload
): Promise<void> => {
  const { to, userName, staffName, orgName, appointmentDateTimeIst, notes } =
    payload;

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error("EMAIL_USER or EMAIL_PASS missing in .env");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const notesSection = notes
    ? `<p><strong>Notes:</strong> ${notes}</p>`
    : "";

  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width:600px; margin:auto; padding:20px;">
    
    <h2 style="color:#333;">Appointment Reminder</h2>

    <p>Hello ${userName},</p>

    <p>This is a reminder for your upcoming appointment.</p>

    <div style="background:#f5f5f5; padding:15px; border-radius:6px;">
      <p><strong>Organization:</strong> ${orgName}</p>
      <p><strong>Staff:</strong> ${staffName}</p>
      <p><strong>Date & Time:</strong> ${appointmentDateTimeIst} IST</p>
      ${notesSection}
    </div>

    <p style="margin-top:20px;">
      Please arrive a few minutes before your scheduled time.
    </p>

    <p>
      If you need to cancel or reschedule, please do so at least 
      <strong>1 hour before</strong> the appointment.
    </p>

    <p style="margin-top:25px;">
      Thanks,<br/>
      <strong>${orgName}</strong>
    </p>

    <hr style="margin-top:30px;"/>

    <p style="font-size:12px; color:#777;">
      This is an automated reminder email. Please do not reply.
    </p>

  </div>
  `;

  await transporter.sendMail({
    from: `"${orgName}" <${emailUser}>`,
    to: to,
    subject: `Reminder: Appointment with ${staffName} at ${orgName}`,
    html,
  });
};