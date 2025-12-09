import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Multi-tenant SaaS',
  description: 'Company onboarding & authentication with Supabase',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="flex min-h-screen flex-col">
          <header className="border-b bg-white">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-md bg-blue-600" />
                <span className="text-lg font-semibold tracking-tight">
                  Multi-tenant SaaS
                </span>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}