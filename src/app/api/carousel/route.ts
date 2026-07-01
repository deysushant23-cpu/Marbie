import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const config = await prisma.siteConfig.findFirst();
    const carousel = (config?.carousel as any) || [];
    return NextResponse.json(carousel, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch carousel data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newSlides = await request.json();
    const config = await prisma.siteConfig.findFirst();

    if (config) {
      await prisma.siteConfig.update({
        where: { id: config.id },
        data: { carousel: newSlides }
      });
    } else {
      await prisma.siteConfig.create({
        data: { carousel: newSlides }
      });
    }

    return NextResponse.json({ success: true, carousel: newSlides });
  } catch (error) {
    console.error("Failed to save carousel:", error);
    return NextResponse.json({ error: 'Failed to save carousel data' }, { status: 500 });
  }
}
