/**
 * Independent Blue Dart API Integration
 * Requires BLUEDART_LOGIN_ID and BLUEDART_LICENSE_KEY in .env.local
 */

const BASE_URL = "https://apigateway.bluedart.com/in/transportation/token/v1"; 
const API_URL = "https://apigateway.bluedart.com/in/transportation/waybill/v1";

async function getBlueDartToken() {
  const loginId = process.env.BLUEDART_LOGIN_ID;
  const licenseKey = process.env.BLUEDART_LICENSE_KEY;

  if (!loginId || !licenseKey) {
    throw new Error("Missing Blue Dart credentials in environment variables.");
  }

  // To get a JWT token from Blue Dart, typically you pass ClientID and ClientSecret 
  // However, older Blue Dart APIs pass LoginID and LicenseKey directly in headers.
  // We will assume modern JWT authentication flow for this implementation.
  const res = await fetch(`${BASE_URL}/login`, {
    method: "GET",
    headers: {
      "ClientID": loginId,
      "ClientSecret": licenseKey
    }
  });

  if (!res.ok) {
    console.error("Blue Dart Auth Failed:", await res.text());
    throw new Error("Failed to authenticate with Blue Dart.");
  }

  const data = await res.json();
  return data.JWTToken;
}

// 1. Create Order (Generate Waybill)
export async function createBlueDartOrder(orderData: any) {
  const token = await getBlueDartToken();

  const payload = {
    Request: {
      Consignee: {
        ConsigneeName: orderData.billing_customer_name,
        ConsigneeAddress1: orderData.billing_address,
        ConsigneePincode: orderData.billing_pincode,
        ConsigneeMobile: orderData.billing_phone
      },
      ReturnAddress: {
        ManifestNumber: `MF-${orderData.order_id}`,
        ReturnAddress1: "Marbie Warehouse, Surat",
        ReturnPincode: "394230",
        ReturnMobile: "9876543210"
      },
      Services: {
        PieceCount: 1,
        ActualWeight: orderData.weight || 0.5,
        PackType: "Non-Document",
        SubProductCode: "P", // E.g., 'P' for standard parcel
        CollectableAmount: orderData.payment_method === "COD" ? orderData.sub_total : 0,
        DeclaredValue: orderData.sub_total
      }
    },
    Profile: {
      Api_type: "S",
      LicenceKey: process.env.BLUEDART_LICENSE_KEY,
      LoginID: process.env.BLUEDART_LOGIN_ID
    }
  };

  const res = await fetch(`${API_URL}/GenerateWayBill`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "JWTToken": token
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    console.error("Blue Dart API Failed:", await res.text());
    throw new Error("Failed to create order in Blue Dart");
  }

  const responseData = await res.json();
  
  if (responseData.GenerateWayBillResult && responseData.GenerateWayBillResult.AWBNo) {
    return {
      success: true,
      awb_code: responseData.GenerateWayBillResult.AWBNo,
      courier_name: "Blue Dart"
    };
  }

  throw new Error("Blue Dart Order Creation Failed: " + JSON.stringify(responseData));
}
