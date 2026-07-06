import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || !code.trim()) {
      return NextResponse.json({ error: "Voucher code is required." }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Increment usedCount by 1
    const updated = await prisma.voucher.update({
      where: { code: cleanCode },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true, usedCount: updated.usedCount });
  } catch (error: any) {
    console.error("❌ [Voucher Claim Error]:", error);
    return NextResponse.json({ error: "Failed to claim voucher." }, { status: 500 });
  }
}
