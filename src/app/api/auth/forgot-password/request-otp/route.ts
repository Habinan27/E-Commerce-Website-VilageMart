import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { TokenService } from '@/lib/services/token-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role, method, identifier } = body;

    if (!identifier || !role || !method) {
      return NextResponse.json(
        { error: 'Account type, method, and phone/email are required.' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim();
    const accountRole = role === 'SELLER' ? 'SELLER' : 'CUSTOMER';
    const authMethod = method === 'PHONE' ? 'PHONE' : 'EMAIL';

    // Verification rule check
    if (accountRole === 'SELLER' && authMethod !== 'PHONE') {
      return NextResponse.json(
        { error: 'Seller password reset must be verified via registered phone number.' },
        { status: 400 }
      );
    }

    // Look up user in database
    let user;
    if (authMethod === 'PHONE') {
      const sanitizedPhone = cleanIdentifier.replace(/[\s-]/g, '');
      user = await prisma.user.findFirst({
        where: {
          phone: sanitizedPhone,
          role: accountRole,
          status: 'ACTIVE',
        },
      });
    } else {
      user = await prisma.user.findFirst({
        where: {
          email: cleanIdentifier.toLowerCase(),
          role: accountRole,
          status: 'ACTIVE',
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        {
          error: `No active ${accountRole.toLowerCase()} account found with this ${
            authMethod === 'PHONE' ? 'phone number' : 'email address'
          }.`,
        },
        { status: 404 }
      );
    }

    // Generate 6-digit random verification OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP token via TokenService
    await TokenService.createPasswordResetOtp(cleanIdentifier, otp, authMethod, accountRole);

    // Console log for development / debugging
    console.log(`\n========================================`);
    console.log(`[Village Mart Auth] Password Reset OTP:`);
    console.log(`Account Role: ${accountRole}`);
    console.log(`Method:       ${authMethod}`);
    console.log(`Recipient:    ${cleanIdentifier}`);
    console.log(`OTP Code:     👉 ${otp} 👈`);
    console.log(`========================================\n`);

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to your ${
        authMethod === 'PHONE' ? 'phone number' : 'email address'
      }.`,
      devCode: otp,
    });
  } catch (error: any) {
    console.error('Request OTP error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send verification code. Please try again.' },
      { status: 500 }
    );
  }
}
