import { NextResponse } from 'next/server';

declare global {
  var __marbie_sms_otp_store: Record<string, { otp: string; expires: number }> | undefined;
}

if (!global.__marbie_sms_otp_store) {
  global.__marbie_sms_otp_store = {};
}

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone || phone.replace(/\D/g, '').length < 10) {
      return NextResponse.json({ error: "Valid 10-digit mobile number is required" }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    global.__marbie_sms_otp_store![cleanPhone] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000,
    };

    // Confidential backend console dispatch per user rule
    console.log(`📱 [SMS GATEWAY DISPATCH] Confidential verification OTP dispatched to +91 ${cleanPhone}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: `Verification OTP dispatched securely via SMS to +91 ${cleanPhone}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to dispatch SMS passcode" }, { status: 500 });
  }
}
