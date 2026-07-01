import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mailer';

// Global memory store for active OTP passcodes
declare global {
  var __marbie_otp_store: Record<string, { otp: string; expires: number }> | undefined;
  var __marbie_transporter: any | undefined;
}

if (!global.__marbie_otp_store) {
  global.__marbie_otp_store = {};
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: "Valid executive email address is required" }, { status: 400 });
    }

    // Generate secure 6-digit passcode
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const cleanEmail = email.toLowerCase().trim();

    // Store passcode valid for 5 minutes
    global.__marbie_otp_store![cleanEmail] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000,
    };

    console.log(`🔐 [ROYAL VAULT SECURITY] Generated OTP for ${cleanEmail}: ${otp}`);

    const mailOptions = {
      from: `"Marbie Jewels Security Vault" <security@marbiejewels.com>`,
      to: email,
      subject: `[${otp}] Your Marbie Jewels Executive Management OTP`,
      html: `
        <div style="font-family: 'Georgia', serif; max-width: 500px; margin: 0 auto; background-color: #00241b; color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #fed65b; text-align: center;">
          <div style="width: 56px; height: 56px; line-height: 56px; border-radius: 50%; background-color: rgba(254, 214, 91, 0.2); color: #fed65b; font-size: 28px; margin: 0 auto 20px;">🛡️</div>
          <h1 style="color: #fed65b; font-size: 24px; margin: 0 0 12px 0; letter-spacing: 0.05em;">ROYAL VAULT ACCESS</h1>
          <p style="color: #a0d1c0; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
            You have requested executive authorization to unlock the Marbie Jewels Management Suite. Enter the one-time passcode below:
          </p>
          <div style="background-color: #063b2f; border: 2px dashed #fed65b; padding: 20px; border-radius: 12px; font-size: 32px; font-weight: bold; letter-spacing: 0.25em; color: #fed65b; margin-bottom: 24px;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: rgba(255,255,255,0.5); margin: 0;">
            This passcode expires in 5 minutes. If you did not initiate this login, contact master security immediately.
          </p>
        </div>
      `,
    };

    await sendEmail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Verification passcode dispatched securely to your email inbox."
    });
  } catch (error: any) {
    console.error("OTP Dispatch error:", error);
    return NextResponse.json({ error: "Failed to dispatch email passcode: " + (error.message || "Unknown error") }, { status: 500 });
  }
}
