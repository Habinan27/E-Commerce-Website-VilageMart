import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await requireRole(['ADMIN', 'SELLER']);

    const announcements = await prisma.announcement.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });

    const formatted = announcements.map((a) => ({
      id: a.id.toString(),
      sellerId: a.sellerId?.toString() || null,
      title: a.title,
      content: a.content,
      contentTamil: a.contentTamil,
      linkUrl: a.linkUrl,
      linkLabel: a.linkLabel,
      theme: a.theme,
      isMarquee: a.isMarquee,
      speed: a.speed,
      isActive: a.isActive,
      displayOrder: a.displayOrder,
      targetAudience: a.targetAudience,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    }));

    return NextResponse.json({ announcements: formatted });
  } catch (error: any) {
    const status = error.message === 'FORBIDDEN' ? 403 : error.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json(
      { error: error.message || 'Unauthorized or failed to fetch' },
      { status }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(['ADMIN', 'SELLER']);
    const body = await request.json();

    if (!body.content || typeof body.content !== 'string') {
      return NextResponse.json(
        { error: 'Announcement content text is required' },
        { status: 400 }
      );
    }

    const created = await prisma.announcement.create({
      data: {
        title: body.title?.trim() || null,
        content: body.content.trim(),
        contentTamil: body.contentTamil?.trim() || null,
        linkUrl: body.linkUrl?.trim() || null,
        linkLabel: body.linkLabel?.trim() || null,
        theme: body.theme || 'emerald',
        isMarquee: body.isMarquee !== undefined ? Boolean(body.isMarquee) : true,
        speed: body.speed ? Number(body.speed) : 30,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        displayOrder: body.displayOrder ? Number(body.displayOrder) : 0,
        targetAudience: body.targetAudience || 'CUSTOMERS',
      },
    });

    return NextResponse.json({
      success: true,
      announcement: {
        id: created.id.toString(),
        sellerId: created.sellerId?.toString() || null,
        title: created.title,
        content: created.content,
        contentTamil: created.contentTamil,
        linkUrl: created.linkUrl,
        linkLabel: created.linkLabel,
        theme: created.theme,
        isMarquee: created.isMarquee,
        speed: created.speed,
        isActive: created.isActive,
        displayOrder: created.displayOrder,
        targetAudience: created.targetAudience,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
    });
  } catch (error: any) {
    const status = error.message === 'FORBIDDEN' ? 403 : error.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to create announcement' },
      { status }
    );
  }
}
