import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

declare global {
  var __marbie_transporter: any | undefined;
}

export async function getTransporter() {
  if (global.__marbie_transporter) {
    return global.__marbie_transporter;
  }

  let envSmtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  let envSmtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (!envSmtpUser || !envSmtpPass) {
    try {
      const envPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const userMatch = envContent.match(/SMTP_USER=(.+)/);
        const passMatch = envContent.match(/SMTP_PASS=(.+)/);
        if (userMatch) envSmtpUser = userMatch[1].trim();
        if (passMatch) envSmtpPass = passMatch[1].trim();
      }
    } catch (err) {
      console.error("Failed to read .env.local manually:", err);
    }
  }

  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = envSmtpUser;
  const smtpPass = envSmtpPass;

  const isRealConfig = smtpUser && !smtpUser.includes("your-gmail") && smtpPass && !smtpPass.includes("your-16");

  if (isRealConfig) {
    global.__marbie_transporter = nodemailer.createTransport({
      pool: true,
      maxConnections: 1,
      maxMessages: 100,
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });
  } else {
    console.log("ℹ️ Placeholder or missing SMTP credentials. Generating Ethereal Email test mailbox...");
    const testAccount = await nodemailer.createTestAccount();
    global.__marbie_transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }

  // Also attach the active user to the global object for reference
  global.__marbie_transporter.__smtpUser = smtpUser;
  global.__marbie_transporter.__isRealConfig = isRealConfig;

  return global.__marbie_transporter;
}

export async function sendEmail(options: nodemailer.SendMailOptions) {
  const transporter = await getTransporter();
  
  if (!options.from) {
    const smtpUser = transporter.__smtpUser;
    options.from = `"Marbie Jewels" <${smtpUser || "hello@marbiejewels.com"}>`;
  }
  
  const info = await transporter.sendMail(options);
  
  if (!transporter.__isRealConfig) {
    const testMessageUrl = nodemailer.getTestMessageUrl(info);
    if (testMessageUrl) {
      console.log(`✉️ Real Test Mailbox URL (To: ${options.to}): ${testMessageUrl}`);
    }
  }
  
  return info;
}
