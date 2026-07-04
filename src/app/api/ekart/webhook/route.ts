import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("Ekart Webhook received:", body);

    // 1. Verify webhook signature/secret securely
    const secret = process.env.EKART_WEBHOOK_SECRET;
    if (secret) {
      const incomingSecret =
        req.headers.get("x-ekart-signature") ||
        req.headers.get("x-webhook-secret") ||
        req.headers.get("authorization")?.replace("Bearer ", "") ||
        body.secret ||
        body.token;

      if (incomingSecret !== secret) {
        console.warn("Unauthorized Ekart webhook attempt.");
        return NextResponse.json(
          { error: "Invalid webhook secret" },
          { status: 401 }
        );
      }
    }

    // 2. Extract tracking IDs and status from Ekart payload
    const orderId = body.order_id || body.orderId || body.client_order_id;
    const awb = body.awb || body.awb_number || body.tracking_id;
    const ekartStatus = (body.status || body.current_status || "").toLowerCase();

    // Map Ekart status to your Marbie database status
    let mappedStatus: string | undefined;
    if (ekartStatus.includes("deliver")) {
      mappedStatus = "DELIVERED";
    } else if (
      ekartStatus.includes("transit") ||
      ekartStatus.includes("out for delivery") ||
      ekartStatus.includes("pickup") ||
      ekartStatus.includes("shipped")
    ) {
      mappedStatus = "SHIPPED";
    } else if (ekartStatus.includes("rto") || ekartStatus.includes("return")) {
      mappedStatus = "REFUNDED";
    }

    // 3. Update order status automatically in your database
    if (orderId || awb) {
      // Find matching order either by ID or AWB code
      const existingOrder = await prisma.order.findFirst({
        where: {
          OR: [
            ...(orderId ? [{ id: orderId }, { id: `#ORD-${orderId}` }] : []),
            ...(awb ? [{ awbCode: awb }] : []),
          ],
        },
      });

      if (existingOrder) {
        await prisma.order.update({
          where: { id: existingOrder.id },
          data: {
            status: mappedStatus || existingOrder.status,
            trackingPartner: "Ekart Logistics",
            awbCode: awb || existingOrder.awbCode,
          },
        });
        console.log(`Updated Order ${existingOrder.id} status to ${mappedStatus || existingOrder.status}`);
      } else {
        console.log(`Ekart Webhook: Order not found for ID: ${orderId}, AWB: ${awb}`);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Ekart Webhook Error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
