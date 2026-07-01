import { NextResponse } from "next/server";
import { sendOTP } from "@/lib/msg91";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone || phone.length < 10) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    const response = await sendOTP(phone);

    if (response.type === "error") {
      return NextResponse.json({ error: response.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
