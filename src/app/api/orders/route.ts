import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { calculateEkartShippingRate, calculateCombinedWeight } from "@/lib/ekart";

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get("admin_token")?.value;
  const isAdmin = authCookie === "true" || request.headers.get("x-admin-secret") === process.env.ADMIN_SECRET;

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.trim().toLowerCase();
  const phone = searchParams.get("phone")?.trim();
  const userId = searchParams.get("userId")?.trim();
  const name = searchParams.get("name")?.trim().toLowerCase();

  // If not admin and no user session identifier is provided, return empty array to protect privacy
  if (!isAdmin && !email && !phone && !userId && !name) {
    return Response.json([]);
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' }
  });
  
  // Format json items for frontend
  const formattedOrders = orders.map(o => ({
    ...o,
    items: o.items ? (typeof o.items === 'string' ? JSON.parse(o.items) : o.items) : undefined,
    shippingAddress: o.shippingAddress ? (typeof o.shippingAddress === 'string' ? JSON.parse(o.shippingAddress) : o.shippingAddress) : undefined
  }));

  if (isAdmin) {
    return Response.json(formattedOrders);
  }

  // Filter orders by user session identity
  const userOrders = formattedOrders.filter(o => {
    const addr: any = o.shippingAddress || {};
    const orderEmail = (addr.email || (o as any).email || "").toString().trim().toLowerCase();
    const orderPhone = (addr.phone || (o as any).phone || "").toString().trim();
    const orderUserId = (addr.userId || (o as any).userId || "").toString().trim();
    const orderName = (o.customerName || addr.fullName || "").toString().trim().toLowerCase();

    if (email && orderEmail && orderEmail === email) return true;
    if (phone && orderPhone && orderPhone === phone) return true;
    if (userId && orderUserId && orderUserId === userId) return true;
    if (name && orderName && orderName === name && (email || phone || userId || (!orderEmail && !orderPhone))) return true;
    return false;
  });

  return Response.json(userOrders);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.id) {
      const existing = await prisma.order.findUnique({ where: { id: body.id } });
      if (existing) {
        if (body.status === "CANCELLED" || body.status === "Cancelled") {
          const currentStatus = (existing.status || "").toUpperCase();
          if (["SHIPPED", "DELIVERED", "DISPATCHED", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(currentStatus)) {
            return Response.json({ success: false, error: "Order cannot be cancelled after parcel has been dispatched.", message: "Order cannot be cancelled after parcel has been dispatched." }, { status: 200 });
          }
        }
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
      return Response.json({ success: false, error: "Order not found", message: "Order not found" }, { status: 200 });
    }

    const addr = typeof body.shippingAddress === 'object' && body.shippingAddress !== null ? body.shippingAddress : (typeof body.shippingAddress === 'string' ? JSON.parse(body.shippingAddress || "{}") : {});
    const itemsList = Array.isArray(body.items) ? body.items : [];
    const calculatedShipping = calculateEkartShippingRate(calculateCombinedWeight(itemsList), addr.zipCode || addr.pincode, body.paymentMethod || "Online", Number(body.amount) || 0);
    const finalShippingAddress = {
      ...addr,
      email: body.email || addr.email || "",
      phone: body.phone || addr.phone || "",
      userId: body.userId || addr.userId || "",
      shippingFee: addr.shippingFee !== undefined ? addr.shippingFee : (body.shippingFee !== undefined ? body.shippingFee : calculatedShipping.fee),
      courier: addr.courier || calculatedShipping.courier
    };

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
        paymentMethod: body.paymentMethod || "Online",
        items: body.items || [],
        shippingAddress: finalShippingAddress
      }
    });

    return Response.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("POST order failed:", error);
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }
}
