import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(campaigns);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subject, banner, title, body: letterBody, ctaText, ctaLink } = body;

    if (!subject || !title || !letterBody) {
      return NextResponse.json({ error: 'Subject, title, and letter content are required' }, { status: 400 });
    }

    const activeSubscribers = await prisma.subscriber.findMany({
      where: { status: { not: "unsubscribed" } }
    });
    const activeSubscribersCount = activeSubscribers.length;

    const newCampaign = await prisma.campaign.create({
      data: {
        subject,
        banner: banner || "/images/lookbook_hero.png",
        title,
        body: letterBody,
        ctaText: ctaText || "SHOP NOW",
        ctaLink: ctaLink || "http://localhost:3000",
        date: new Date().toISOString().split('T')[0],
        recipients: activeSubscribersCount || 1
      }
    });

    if (activeSubscribersCount > 0) {
      const htmlTemplate = `
        <div style="font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #333333; padding: 0;">
          <div style="background-color: #00241b; padding: 32px 24px; text-align: center;">
            <h1 style="color: #fed65b; font-size: 28px; margin: 0; letter-spacing: 0.1em; font-family: 'Georgia', serif; text-transform: uppercase;">Marbie Jewels</h1>
          </div>
          ${banner ? `<img src="${banner}" alt="Campaign Banner" style="width: 100%; height: auto; max-height: 400px; object-fit: cover; display: block;" />` : ''}
          <div style="padding: 40px 32px;">
            <h2 style="color: #00241b; font-size: 24px; margin: 0 0 24px 0; font-family: 'Georgia', serif; font-weight: 400;">${title}</h2>
            <div style="color: #555555; font-size: 16px; line-height: 1.8; margin-bottom: 32px; white-space: pre-wrap;">${letterBody}</div>
            ${ctaText && ctaLink ? `
              <div style="text-align: center; margin-top: 40px;">
                <a href="${ctaLink}" style="display: inline-block; background-color: #00241b; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 4px; font-weight: 600; letter-spacing: 0.1em; font-size: 14px; text-transform: uppercase;">
                  ${ctaText}
                </a>
              </div>
            ` : ''}
          </div>
          <div style="background-color: #f7f7f7; padding: 32px; text-align: center; border-top: 1px solid #eeeeee;">
            <p style="color: #888888; font-size: 12px; margin: 0 0 16px 0; line-height: 1.5;">
              You are receiving this email because you subscribed to exclusive updates from Marbie Jewels.<br>
              To unsubscribe, visit your account preferences or reply STOP.
            </p>
            <p style="color: #bbbbbb; font-size: 10px; margin: 0;">&copy; ${new Date().getFullYear()} Marbie Jewels. All rights reserved.</p>
          </div>
        </div>
      `;

      // Import inside the function to avoid circular dependencies during initialization if any
      const { sendEmail } = await import('@/lib/mailer');
      
      const emailPromises = activeSubscribers.map(sub => 
        sendEmail({
          to: sub.email,
          subject: subject,
          html: htmlTemplate
        })
      );

      // Send all emails asynchronously
      await Promise.allSettled(emailPromises);
    }

    console.log(`🚀 Broadcasted newsletter campaign "${subject}" to ${activeSubscribersCount} subscriber mailboxes!`);
    return NextResponse.json({ success: true, campaign: newCampaign, deliveredCount: activeSubscribersCount });
  } catch (error) {
    console.error("Broadcast error:", error);
    return NextResponse.json({ error: 'Failed to send broadcast' }, { status: 500 });
  }
}
