import { NextResponse } from 'next/server';
import { removeAuthCookie, getSessionUser } from '@/lib/auth';

export async function POST() {
  await removeAuthCookie();
  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user: session });
}
