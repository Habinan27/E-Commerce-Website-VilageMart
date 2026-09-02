import { NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product-service';
import { requireRole } from '@/lib/auth';
import { productSchema } from '@/lib/validations';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || undefined;
    const category = searchParams.get('category') || undefined;
    const province = searchParams.get('province') || undefined;
    const district = searchParams.get('district') || undefined;
    const city = searchParams.get('city') || undefined;
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const minRating = searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined;
    const inStock = searchParams.get('inStock') === 'true';
    const sellerId = searchParams.get('sellerId') || undefined;
    const sort = (searchParams.get('sort') as any) || 'newest';
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 12;

    const results = await ProductService.getProducts({
      query,
      category,
      province,
      district,
      city,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      sellerId,
      sort,
      page,
      limit,
    });

    return NextResponse.json(results);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole(['SELLER', 'ADMIN']);
    if (!session.sellerProfileId) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const product = await ProductService.createProduct(session.sellerProfileId, parsed.data);
    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create product' }, { status: 500 });
  }
}
