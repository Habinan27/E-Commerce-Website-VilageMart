import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword, signJwt, setAuthCookie } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { registerUserSchema, registerSellerSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const role = body.role || 'CUSTOMER';

    if (role === 'SELLER') {
      const parsed = registerSellerSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
      }

      const { name, email, phone, password, shopName, description, logoUrl, address, locationId } = parsed.data;

      // Check existing email
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      }

      const hashedPassword = await hashPassword(password);
      const baseSlug = slugify(shopName);
      let slug = baseSlug;
      let counter = 1;
      while (await prisma.sellerProfile.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter++}`;
      }

      let resolvedLocationId = BigInt(1);
      if (locationId) {
        try {
          resolvedLocationId = BigInt(locationId);
        } catch {
          const firstLoc = await prisma.location.findFirst();
          if (firstLoc) resolvedLocationId = firstLoc.id;
        }
      } else {
        const firstLoc = await prisma.location.findFirst();
        if (firstLoc) resolvedLocationId = firstLoc.id;
      }

      const user = await prisma.user.create({
        data: {
          name,
          email,
          phone: phone || null,
          password: hashedPassword,
          role: 'SELLER',
          sellerProfile: {
            create: {
              shopName,
              slug,
              description: description || null,
              logoUrl: logoUrl || null,
              address: address || 'Sri Lanka',
              locationId: resolvedLocationId,
              approvalStatus: 'PENDING', // Sellers need admin approval
            },
          },
        },
        include: { sellerProfile: true },
      });

      const token = signJwt({ id: user.id.toString(), role: user.role });
      await setAuthCookie(token);

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          sellerProfileId: user.sellerProfile?.id.toString(),
        },
      });
    } else {
      // Customer Registration
      const parsed = registerUserSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
      }

      const { name, email, phone, password } = parsed.data;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      }

      const hashedPassword = await hashPassword(password);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          phone: phone || null,
          password: hashedPassword,
          role: 'CUSTOMER',
        },
      });

      const token = signJwt({ id: user.id.toString(), role: user.role });
      await setAuthCookie(token);

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 500 });
  }
}
