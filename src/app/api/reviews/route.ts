import { NextResponse } from 'next/server';
import { ReviewService } from '@/lib/services/review-service';
import { requireAuth } from '@/lib/auth';
import { reviewSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const review = await ReviewService.createReview(session.id, parsed.data);
    return NextResponse.json(review, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to submit review' }, { status: 400 });
  }
}
