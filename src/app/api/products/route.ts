import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search");
  
  const products = await prisma.product.findMany();
  const reviews = await prisma.review.findMany();
  
  // Compute ratings
  const productsWithReviews = products.map(p => {
    const productReviews = reviews.filter(r => r.product === p.name && r.id > 1000); 
    const reviewCount = productReviews.length;
    const rating = reviewCount > 0 ? productReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0;
    
    // Parse json fields back to array/object for frontend
    return { 
      ...p, 
      colors: p.colors ? (typeof p.colors === 'string' ? JSON.parse(p.colors) : p.colors) : undefined,
      rating, 
      reviewCount 
    };
  });

  const cacheHeaders = {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  };

  if (search) {
    const query = search.toLowerCase();
    const filtered = productsWithReviews.filter(p => 
      (p.name || "").toLowerCase().includes(query) || 
      (p.category || "").toLowerCase().includes(query) ||
      (p.badge && p.badge.toLowerCase().includes(query))
    );
    return Response.json(filtered, cacheHeaders);
  }

  return Response.json(productsWithReviews, cacheHeaders);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newProduct = await prisma.product.create({
      data: {
        name: body.name || "Unnamed Product",
        category: body.category || "necklaces",
        subcategory: body.subcategory || `${body.category?.toUpperCase() || "NECKLACE"} • Gold`,
        price: Number(body.price) || 0,
        image: body.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuAI-c2R_MXDIOfNvz87YUtcqrSZ4ZKgkuG5GUd68WDvdGa8RPMznL8ghosKcSdBNcsJSl9aecvbKUIFmVk2p2c_CzFR7gylPKdc9dqhjqG-Qz5MTFShp7dtxOoaKSw29Xkv9mLJaEPzazViC9AaEpMuyLUc-PAEXphKWIcf_cSoUtzK5UuPIHSrveSTYN-_BlSJQviYHZw-0-ZWE692n6yZMZ3j6N98Ns6vZA6B7BeDBWPqxVuSixEYmjuOIMqaxbG6jW1zXlxzyjR1",
        badge: body.badge || undefined,
        isExclusive: body.isExclusive === true,
        sku: body.sku || `AUR-PROD-${Math.floor(Math.random() * 10000)}`,
        stock: Number(body.stock) || 0,
        description: body.description || "",
        dimensions: body.dimensions || "5cm x 3cm",
        weight: body.weight || "15g",
        images: body.images || [],
        colors: body.colors || [],
        originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      }
    });

    return Response.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("POST product failed:", error);
    return Response.json({ error: "Invalid product payload" }, { status: 400 });
  }
}
