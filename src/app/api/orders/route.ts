import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' }
  });
  
  // Format json items for frontend
  const formattedOrders = orders.map(o => ({
    ...o,
    items: o.items ? (typeof o.items === 'string' ? JSON.parse(o.items) : o.items) : undefined,
    shippingAddress: o.shippingAddress ? (typeof o.shippingAddress === 'string' ? JSON.parse(o.shippingAddress) : o.shippingAddress) : undefined
  }));
  
  return Response.json(formattedOrders);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.id) {
      const existing = await prisma.order.findUnique({ where: { id: body.id } });
      if (existing) {
        const updated = await prisma.order.update({
          where: { id: body.id },
          data: {
            status: body.status !== undefined ? body.status : undefined,
            trackingLink: body.trackingLink !== undefined ? body.trackingLink : undefined,
            trackingPartner: body.trackingPartner !== undefined ? body.trackingPartner : undefined,
            refundRequested: body.refundRequested !== undefined ? body.refundRequested : undefined,
          }
        });
        return Response.json(updated);
      }
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    const newId = `#ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = await prisma.order.create({
      data: {
        id: newId,
        customerName: body.customerName || "Anonymous Buyer",
        initials: body.initials || "AB",
        avatarClass: body.avatarClass || "avatar-sm",
        date: body.date || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        amount: Number(body.amount) || 0,
        status: body.status || "PROCESSING",
        items: body.items || [],
        shippingAddress: body.shippingAddress || {}
      }
    });

    return Response.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("POST order failed:", error);
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }
}
