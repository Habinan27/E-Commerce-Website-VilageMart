import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { TokenService } from '@/lib/services/token-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role, method, identifier, otp, newPassword, confirmPassword } = body;

    if (!identifier || !otp || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required to reset password.' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'New password and confirm password do not match.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim();
    const cleanOtp = otp.trim();
    const accountRole = role === 'SELLER' ? 'SELLER' : 'CUSTOMER';
    const authMethod = method === 'PHONE' ? 'PHONE' : 'EMAIL';

    // Verify token record via TokenService
    const record = await TokenService.verifyOtp(cleanIdentifier, cleanOtp);

    if (!record) {
      return NextResponse.json(
        { error: 'Invalid or expired verification session. Please restart password reset.' },
        { status: 400 }
      );
    }

    // Find the user
    let user;
    if (authMethod === 'PHONE' || record.type === 'PHONE') {
      const sanitizedPhone = cleanIdentifier.replace(/[\s-]/g, '');
      user = await prisma.user.findFirst({
        where: {
          phone: sanitizedPhone,
          role: accountRole,
        },
      });
    } else {
      user = await prisma.user.findFirst({
        where: {
          email: cleanIdentifier.toLowerCase(),
          role: accountRole,
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User account not found.' },
        { status: 404 }
      );
    }

    // Hash the new password securely
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Mark token as used
    await TokenService.markOtpUsed(record.id);

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully reset. You can now sign in with your new password.',
    });
  } catch (error: any) {
    console.error('Reset Password error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
}
