import { NextRequest, NextResponse } from "next/server";
import { calculateEkartShippingRate, calculateCombinedWeight } from "@/lib/ekart";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { deliveryPincode, weight, paymentMethod, orderAmount, items } = body;

    let weightGrams = 150;
    if (items && Array.isArray(items) && items.length > 0) {
      weightGrams = calculateCombinedWeight(items);
    } else if (weight !== undefined && weight !== null && weight !== "") {
      if (typeof weight === "number" && !isNaN(weight) && weight > 0) {
        weightGrams = (weight < 1 || (weight <= 5 && weight % 1 !== 0)) ? weight * 1000 : weight;
      } else if (typeof weight === "string") {
        const str = weight.toLowerCase().trim();
        const num = parseFloat(str.replace(/[^0-9.]/g, ""));
        if (!isNaN(num) && num > 0) {
          weightGrams = str.includes("kg") ? num * 1000 : num;
        }
      }
    }

    const rate = calculateEkartShippingRate(
      weightGrams,
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
      shippingFee: 65,
      zone: "National"
    });
  }
}
