import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <main className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-between gap-10 rounded-xl bg-white p-8 shadow-sm md:flex-row">
        <div className="max-w-md space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Run multiple companies in one secure workspace
          </h1>
          <p className="text-slate-600">
            Create a company account, invite your team, and keep each company’s
            data isolated in its own workspace.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup/company"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              Create company account
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              Log in
            </Link>
          </div>
          <ul className="mt-4 space-y-1 text-sm text-slate-600">
            <li>• Company-scoped data, no cross-company access</li>
            <li>• Role-based access: Admin, Manager, Employee</li>
            <li>• Secure Supabase authentication & sessions</li>
          </ul>
        </div>
        <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <h2 className="mb-2 font-semibold text-slate-900">
            Onboarding flow
          </h2>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Create a company account</li>
            <li>Admin user is created automatically</li>
            <li>Admin logs in to the company dashboard</li>
            <li>Admin invites Managers/Employees via email</li>
            <li>Invitees accept, set password, and join workspace</li>
          </ol>
        </div>
      </div>
    </main>
  );
}