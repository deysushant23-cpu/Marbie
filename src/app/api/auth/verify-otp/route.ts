import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone and OTP are required" }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, "").length === 10
      ? "91" + phone.replace(/\D/g, "")
      : phone.replace(/\D/g, "");

    if (otp.length !== 6) {
      return NextResponse.json({ error: "OTP must be 6 digits" }, { status: 400 });
    }

    // Find OTP record in DB
    const otpRecord = await prisma.otpToken.findFirst({
      where: {
        phone: cleanPhone,
        expires: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json({ error: "OTP expired. Please request a new one." }, { status: 400 });
    }

    // Verify OTP against stored value
    if (!otpRecord.otp || otpRecord.otp !== otp.trim()) {
      return NextResponse.json({ error: "Invalid OTP. Please try again." }, { status: 401 });
    }

    // Clean up used OTP
    await prisma.otpToken.deleteMany({ where: { phone: cleanPhone } });

    // Issue a short-lived verified token for NextAuth to consume
    const verifiedToken = await bcrypt.hash(`${cleanPhone}:verified`, 10);

    return NextResponse.json({
      success: true,
      phone: cleanPhone,
      verifiedToken,
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
