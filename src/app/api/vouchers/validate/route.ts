import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { code, orderAmount } = await request.json();

    if (!code || !code.trim()) {
      return NextResponse.json({ error: "Please enter a voucher code." }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const voucher = await prisma.voucher.findUnique({ where: { code: cleanCode } });

    if (!voucher || !voucher.isActive) {
      return NextResponse.json({ error: "Invalid or inactive voucher code." }, { status: 404 });
    }

    // Check expiry date
    if (voucher.expiresAt) {
      const expiry = new Date(voucher.expiresAt);
      const now = new Date();
      if (now > expiry) {
        return NextResponse.json({ error: "This voucher has expired!" }, { status: 400 });
      }
    }

    // Check user limit ("certain amount of users")
    if (voucher.usedCount >= voucher.maxUsers) {
      return NextResponse.json({ 
        error: `This voucher has reached its maximum redemption limit of ${voucher.maxUsers} customers!` 
      }, { status: 400 });
    }

    // Check minimum order amount
    const amount = Number(orderAmount) || 0;
    if (amount < voucher.minOrderAmount) {
      return NextResponse.json({ 
        error: `A minimum cart value of ₹${voucher.minOrderAmount.toLocaleString()} is required to unlock this voucher.` 
      }, { status: 400 });
    }

    // Calculate discount
    let discountAmount = 0;
    if (voucher.discountType === "PERCENTAGE") {
      discountAmount = Math.round(amount * (voucher.discountValue / 100));
      if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
        discountAmount = voucher.maxDiscount;
      }
    } else {
      // FIXED discount
      discountAmount = Math.min(voucher.discountValue, amount);
    }

    return NextResponse.json({
      success: true,
      code: voucher.code,
      discountAmount,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      message: `Voucher applied! You save ₹${discountAmount.toLocaleString()}!`,
    });
  } catch (error: any) {
    console.error("❌ [Voucher Validate Error]:", error);
    return NextResponse.json({ error: "Failed to validate voucher." }, { status: 500 });
  }
}
