const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const user = process.env.EMAIL;
const pass = process.env.EMAIL_APP_PW;

const sendEmail = async (recipient, subject, text) => {
  // Create a transporter for sending email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  const mailOptions = {
    from: user,
    to: recipient,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error occurred while sending email:", error);
  }
};

const createAppointmentText = (appointedBy, status, appointedTo, currentDate) => {
  const formattedDate = new Date(currentDate).toLocaleString();
  let text = `
    Dear ${appointedBy},
    I hope this email finds you well.
    We wanted to reach out to inform you about the status of the appointment you booked through Appointify.
    As per your request, the appointment with ${appointedTo} on ${formattedDate} has now been marked as ${status}.
    Best regards,
    The Appointify Team
    [Do Not Reply]`;

  if (status === "booked") {
    text = `
    Dear ${appointedTo},
    You have a new appointment booked through Appointify.
    Details:
    - Date & Time: ${formattedDate}
    - Booked by: ${appointedBy}
     Please log in to Appointify to accept or reject this appointment.
    Best regards,
    The Appointify Team
    [Do Not Reply]`;
  }

  return text;
};

const sendOtp = (fullName, otp) => {
  return `Dear ${fullName},
  Your OTP code is ${otp}`;
};

const verifyEmails = (fullName, verificationCode) => {
  const text = `Dear ${fullName},
  Your verification code is: ${verificationCode}
  The Appointify Team
  [Do Not Reply]`;
  return text;
};

module.exports = { sendEmail, createAppointmentText, sendOtp, verifyEmails };
