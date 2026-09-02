import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { serializeBigInt } from '@/lib/utils';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { status: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(serializeBigInt(categories));
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch categories' }, { status: 500 });
  }
}
