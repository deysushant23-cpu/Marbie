import { NextRequest, NextResponse } from "next/server";
import { getEkartToken } from "@/lib/ekart";

export async function GET(request: NextRequest) {
  try {
    const wbn = request.nextUrl.searchParams.get("wbn") || request.nextUrl.searchParams.get("id");

    if (!wbn) {
      return NextResponse.json({ error: "Tracking ID (wbn) parameter is required." }, { status: 400 });
    }

    const token = await getEkartToken();

    // If running in simulation mode or if credentials are not configured yet
    if (token === "SIMULATED_EKART_TOKEN" || wbn.startsWith("EKART-") || wbn.startsWith("simulated")) {
      return NextResponse.json({ 
        error: "Simulation mode active. Authentic Ekart PDF labels can only be downloaded from Ekart Logistics servers once real EKART_CLIENT_ID, EKART_USERNAME, and EKART_PASSWORD are configured in your environment.",
        is_simulated: true,
        preview_url: `/admin/orders/labels?id=${wbn}`
      }, { status: 200 });
    }

    const BASE_URL = "https://app.elite.ekartlogistics.in";
    const res = await fetch(`${BASE_URL}/api/v1/package/label`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ ids: [wbn] })
    });

    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="ekart_authentic_label_${wbn}.pdf"`
        }
      });
    }

    const errText = await res.text();
    console.error("❌ [Ekart PDF Label Download Error]:", res.status, errText);
    return NextResponse.json({ 
      error: `Failed to download PDF label from Ekart server (${res.status}): ${errText}`,
      fallback_preview_url: `/admin/orders/labels?id=${wbn}`
    }, { status: res.status });

  } catch (err: any) {
    console.error("❌ [Ekart PDF Label Route Exception]:", err);
    return NextResponse.json({ error: err.message || "Failed to download Ekart label" }, { status: 500 });
  }
}
