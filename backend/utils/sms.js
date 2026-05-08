let twilioClient = null;

const getClient = () => {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
};

/**
 * Send an SMS via Twilio
 * @param {string} to - Phone number with country code (e.g. +919876543210)
 * @param {string} message - SMS message body
 */
exports.sendSMS = async (to, message) => {
  try {
    const client = getClient();
    if (!client) {
      console.warn('⚠️  Twilio not configured, skipping SMS');
      return;
    }
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log(`📱 SMS sent to ${to}`);
  } catch (error) {
    console.error('SMS error:', error.message);
  }
};

exports.appointmentConfirmedSMS = (patientName, doctorName, date, time) =>
  `Hi ${patientName}! Your appointment with Dr. ${doctorName} is confirmed for ${date} at ${time}. Please arrive 10 mins early. - HealthAxis`;

exports.appointmentReminderSMS = (patientName, doctorName, time) =>
  `Reminder: Hi ${patientName}, your appointment with Dr. ${doctorName} is in 1 hour at ${time}. - HealthAxis`;
