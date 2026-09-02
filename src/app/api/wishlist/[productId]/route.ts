import { NextResponse } from 'next/server';
import { WishlistService } from '@/lib/services/wishlist-service';
import { requireAuth } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await requireAuth();
    const result = await WishlistService.removeFromWishlist(session.id, params.productId);
    return NextResponse.json(result);
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || 'Failed to remove saved product' }, { status: 400 });
  }
}
