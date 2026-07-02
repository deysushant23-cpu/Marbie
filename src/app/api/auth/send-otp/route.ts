import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/mailer";

// Helper: mask email for display (e.g. ma***@gmail.com)
function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  return user.slice(0, 2) + "***@" + domain;
}

// Helper: generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper: send OTP email
async function sendOtpEmail(to: string, otp: string) {
  await sendEmail({
    to,
    subject: "Your Marbie Jewels Login OTP",
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e8ddd0;">
        <div style="background: linear-gradient(135deg, #2c1810 0%, #5c3a1e 100%); padding: 32px; text-align: center;">
          <h1 style="color: #f0e0c8; font-size: 24px; margin: 0; letter-spacing: 2px;">MARBIE JEWELS</h1>
          <p style="color: rgba(240,224,200,0.7); margin: 8px 0 0; font-size: 13px; letter-spacing: 1px;">TIMELESS ELEGANCE</p>
        </div>
        <div style="padding: 40px 32px; text-align: center;">
          <p style="color: #5c3a1e; font-size: 16px; margin: 0 0 24px;">Your one-time verification code is:</p>
          <div style="background: #fdf8f4; border: 2px solid #d4a574; border-radius: 12px; padding: 24px; margin: 0 auto 24px; display: inline-block; min-width: 200px;">
            <span style="font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #2c1810; font-family: monospace;">${otp}</span>
          </div>
          <p style="color: #8b6347; font-size: 13px; margin: 0 0 8px;">This code expires in <strong>5 minutes</strong>.</p>
          <p style="color: #b0967a; font-size: 12px; margin: 0;">If you didn't request this, please ignore this email.</p>
        </div>
        <div style="background: #fdf8f4; padding: 16px 32px; text-align: center; border-top: 1px solid #e8ddd0;">
          <p style="color: #b0967a; font-size: 11px; margin: 0;">© 2026 Marbie Jewels · support@marbiejewels.com</p>
        </div>
      </div>
    `,
  });
}

export async function POST(req: Request) {
  try {
    const { phone, email, pin, isNewUser } = await req.json();

    // Validate phone
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, "").length === 10
      ? "91" + phone.replace(/\D/g, "")
      : phone.replace(/\D/g, "");

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { phone: cleanPhone },
    });

    let emailToSend: string;

    // New user path
    if (!existingUser) {
      if (!email || !pin) {
        return NextResponse.json({ needsRegistration: true });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
      }

      if (!/^\d{6}$/.test(pin)) {
        return NextResponse.json({ error: "PIN must be exactly 6 digits" }, { status: 400 });
      }

      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return NextResponse.json({ error: "This email is already registered" }, { status: 400 });
      }

      const pinHash = await bcrypt.hash(pin, 10);
      const expires = new Date(Date.now() + 5 * 60 * 1000);
      const generatedOtp = generateOTP();

      await prisma.otpToken.deleteMany({ where: { phone: cleanPhone } });
      await prisma.otpToken.create({
        data: { phone: cleanPhone, email, otp: generatedOtp, pinHash, isNewUser: true, expires },
      });

      emailToSend = email;
      await sendOtpEmail(emailToSend, generatedOtp);

    } else {
      // Returning user — validate PIN
      if (!pin) {
        return NextResponse.json({ needsPin: true, name: existingUser.name });
      }

      if (!/^\d{6}$/.test(pin)) {
        return NextResponse.json({ error: "PIN must be exactly 6 digits" }, { status: 400 });
      }

      if (!existingUser.pin) {
        return NextResponse.json({ error: "No PIN set for this account. Please contact support." }, { status: 400 });
      }

      const isPinValid = await bcrypt.compare(pin, existingUser.pin);
      if (!isPinValid) {
        return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
      }

      if (!existingUser.email) {
        return NextResponse.json({ error: "No email on file. Please contact support." }, { status: 400 });
      }

      const expires = new Date(Date.now() + 5 * 60 * 1000);
      const generatedOtp = generateOTP();

      await prisma.otpToken.deleteMany({ where: { phone: cleanPhone } });
      await prisma.otpToken.create({
        data: { phone: cleanPhone, email: existingUser.email, otp: generatedOtp, isNewUser: false, expires },
      });

      emailToSend = existingUser.email;
      await sendOtpEmail(emailToSend, generatedOtp);
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email",
      maskedEmail: maskEmail(emailToSend),
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
