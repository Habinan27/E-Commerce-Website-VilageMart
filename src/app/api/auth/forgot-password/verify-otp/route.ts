import { NextResponse } from 'next/server';
import { TokenService } from '@/lib/services/token-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, otp } = body;

    if (!identifier || !otp) {
      return NextResponse.json(
        { error: 'Identifier and 6-digit verification code are required.' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim();
    const cleanOtp = otp.trim();

    const record = await TokenService.verifyOtp(cleanIdentifier, cleanOtp);

    if (!record) {
      return NextResponse.json(
        { error: 'Invalid or expired 6-digit verification code. Please request a new code.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code confirmed successfully.',
    });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: error.message || 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
