import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const vouchers = await prisma.voucher.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(vouchers);
  } catch (error: any) {
    console.error("❌ [GET Vouchers Error]:", error);
    return NextResponse.json({ error: "Failed to fetch vouchers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = (body.code || "").trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ error: "Voucher code is required." }, { status: 400 });
    }

    const existing = await prisma.voucher.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ error: `Voucher code "${code}" already exists.` }, { status: 400 });
    }

    const newVoucher = await prisma.voucher.create({
      data: {
        code,
        discountType: body.discountType || "PERCENTAGE",
        discountValue: Number(body.discountValue) || 10,
        minOrderAmount: Number(body.minOrderAmount) || 0,
        maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : null,
        maxUsers: Number(body.maxUsers) || 100,
        usedCount: 0,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        expiresAt: body.expiresAt || null,
      },
    });

    return NextResponse.json(newVoucher, { status: 201 });
  } catch (error: any) {
    console.error("❌ [POST Voucher Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to create voucher" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "Voucher ID is required." }, { status: 400 });
    }

    const updated = await prisma.voucher.update({
      where: { id: Number(body.id) },
      data: {
        code: body.code ? body.code.trim().toUpperCase() : undefined,
        discountType: body.discountType !== undefined ? body.discountType : undefined,
        discountValue: body.discountValue !== undefined ? Number(body.discountValue) : undefined,
        minOrderAmount: body.minOrderAmount !== undefined ? Number(body.minOrderAmount) : undefined,
        maxDiscount: body.maxDiscount !== undefined ? (body.maxDiscount ? Number(body.maxDiscount) : null) : undefined,
        maxUsers: body.maxUsers !== undefined ? Number(body.maxUsers) : undefined,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
        expiresAt: body.expiresAt !== undefined ? body.expiresAt : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("❌ [PUT Voucher Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to update voucher" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Voucher ID is required." }, { status: 400 });
    }

    await prisma.voucher.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true, message: "Voucher deleted successfully." });
  } catch (error: any) {
    console.error("❌ [DELETE Voucher Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to delete voucher" }, { status: 500 });
  }
}
