const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send an email
 * @param {Object} options - { to, subject, html, text }
 */
exports.sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    console.log(`📧 Email sent to ${options.to}`);
  } catch (error) {
    console.error('Email error:', error.message);
    // Don't throw – email failure shouldn't break the request
  }
};

// ─── Email Templates ──────────────────────────────────────────────────────────

exports.appointmentConfirmedEmail = (patientName, doctorName, date, time) => ({
  subject: '✅ Appointment Confirmed - Hospital Management System',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a73e8; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Appointment Confirmed</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <p>Dear <strong>${patientName}</strong>,</p>
        <p>Your appointment has been <strong>confirmed</strong>.</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>🩺 <strong>Doctor:</strong> Dr. ${doctorName}</p>
          <p>📅 <strong>Date:</strong> ${date}</p>
          <p>⏰ <strong>Time:</strong> ${time}</p>
        </div>
        <p>Please arrive 10 minutes early. Bring any relevant medical documents.</p>
        <p>If you need to cancel, please do so at least 2 hours in advance.</p>
      </div>
      <div style="background: #1a73e8; padding: 15px; text-align: center;">
        <p style="color: white; margin: 0; font-size: 12px;">© 2024 Hospital Management System</p>
      </div>
    </div>
  `,
});

exports.appointmentReminderEmail = (patientName, doctorName, date, time) => ({
  subject: '⏰ Appointment Reminder - 1 Hour Before',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #f4a261; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Appointment Reminder</h1>
      </div>
      <div style="padding: 30px;">
        <p>Dear <strong>${patientName}</strong>,</p>
        <p>This is a reminder that your appointment is in <strong>1 hour</strong>.</p>
        <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f4a261;">
          <p>🩺 <strong>Doctor:</strong> Dr. ${doctorName}</p>
          <p>📅 <strong>Date:</strong> ${date}</p>
          <p>⏰ <strong>Time:</strong> ${time}</p>
        </div>
        <p>Please make sure you are on your way. See you soon!</p>
      </div>
    </div>
  `,
});

exports.appointmentCancelledEmail = (patientName, doctorName, date, reason) => ({
  subject: '❌ Appointment Cancelled',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #d32f2f; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Appointment Cancelled</h1>
      </div>
      <div style="padding: 30px;">
        <p>Dear <strong>${patientName}</strong>,</p>
        <p>Your appointment with <strong>Dr. ${doctorName}</strong> on <strong>${date}</strong> has been cancelled.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>Please book a new appointment at your convenience.</p>
      </div>
    </div>
  `,
});
