import { NextResponse } from "next/server";
import { sendOTP } from "@/lib/msg91";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

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

    // New user path
    if (!existingUser) {
      if (!email || !pin) {
        // Phone not found — signal frontend to show registration fields
        return NextResponse.json({ needsRegistration: true });
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
      }

      // Validate PIN is exactly 6 digits
      if (!/^\d{6}$/.test(pin)) {
        return NextResponse.json({ error: "PIN must be exactly 6 digits" }, { status: 400 });
      }

      // Check email not already taken
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return NextResponse.json({ error: "This email is already registered" }, { status: 400 });
      }

      // Hash the PIN and store in OtpToken for later use
      const pinHash = await bcrypt.hash(pin, 10);
      const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Upsert OTP record
      await prisma.otpToken.deleteMany({ where: { phone: cleanPhone } });
      await prisma.otpToken.create({
        data: { phone: cleanPhone, email, pinHash, isNewUser: true, expires },
      });

    } else {
      // Returning user path — validate PIN
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

      // Store OTP session
      const expires = new Date(Date.now() + 5 * 60 * 1000);
      await prisma.otpToken.deleteMany({ where: { phone: cleanPhone } });
      await prisma.otpToken.create({
        data: { phone: cleanPhone, isNewUser: false, expires },
      });
    }

    // Send OTP via MSG91
    const response = await sendOTP(cleanPhone);
    if (response.type === "error") {
      return NextResponse.json({ error: response.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
