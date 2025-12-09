'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function CompanySignupPage() {
  const supabase = createClient();
  const router = useRouter();

  const [companyName, setCompanyName] = useState<string>('');
  const [companyEmail, setCompanyEmail] = useState<string>('');
  const [industry, setIndustry] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // 1) Create Supabase auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: adminEmail,
        password,
      });

      if (signUpError || !data.user) {
        setError(
          `Auth sign-up failed: ${
            signUpError?.message ?? 'No user returned from Supabase'
          }`,
        );
        setLoading(false);
        return;
      }

      // 2) Call onboarding API to create company + app-level user
      const response = await fetch('/api/onboarding/company-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          companyEmail,
          industry,
          firstName,
          lastName,
          adminEmail,
          authUserId: data.user.id,
        }),
      });

      if (!response.ok) {
        let bodyText = '';
        try {
          const body = (await response.json()) as { error?: string } | null;
          bodyText = body?.error ?? '';
        } catch {
          // best effort only
        }

        setError(
          bodyText
            ? `Onboarding failed: ${bodyText}`
            : `Onboarding failed with status ${response.status}`,
        );
        setLoading(false);
        return;
      }

      router.replace('/dashboard');
    } catch (err) {
      setError(
        err instanceof Error
          ? `Unexpected error: ${err.message}`
          : 'Unexpected error',
      );
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight text-slate-900">
          Create your company workspace
        </h1>
        <p className="mb-6 text-center text-sm text-slate-600">
          We&apos;ll create a company account and your admin user in one step.
        </p>

        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-slate-800">
              Company details
            </legend>
            <div className="space-y-1.5">
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-slate-700"
              >
                Company name
              </label>
              <input
                id="companyName"
                type="text"
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Inc."
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="companyEmail"
                className="block text-sm font-medium text-slate-700"
              >
                Company email
              </label>
              <input
                id="companyEmail"
                type="email"
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                placeholder="info@acme.com"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="industry"
                className="block text-sm font-medium text-slate-700"
              >
                Industry (optional)
              </label>
              <input
                id="industry"
                type="text"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Software, Retail, Healthcare..."
              />
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-slate-800">
              Admin user
            </legend>
            <div className="flex gap-3">
              <div className="w-1/2 space-y-1.5">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-slate-700"
                >
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jane"
                />
              </div>
              <div className="w-1/2 space-y-1.5">
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-slate-700"
                >
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="adminEmail"
                className="block text-sm font-medium text-slate-700"
              >
                Admin email
              </label>
              <input
                id="adminEmail"
                type="email"
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="you@acme.com"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={8}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
              />
            </div>
          </fieldset>

          {error && (
            <div className="md:col-span-2">
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            </div>
          )}

          <div className="md:col-span-2 flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Creating workspace...' : 'Create company account'}
            </button>
            <p className="text-center text-xs text-slate-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}