import { NextRequest, NextResponse } from "next/server";
import { createEkartOrder } from "@/lib/ekart";
import { cookies } from "next/headers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");
  if (!token) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { courierId, weight } = await request.json(); // E.g., "Ekart", weight in kg
    
    // In a real application, fetch the full order from your database here.
    // We create a standardized mock order payload to send to the delivery partners.
    const orderData = {
      order_id: id,
      order_date: new Date().toISOString(),
      billing_customer_name: "Customer Name",
      billing_address: "123 Test St",
      billing_city: "Mumbai",
      billing_pincode: "400001",
      billing_state: "Maharashtra",
      billing_phone: "9876543210",
      sub_total: 1500,
      weight: weight || 0.5,
      payment_method: "Prepaid",
    };

    let shippingResponse;

    if (courierId === "Ekart" || !courierId) {
      shippingResponse = await createEkartOrder(orderData);
    } else {
      shippingResponse = await createEkartOrder(orderData);
    }

    // 3. Return the tracking information to the frontend
    return NextResponse.json({
      success: true,
      message: "Order Dispatched Successfully",
      awb: shippingResponse.awb_code,
      courier: shippingResponse.courier_name
    });

  } catch (error: any) {
    console.error(`Error dispatching order:`, error);
    return NextResponse.json({ success: false, error: error.message || "Failed to dispatch order." }, { status: 500 });
  }
}
