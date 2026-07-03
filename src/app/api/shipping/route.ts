import { NextRequest } from "next/server";
// import { checkServiceability } from "@/lib/shiprocket";

export async function POST(request: NextRequest) {
  // TODO: Implement custom pincode serviceability check with Ekart Logistics
  return Response.json({
    serviceable: true,
    partner: "Ekart Logistics"
  });
}
