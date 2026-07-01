import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = Number(id);
  
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }
  
  // Parse JSON fields
  const formattedProduct = {
    ...product,
    colors: product.colors ? (typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors) : undefined
  };

  return Response.json(formattedProduct);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);
    const body = await request.json();

    const existing = await prisma.product.findUnique({ where: { id: productId } });

    if (!existing) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        category: body.category !== undefined ? body.category : undefined,
        subcategory: body.subcategory !== undefined ? body.subcategory : undefined,
        price: body.price !== undefined ? Number(body.price) : undefined,
        image: body.image !== undefined ? body.image : undefined,
        badge: body.badge !== undefined ? body.badge : undefined,
        isExclusive: body.isExclusive !== undefined ? body.isExclusive === true : undefined,
        sku: body.sku !== undefined ? body.sku : undefined,
        stock: body.stock !== undefined ? Number(body.stock) : undefined,
        description: body.description !== undefined ? body.description : undefined,
        dimensions: body.dimensions !== undefined ? body.dimensions : undefined,
        weight: body.weight !== undefined ? body.weight : undefined,
        images: body.images !== undefined ? body.images : undefined,
        colors: body.colors !== undefined ? body.colors : undefined,
        originalPrice: body.originalPrice !== undefined ? Number(body.originalPrice) : undefined,
      }
    });

    return Response.json(updated);
  } catch (error) {
    console.error("PUT product failed:", error);
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = Number(id);

  try {
    const deletedProduct = await prisma.product.delete({
      where: { id: productId }
    });
    return Response.json(deletedProduct);
  } catch (error) {
    return Response.json({ error: "Product not found or delete failed" }, { status: 404 });
  }
}
