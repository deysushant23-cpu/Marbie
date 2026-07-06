import { NextRequest, NextResponse } from "next/server";
import { calculateEkartShippingRate } from "@/lib/ekart";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { deliveryPincode, weight, paymentMethod, orderAmount } = body;

    const rate = calculateEkartShippingRate(
      Number(weight) ? Number(weight) * 1000 : 500,
      deliveryPincode,
      paymentMethod || "Online",
      Number(orderAmount) || 0
    );

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + rate.days);

    return NextResponse.json({
      serviceable: true,
      partner: "Ekart Logistics",
      courier: rate.courier,
      days: rate.days,
      estimatedDeliveryDate: targetDate.toISOString(),
      shippingFee: rate.fee,
      baseRate: rate.baseRate,
      codCharge: rate.codCharge,
      zone: rate.zone
    });
  } catch (err) {
    console.error("Shipping rate calculation error:", err);
    return NextResponse.json({
      serviceable: true,
      partner: "Ekart Logistics",
      courier: "Ekart Logistics Elite",
      days: 4,
      estimatedDeliveryDate: new Date(Date.now() + 4 * 86400000).toISOString(),
      shippingFee: 80,
      zone: "National"
    });
  }
}
