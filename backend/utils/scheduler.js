const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { sendEmail, appointmentReminderEmail } = require('./email');
const { sendSMS, appointmentReminderSMS } = require('./sms');

/**
 * Runs every 5 minutes. Finds appointments starting in ~60 min that
 * haven't had reminders sent yet, and fires email + SMS.
 */
exports.scheduleAppointmentReminders = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      const fiveMinBuffer = new Date(now.getTime() + 55 * 60 * 1000);

      // Find confirmed appointments in the next 55–60 minute window
      const appointments = await Appointment.find({
        status: 'confirmed',
        appointmentDate: { $gte: fiveMinBuffer, $lte: oneHourLater },
        'reminderSent.email': false,
      })
        .populate('patient', 'name email phone')
        .populate('doctor', 'name');

      for (const apt of appointments) {
        const dateStr = new Date(apt.appointmentDate).toLocaleDateString();
        const timeStr = apt.timeSlot.startTime;

        // Email reminder
        if (apt.patient.email) {
          const template = appointmentReminderEmail(
            apt.patient.name,
            apt.doctor.name,
            dateStr,
            timeStr
          );
          await sendEmail({ to: apt.patient.email, ...template });
        }

        // SMS reminder
        if (apt.patient.phone) {
          const msg = appointmentReminderSMS(apt.patient.name, apt.doctor.name, timeStr);
          await sendSMS(apt.patient.phone, msg);
        }

        // Mark reminders as sent
        await Appointment.findByIdAndUpdate(apt._id, {
          'reminderSent.email': true,
          'reminderSent.sms': true,
        });
      }

      if (appointments.length > 0) {
        console.log(`⏰ Sent reminders for ${appointments.length} appointment(s)`);
      }
    } catch (error) {
      console.error('Scheduler error:', error.message);
    }
  });
};
