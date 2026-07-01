import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const config = await prisma.siteConfig.findFirst();
    const marketing = (config?.marketing as any) || {};
    return NextResponse.json({
      title: marketing.trousseauTitle || "THE ROYAL BRIDAL TROUSSEAU",
      subtitle: marketing.trousseauSubtitle || "INTERACTIVE CURATION",
      occasions: marketing.trousseau || []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch trousseau config' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, subtitle, occasions } = body;
    
    const config = await prisma.siteConfig.findFirst();
    const currentMarketing = (config?.marketing as any) || {};

    const updatedMarketing = {
      ...currentMarketing,
      ...(title !== undefined ? { trousseauTitle: title } : {}),
      ...(subtitle !== undefined ? { trousseauSubtitle: subtitle } : {}),
      ...(Array.isArray(occasions) ? { trousseau: occasions } : {})
    };

    if (config) {
      await prisma.siteConfig.update({
        where: { id: config.id },
        data: { marketing: updatedMarketing }
      });
    } else {
      await prisma.siteConfig.create({
        data: { marketing: updatedMarketing }
      });
    }

    return NextResponse.json({ success: true, marketing: updatedMarketing });
  } catch (error) {
    console.error("Failed to update trousseau config:", error);
    return NextResponse.json({ error: 'Failed to update trousseau config' }, { status: 500 });
  }
}
