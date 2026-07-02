import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_T8aT6lPagbTyCA",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "mKhCf4jOY9IV7IYQm0x90yZj",
    });

    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const orderOptions = {
      amount: Math.round(amount * 100), // Amount in paise (multiply by 100)
      currency: "INR",
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };

    const order = await razorpay.orders.create(orderOptions);

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_live_T8aT6lPagbTyCA"
    });
  } catch (error) {
    console.error("Razorpay Order Creation Error:", error);
    return NextResponse.json(
      { error: "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}
