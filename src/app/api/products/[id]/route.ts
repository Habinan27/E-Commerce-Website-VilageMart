import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ProductService } from '@/lib/services/product-service';
import { requireRole } from '@/lib/auth';
import { serializeBigInt } from '@/lib/utils';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    let product;
    if (!isNaN(Number(params.id))) {
      product = await prisma.product.findUnique({
        where: { id: BigInt(params.id) },
        include: {
          category: true,
          seller: { include: { location: true } },
          productImages: {
            orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
          },
        },
      });
    } else {
      product = await ProductService.getProductBySlug(decodeURIComponent(params.id));
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(serializeBigInt(product));
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(['SELLER', 'ADMIN']);
    const body = await request.json();

    const updated = await ProductService.updateProduct(
      params.id,
      session.sellerProfileId || '',
      body,
      session.role === 'ADMIN'
    );

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(['SELLER', 'ADMIN']);
    await ProductService.deleteProduct(
      params.id,
      session.sellerProfileId || '',
      session.role === 'ADMIN'
    );

    return NextResponse.json({ success: true, message: 'Product deleted or deactivated' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete product' }, { status: 500 });
  }
}
