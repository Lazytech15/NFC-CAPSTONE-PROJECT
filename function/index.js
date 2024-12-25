import functions from "firebase-functions";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "capstoneantipoloicct@gmail.com",
    pass: "your-app-password", // Make sure to use an app-specific password, not your Google password
  },
});

export const sendRegistrationEmail = functions.https.onCall(async (data) => {
  const { name, email } = data;
  
  const mailOptions = {
    from: "capstoneantipoloicct@gmail.com",
    to: email,
    subject: "Welcome to ICCT Colleges",
    text: `Dear ${name},\n\nThank you for registering at ICCT Colleges! We are excited to have you on board.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});
