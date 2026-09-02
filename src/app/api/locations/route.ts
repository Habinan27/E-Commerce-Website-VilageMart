import { NextResponse } from 'next/server';
import { LocationService } from '@/lib/services/location-service';

export async function GET() {
  try {
    const hierarchy = await LocationService.getFullHierarchy();
    return NextResponse.json(hierarchy);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch locations' }, { status: 500 });
  }
}
