const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const user = process.env.EMAIL;
const pass = process.env.EMAIL_APP_PW;

const sendEmail = async (recipient, mailOptions) => {
  // Create a transporter for sending email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  mailOptions.from = user;
  mailOptions.to = recipient;
  try {
    transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error occurred while sending email:", error);
  }
};

const createText = async (appointedBy, status, appointedTo, currentDate) => {
  const text = `Dear ${appointedBy},
 I hope this email finds you well.
 We wanted to reach out to inform you about the status of the appointment you booked through Appointify.
 As per your request, the appointment with  ${appointedTo} on ${currentDate} has now been marked as ${status}.
 Best regards,
The Appointify Team
[Do Not Reply]`;
  return text;
};

module.exports = { sendEmail, createText };
