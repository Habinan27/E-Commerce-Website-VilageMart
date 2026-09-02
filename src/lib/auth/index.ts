import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies, headers } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import type { UserSession, Role } from '@/types';

const AUTH_SECRET = process.env.AUTH_SECRET || 'oorumart-super-secret-jwt-key-sri-lanka-2026';
const COOKIE_NAME = 'oorumart_session';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signJwt(payload: object): string {
  return jwt.sign(payload, AUTH_SECRET, { expiresIn: '7d' });
}

export function verifyJwt<T>(token: string): T | null {
  try {
    return jwt.verify(token, AUTH_SECRET) as T;
  } catch (error) {
    return null;
  }
}

export async function getSessionUser(): Promise<UserSession | null> {
  try {
    // 1. Try to get token from Authorization Bearer header (for mobile API or REST)
    const headerList = headers();
    const authHeader = headerList.get('authorization');
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // 2. Otherwise get from HTTP-only cookie
    if (!token) {
      const cookieStore = cookies();
      token = cookieStore.get(COOKIE_NAME)?.value;
    }

    if (!token) return null;

    const decoded = verifyJwt<{ id: string }>(token);
    if (!decoded || !decoded.id) return null;

    const user = await prisma.user.findUnique({
      where: { id: BigInt(decoded.id) },
      include: {
        sellerProfile: true,
      },
    });

    if (!user || user.status === 'SUSPENDED') return null;

    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      avatarUrl: user.avatarUrl,
      sellerProfileId: user.sellerProfile ? user.sellerProfile.id.toString() : null,
      shopName: user.sellerProfile ? user.sellerProfile.shopName : null,
      shopSlug: user.sellerProfile ? user.sellerProfile.slug : null,
      sellerApprovalStatus: user.sellerProfile ? (user.sellerProfile.approvalStatus as any) : null,
    };
  } catch (error) {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function removeAuthCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireAuth(): Promise<UserSession> {
  const session = await getSessionUser();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}

export async function requireRole(allowedRoles: Role | Role[]): Promise<UserSession> {
  const session = await requireAuth();
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!roles.includes(session.role)) {
    throw new Error('FORBIDDEN');
  }
  return session;
}
