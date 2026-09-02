'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Phone,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Store,
  User,
  Eye,
  EyeOff,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type AccountRole = 'CUSTOMER' | 'SELLER';
type CustomerMethod = 'EMAIL' | 'PHONE';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Step management: 1 = Request, 2 = Verify OTP, 3 = New Password, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [role, setRole] = useState<AccountRole>('CUSTOMER');
  const [customerMethod, setCustomerMethod] = useState<CustomerMethod>('EMAIL');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  const activeMethod = role === 'SELLER' ? 'PHONE' : customerMethod;

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setDevCode(null);

    try {
      if (!identifier.trim()) {
        throw new Error(
          activeMethod === 'PHONE'
            ? 'Please enter your phone number'
            : 'Please enter your email address'
        );
      }

      const res = await fetch('/api/auth/forgot-password/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          method: activeMethod,
          identifier: identifier.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send verification code.');

      setSuccessMessage(data.message);
      if (data.devCode) setDevCode(data.devCode);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!otp.trim() || otp.trim().length < 6) {
        throw new Error('Please enter the full 6-digit verification code.');
      }

      const res = await fetch('/api/auth/forgot-password/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          identifier: identifier.trim(),
          otp: otp.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid verification code.');

      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset to New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match.');
      }
      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      const res = await fetch('/api/auth/forgot-password/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          method: activeMethod,
          identifier: identifier.trim(),
          otp: otp.trim(),
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password.');

      setStep(4);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center justify-center gap-3.5 group mb-2">
          <div className="relative h-18 w-24 shrink-0">
            <Image
              src="/images/logo.png"
              alt="Village Mart"
              fill
              priority
              className="object-contain"
              sizes="96px"
            />
          </div>
          <div className="text-left">
            <span className="text-2xl font-black tracking-tight text-emerald-950 dark:text-emerald-400 block">
              Village<span className="text-amber-500">Mart</span>
            </span>
            <span className="text-xs text-gray-500 dark:text-slate-400 font-semibold block -mt-0.5">
              Your Village • Your Mart • Your Way
            </span>
          </div>
        </Link>
        <h2 className="mt-3 text-xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">
          Forgot Your Password?
        </h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
          Reset your password securely with phone or email verification.
        </p>
      </div>

      {/* Main Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-800 py-8 px-6 sm:px-10 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-xl space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: SELECT ACCOUNT TYPE & ENTER IDENTIFIER */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Role Switcher Tabs */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                  I am a:
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-slate-900 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setRole('CUSTOMER');
                      setError(null);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors duration-150 flex items-center justify-center gap-1.5 ${
                      role === 'CUSTOMER'
                        ? 'bg-white dark:bg-slate-800 text-emerald-900 dark:text-emerald-400 shadow-sm'
                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" /> Customer
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRole('SELLER');
                      setError(null);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      role === 'SELLER'
                        ? 'bg-brand-700 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" /> Seller
                  </button>
                </div>
              </div>

              {/* Customer Choice: Email vs Phone */}
              {role === 'CUSTOMER' ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Verify via:
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 border border-gray-200 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setCustomerMethod('EMAIL')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                        customerMethod === 'EMAIL'
                          ? 'bg-brand-50 text-brand-800 font-bold border border-brand-200'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" /> Email Address
                    </button>

                    <button
                      type="button"
                      onClick={() => setCustomerMethod('PHONE')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                        customerMethod === 'PHONE'
                          ? 'bg-brand-50 text-brand-800 font-bold border border-brand-200'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Phone className="w-3.5 h-3.5" /> Phone Number
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                  <Phone className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Seller Verification:</strong> For shop security, seller passwords are reset using your registered Sri Lankan phone number.
                  </span>
                </div>
              )}

              {/* Request Form */}
              <form onSubmit={handleRequestOtp} className="space-y-4 pt-1">
                {activeMethod === 'EMAIL' ? (
                  <Input
                    label="Registered Email Address"
                    type="email"
                    placeholder="customer@example.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                ) : (
                  <Input
                    label="Registered Sri Lankan Phone Number"
                    type="tel"
                    placeholder="0771234567"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                )}

                <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
                  Send 6-Digit Code
                </Button>
              </form>
            </div>
          )}

          {/* STEP 2: ENTER OTP CODE */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Enter Verification Code</h3>
                <p className="text-xs text-gray-500">
                  We sent a 6-digit code to{' '}
                  <span className="font-semibold text-gray-800">{identifier}</span>
                </p>
              </div>

              {devCode && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-xl text-xs flex items-center justify-between">
                  <span>Demo Code: <strong>{devCode}</strong></span>
                  <button
                    type="button"
                    onClick={() => setOtp(devCode)}
                    className="text-xs font-bold text-emerald-700 underline"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 text-center">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center tracking-[0.5em] text-2xl font-mono font-bold bg-gray-50 border border-gray-300 rounded-xl p-3 focus:bg-white focus:border-brand-600 outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-gray-500 hover:text-gray-800 underline"
                >
                  Change {activeMethod === 'PHONE' ? 'Phone' : 'Email'}
                </button>

                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={isLoading}
                  className="text-brand-700 font-semibold hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Resend Code
                </button>
              </div>

              <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
                Verify & Continue
              </Button>
            </form>
          )}

          {/* STEP 3: SET NEW PASSWORD */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Set New Password</h3>
                <p className="text-xs text-gray-500">
                  Choose a secure password for your Village Mart account.
                </p>
              </div>

              <div className="relative">
                <Input
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Input
                label="Confirm New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
                Reset Password
              </Button>
            </form>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {step === 4 && (
            <div className="text-center space-y-5 py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">Password Reset Complete!</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  Your Village Mart password has been updated. You can now sign in to your account.
                </p>
              </div>
              <Link href="/login" className="block w-full">
                <Button size="lg" className="w-full">
                  Sign In to Village Mart
                </Button>
              </Link>
            </div>
          )}

          {/* Back to Login link */}
          {step !== 4 && (
            <div className="pt-2 text-center border-t border-gray-100">
              <Link
                href="/login"
                className="text-xs font-semibold text-gray-500 hover:text-brand-700 inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
