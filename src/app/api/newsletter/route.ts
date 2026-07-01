import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const subscribers = await prisma.subscriber.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(subscribers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const existing = await prisma.subscriber.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existing) {
      return NextResponse.json({ success: true, message: 'Already subscribed to newsletter' });
    }

    const newSub = await prisma.subscriber.create({
      data: {
        email: email.toLowerCase().trim(),
        date: new Date().toISOString().split('T')[0],
        status: "active"
      }
    });

    console.log(`✅ Saved newsletter subscription: ${email}`);
    return NextResponse.json({ success: true, subscriber: newSub, message: 'Subscribed successfully' });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (id) {
      await prisma.subscriber.delete({ where: { id } });
    } else if (email) {
      await prisma.subscriber.delete({ where: { email: email.toLowerCase() } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 });
  }
}
