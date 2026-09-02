import { NextResponse } from 'next/server';
import { WishlistService } from '@/lib/services/wishlist-service';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await requireAuth();
    const wishlist = await WishlistService.getOrCreateWishlist(session.id);
    return NextResponse.json(wishlist);
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Please sign in to view your saved products' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || 'Failed to fetch saved products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const result = await WishlistService.toggleWishlist(session.id, productId.toString());
    return NextResponse.json(result);
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Please sign in to save products' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || 'Failed to update saved products' }, { status: 400 });
  }
}
