import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type Role = 'admin' | 'manager' | 'employee';

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
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  created_at: string;
  auth_user_id: string;
}

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/login');
  }

  const { data: appUser, error: appUserError } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUser.id)
    .single<AppUser>();

  if (appUserError || !appUser) {
    await supabase.auth.signOut();
    redirect('/login');
  }

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', appUser.company_id)
    .single<Company>();

  const { data: users } = (await supabase
    .from('users')
    .select('*')
    .eq('company_id', appUser.company_id)
    .order('created_at', { ascending: true })) as { data: AppUser[] | null };

  const roleLabel: Record<Role, string> = {
    admin: 'Admin',
    manager: 'Manager',
    employee: 'Employee',
  };

  const isAdmin: boolean = appUser.role === 'admin';
  const isManager: boolean = appUser.role === 'manager';

  async function signOut(): Promise<void> {
    'use server';
    const serverClient = createClient();
    await serverClient.auth.signOut();
    redirect('/login');
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-56px)] max-w-6xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-600">
            Dashboard
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            {company?.name ?? 'Company workspace'}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            You are signed in as{' '}
            <span className="font-semibold">
              {appUser.first_name} {appUser.last_name}
            </span>{' '}
            ({roleLabel[appUser.role]}).
          </p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            Sign out
          </button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.5fr,1fr]">
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Company overview
              </h2>
              <p className="text-xs text-slate-600">
                Company-level information is only visible within your workspace.
              </p>
            </div>
            {isAdmin && (
              <Link
                href="/dashboard/company"
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Manage company
              </Link>
            )}
          </header>
          {company ? (
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Company name</dt>
                <dd className="font-medium text-slate-900">{company.name}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Company email</dt>
                <dd className="font-medium text-slate-900">{company.email}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Industry</dt>
                <dd className="font-medium text-slate-900">
                  {company.industry ?? 'Not specified'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Created at</dt>
                <dd className="font-medium text-slate-900">
                  {new Date(company.created_at).toLocaleString()}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-slate-600">
              Company record could not be loaded.
            </p>
          )}
        </section>

        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Team & access
              </h2>
              <p className="text-xs text-slate-600">
                Manage who can access this workspace.
              </p>
            </div>
            {isAdmin && (
              <Link
                href="/dashboard/users"
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Manage users
              </Link>
            )}
          </header>
          <div className="space-y-2">
            {users && users.length > 0 ? (
              <ul className="space-y-2">
                {users.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-xs"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {u.first_name} {u.last_name}
                      </p>
                      <p className="text-[11px] text-slate-600">{u.email}</p>
                    </div>
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-700">
                      {roleLabel[u.role]}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600">
                No users found for this company.
              </p>
            )}
          </div>
          {(isAdmin || isManager) && (
            <p className="text-xs text-slate-500">
              Managers can view users and manage product features. Admins can
              invite and remove users and change roles.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}