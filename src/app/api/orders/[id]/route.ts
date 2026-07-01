import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // decode URI component as '#' is often sent as '%23' in the URL, or it might just be the ID.
  const decodedId = decodeURIComponent(id);
  const orderId = decodedId.startsWith('#') ? decodedId : `#${decodedId}`;
  
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (order) {
    const formattedOrder = {
      ...order,
      items: order.items ? (typeof order.items === 'string' ? JSON.parse(order.items) : order.items) : undefined,
      shippingAddress: order.shippingAddress ? (typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress) : undefined
    };
    return Response.json(formattedOrder);
  }

  return Response.json({ error: "Order not found" }, { status: 404 });
}
