'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

type Role = 'admin' | 'manager' | 'employee';

export default function NewInvitationPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<Role>('employee');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/invitations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(body?.error ?? 'Failed to send invitation');
        setLoading(false);
        return;
      }

      setMessage('Invitation sent successfully.');
      setTimeout(() => {
        router.replace('/dashboard/users');
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto min-h-[calc(100vh-56px)] max-w-md px-4 py-8">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-xl font-semibold tracking-tight text-slate-900">
          Invite a user
        </h1>
        <p className="mb-6 text-sm text-slate-600">
          Send an invitation to join your company workspace. The invitee will
          choose a password and create their account.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700"
            >
              Work email
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@company.com"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-slate-700"
            >
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
            >
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
            <p className="text-xs text-slate-500">
              Admin role is reserved for company owners and must be configured
              manually.
            </p>
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

          <div className="flex items-center justify-between gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex flex-1 items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send invitation'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}