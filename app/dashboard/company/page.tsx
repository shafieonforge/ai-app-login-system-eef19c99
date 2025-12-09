import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface Company {
  id: string;
  name: string;
  email: string;
  industry: string | null;
  created_at: string;
}

interface AppUser {
  id: string;
  company_id: string;
  role: 'admin' | 'manager' | 'employee';
  auth_user_id: string;
}

async function updateCompanyAction(formData: FormData): Promise<void> {
  'use server';
  const supabase = createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect('/login');

  const { data: appUser } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUser.id)
    .single<AppUser>();

  if (!appUser || appUser.role !== 'admin') {
    redirect('/dashboard');
  }

  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const industry = String(formData.get('industry') ?? '').trim();

  if (!name || !email) {
    redirect('/dashboard/company');
  }

  await supabase
    .from('companies')
    .update({
      name,
      email,
      industry: industry || null,
    })
    .eq('id', appUser.company_id);

  redirect('/dashboard');
}

export default async function CompanySettingsPage() {
  const supabase = createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect('/login');

  const { data: appUser } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUser.id)
    .single<AppUser>();

  if (!appUser || appUser.role !== 'admin') {
    redirect('/dashboard');
  }

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', appUser.company_id)
    .single<Company>();

  if (!company) {
    redirect('/dashboard');
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-56px)] max-w-3xl px-4 py-8">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-600">
          Company
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          Company settings
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage the company profile for this workspace.
        </p>
      </div>

      <form
        action={updateCompanyAction}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-1.5">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-700"
          >
            Company name
          </label>
          <input
            id="name"
            name="name"
            defaultValue={company.name}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700"
          >
            Company email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={company.email}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="industry"
            className="block text-sm font-medium text-slate-700"
          >
            Industry
          </label>
          <input
            id="industry"
            name="industry"
            defaultValue={company.industry ?? ''}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          Save changes
        </button>
      </form>
    </main>
  );
}