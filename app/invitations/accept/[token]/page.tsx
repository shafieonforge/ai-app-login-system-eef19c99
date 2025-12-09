'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Role = 'admin' | 'manager' | 'employee';

interface Invitation {
  id: string;
  company_id: string;
  email: string;
  role: Role;
  invite_token: string;
  expires_at: string;
  status: string;
}

export default function AcceptInvitationPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const router = useRouter();
  const supabase = createClient();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitation = async (): Promise<void> => {
      setLoading(true);
      try {
        const res = await fetch(`/api/invitations/${token}`);
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
          setError(body?.error ?? 'Invalid or expired invitation.');
          setLoading(false);
          return;
        }
        const data = (await res.json()) as Invitation;
        setInvitation(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load invitation',
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      void fetchInvitation();
    }
  }, [token]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!invitation) return;

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
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: invitation.email,
          password,
        });

      if (signUpError || !signUpData.user) {
        setError(signUpError?.message ?? 'Failed to create user');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          authUserId: signUpData.user.id,
          firstName,
          lastName,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(body?.error ?? 'Failed to accept invitation.');
        setLoading(false);
        return;
      }

      setMessage('Invitation accepted. Redirecting to dashboard...');
      setTimeout(() => {
        router.replace('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
      setLoading(false);
    }
  };

  if (loading && !invitation && !error) {
    return (
      <main className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
          <p className="text-center text-sm text-slate-600">
            Loading invitation...
          </p>
        </div>
      </main>
    );
  }

  if (error || !invitation) {
    return (
      <main className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-xl font-semibold tracking-tight text-slate-900">
            Invitation issue
          </h1>
          <p className="mb-4 text-sm text-red-600" role="alert">
            {error ?? 'Invitation is invalid or expired.'}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-xl font-semibold tracking-tight text-slate-900">
          Join company workspace
        </h1>
        <p className="mb-1 text-sm text-slate-700">
          You&apos;ve been invited as{' '}
          <span className="font-semibold capitalize">{invitation.role}</span>
        </p>
        <p className="mb-6 text-xs text-slate-600">
          Account email: <span className="font-mono">{invitation.email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="text-sm text-green-600" role="status">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Accept invitation'}
          </button>
        </form>
      </div>
    </main>
  );
}