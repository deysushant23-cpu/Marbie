import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { code, orderAmount } = await request.json();

    if (!code || !code.trim()) {
      return NextResponse.json({ error: "Please enter a voucher code." }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    let voucher: any = null;
    try {
      voucher = await prisma.voucher.findUnique({ where: { code: cleanCode } });
    } catch (e) {
      console.warn("Prisma lookup failed, falling back to built-in vouchers:", e);
    }

    // Built-in fallback promotional vouchers so offers and discounts always work
    const DEFAULT_VOUCHERS: Record<string, { discountType: string; discountValue: number; minOrderAmount: number; maxDiscount: number | null; maxUsers: number }> = {
      MARBIE10: { discountType: "PERCENTAGE", discountValue: 10, minOrderAmount: 0, maxDiscount: 2000, maxUsers: 2000 },
      ROYAL20: { discountType: "PERCENTAGE", discountValue: 20, minOrderAmount: 2000, maxDiscount: 5000, maxUsers: 1000 },
      WELCOME10: { discountType: "PERCENTAGE", discountValue: 10, minOrderAmount: 500, maxDiscount: 1500, maxUsers: 5000 },
      SURAT500: { discountType: "FIXED", discountValue: 500, minOrderAmount: 3000, maxDiscount: null, maxUsers: 1000 },
      FESTIVE15: { discountType: "PERCENTAGE", discountValue: 15, minOrderAmount: 1500, maxDiscount: 3000, maxUsers: 2000 },
      FIRST10: { discountType: "PERCENTAGE", discountValue: 10, minOrderAmount: 0, maxDiscount: 1000, maxUsers: 5000 },
      FREESHIP: { discountType: "FIXED", discountValue: 65, minOrderAmount: 499, maxDiscount: null, maxUsers: 5000 },
    };

    if (!voucher && DEFAULT_VOUCHERS[cleanCode]) {
      const def = DEFAULT_VOUCHERS[cleanCode];
      try {
        voucher = await prisma.voucher.create({
          data: {
            code: cleanCode,
            discountType: def.discountType,
            discountValue: def.discountValue,
            minOrderAmount: def.minOrderAmount,
            maxDiscount: def.maxDiscount,
            maxUsers: def.maxUsers,
            usedCount: 0,
            isActive: true,
          }
        });
      } catch (errCreate) {
        voucher = {
          code: cleanCode,
          discountType: def.discountType,
          discountValue: def.discountValue,
          minOrderAmount: def.minOrderAmount,
          maxDiscount: def.maxDiscount,
          maxUsers: def.maxUsers,
          usedCount: 0,
          isActive: true,
          expiresAt: null
        };
      }
    }

    if (!voucher || !voucher.isActive) {
      return NextResponse.json({ error: "Invalid or inactive voucher code." }, { status: 404 });
    }

    // Check expiry date
    if (voucher.expiresAt && voucher.expiresAt.trim() !== "") {
      const expiry = new Date(voucher.expiresAt);
      const now = new Date();
      if (!isNaN(expiry.getTime()) && now > expiry) {
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
      minOrderAmount: voucher.minOrderAmount,
      maxDiscount: voucher.maxDiscount,
      message: `Voucher applied! You save ₹${discountAmount.toLocaleString()}!`,
    });
  } catch (error: any) {
    console.error("❌ [Voucher Validate Error]:", error);
    return NextResponse.json({ error: "Failed to validate voucher." }, { status: 500 });
  }
}
