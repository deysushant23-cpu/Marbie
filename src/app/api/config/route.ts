import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    let config = await prisma.siteConfig.findFirst();
    if (!config) {
      config = await prisma.siteConfig.create({
        data: {
          isMaintenanceMode: false,
          heroCarouselRatio: "21/9",
          featuredProductIds: [],
          productCategories: ["NECKLACES", "EARRINGS", "RINGS", "BRACELETS"],
        }
      });
    }
    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error("Failed to fetch config data:", error);
    return NextResponse.json({ error: 'Failed to fetch config data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newConfig = await request.json();
    
    const existingConfig = await prisma.siteConfig.findFirst();
    let updatedConfig;

    if (existingConfig) {
      updatedConfig = await prisma.siteConfig.update({
        where: { id: existingConfig.id },
        data: newConfig
      });
    } else {
      updatedConfig = await prisma.siteConfig.create({
        data: newConfig
      });
    }
    
    revalidatePath('/', 'layout');
    
    return NextResponse.json({ success: true, config: updatedConfig });
  } catch (error) {
    console.error("Failed to update config:", error);
    return NextResponse.json({ error: 'Failed to update config data' }, { status: 500 });
  }
}
