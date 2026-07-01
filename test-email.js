const nodemailer = require("nodemailer");

async function test() {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "baisakhiroy1993@gmail.com",
        pass: "kdnydfeqkuutnzzk"
      }
    });

    console.log("Verifying connection...");
    await transporter.verify();
    console.log("Connection successful!");

    console.log("Sending test email...");
    const info = await transporter.sendMail({
      from: "baisakhiroy1993@gmail.com",
      to: "deysushant23@gmail.com",
      subject: "Test OTP",
      text: "Your OTP is 123456"
    });

    console.log("Email sent! Message ID:", info.messageId);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

test();
