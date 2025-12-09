'use client';

import Link from 'next/link';

export default function Component() {
  return (
    <main className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight text-slate-900">
          Welcome
        </h1>
        <p className="mb-6 text-center text-sm text-slate-600">
          This is a placeholder home page. Use the link below to create a company account.
        </p>
        <div className="flex justify-center">
          <Link
            href="/signup/company"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            Go to company signup
          </Link>
        </div>
      </div>
    </main>
  );
}