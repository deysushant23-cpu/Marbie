import { NextRequest, NextResponse } from "next/server";
import { createEkartOrder } from "@/lib/ekart";

export async function POST(request: NextRequest) {
  try {
    const { orderId, action } = await request.json();

    if (action === "DOWNLOAD_LABEL") {
      return NextResponse.json({
        success: true,
        labelUrl: `/admin/orders/labels?id=${orderId}`
      });
    }

    // For AWB generation or dispatch via Ekart
    const shippingResponse = await createEkartOrder({
      order_id: orderId,
      sub_total: 1500,
      payment_method: "Prepaid",
      weight: 0.5
    });

    const newStatus = action === "DISPATCH" ? "SHIPPED" : action === "GENERATE_AWB" ? "READY_TO_DISPATCH" : "PACKED";

    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        status: newStatus,
        trackingPartner: "Ekart Logistics",
        trackingLink: `https://ekartlogistics.com/shipmenttrack/${shippingResponse.awb_code}`,
        awbCode: shippingResponse.awb_code
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process Ekart shipping action" }, { status: 500 });
  }
}
