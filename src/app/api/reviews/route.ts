import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action } = body;

    if (action === "CREATE" || (!action && body.author && body.content)) {
      const newReview = await prisma.review.create({
        data: {
          title: body.title || "Wonderful experience!",
          author: body.author || "Royal Bride",
          time: "Just now",
          rating: Number(body.rating) || 5,
          content: body.content,
          criticism: body.criticism || "",
          product: body.product || "Marbie Fine Jewelry",
          verified: true,
          isFeatured: false,
          image: body.image || "/images/Beautiful_Indian_woman_with_soft_202606232200.jpeg"
        }
      });
      return NextResponse.json({ success: true, review: newReview });
    }

    const reviewId = Number(id);
    if (!reviewId) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    if (action === "APPROVE") {
      const updated = await prisma.review.update({
        where: { id: reviewId },
        data: { flagged: false }
      });
      return NextResponse.json({ success: true, review: updated });
    }

    if (action === "ARCHIVE" || action === "DISMISS" || action === "DELETE") {
      const removed = await prisma.review.delete({
        where: { id: reviewId }
      });
      return NextResponse.json({ success: true, removedReview: removed });
    }

    if (action === "FEATURE") {
      const updated = await prisma.review.update({
        where: { id: reviewId },
        data: { isFeatured: true }
      });
      return NextResponse.json({ success: true, review: updated });
    }

    if (action === "UNFEATURE") {
      const updated = await prisma.review.update({
        where: { id: reviewId },
        data: { isFeatured: false }
      });
      return NextResponse.json({ success: true, review: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST review failed:", error);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
