import { NextRequest } from "next/server";
// import { checkServiceability } from "@/lib/shiprocket";

export async function POST(request: NextRequest) {
  // TODO: Implement new shipping logic with BlueDart/Delhivery
  return Response.json({
    serviceable: false,
    error: "Shipping module is currently being updated."
  });
}
