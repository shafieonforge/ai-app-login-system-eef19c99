import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type Role = 'admin' | 'manager' | 'employee';

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

interface Invitation {
  id: string;
  company_id: string;
  email: string;
  role: Role;
  invite_token: string;
  expires_at: string;
  status: string;
}

async function updateUserRoleAction(formData: FormData): Promise<void> {
  'use server';
  const supabase = createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect('/login');

  const userId = String(formData.get('userId') ?? '');
  const newRole = String(formData.get('role') ?? '') as Role;

  const { data: actingUser } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUser.id)
    .single<AppUser>();

  if (!actingUser || actingUser.role !== 'admin') {
    redirect('/dashboard');
  }

  const { data: targetUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single<AppUser>();

  if (!targetUser || targetUser.company_id !== actingUser.company_id) {
    redirect('/dashboard');
  }

  await supabase.from('users').update({ role: newRole }).eq('id', userId);
}

async function deleteUserAction(formData: FormData): Promise<void> {
  'use server';
  const supabase = createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect('/login');

  const userId = String(formData.get('userId') ?? '');

  const { data: actingUser } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUser.id)
    .single<AppUser>();

  if (!actingUser || actingUser.role !== 'admin') {
    redirect('/dashboard');
  }

  const { data: targetUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single<AppUser>();

  if (!targetUser || targetUser.company_id !== actingUser.company_id) {
    redirect('/dashboard');
  }

  if (targetUser.id === actingUser.id) {
    redirect('/dashboard/users');
  }

  await supabase.from('users').delete().eq('id', userId);
}

export default async function UsersPage() {
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

  const { data: users } = (await supabase
    .from('users')
    .select('*')
    .eq('company_id', appUser.company_id)
    .order('created_at', { ascending: true })) as { data: AppUser[] | null };

  const { data: invitations } = (await supabase
    .from('invitations')
    .select('*')
    .eq('company_id', appUser.company_id)
    .order('created_at', { ascending: false })) as {
    data: Invitation[] | null;
  };

  const roleLabel: Record<Role, string> = {
    admin: 'Admin',
    manager: 'Manager',
    employee: 'Employee',
  };

  return (
    <main className="mx-auto min-h-[calc(100vh-56px)] max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-600">
            Team
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Users & invitations
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage access to your company workspace. Only Admins can invite or
            remove users and change roles.
          </p>
        </div>
        <Link
          href="/dashboard/invitations/new"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          Invite user
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.7fr,1.3fr]">
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <header>
            <h2 className="text-sm font-semibold text-slate-900">Users</h2>
            <p className="text-xs text-slate-600">
              All users belong to this company only. No cross-company access.
            </p>
          </header>
          <div className="space-y-2">
            {users && users.length > 0 ? (
              <ul className="divide-y divide-slate-100 text-xs">
                {users.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {u.first_name} {u.last_name}{' '}
                        {u.id === appUser.id && (
                          <span className="ml-1 text-[10px] text-blue-600">
                            (You)
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-600">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <form action={updateUserRoleAction}>
                        <input type="hidden" name="userId" value={u.id} />
                        <select
                          name="role"
                          defaultValue={u.role}
                          disabled={u.id === appUser.id}
                          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] outline-none ring-blue-500 focus:ring disabled:bg-slate-100"
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="employee">Employee</option>
                        </select>
                      </form>
                      {u.id !== appUser.id && (
                        <form action={deleteUserAction}>
                          <input type="hidden" name="userId" value={u.id} />
                          <button
                            type="submit"
                            className="text-[11px] font-medium text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        </form>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600">No users found.</p>
            )}
          </div>
        </section>

        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <header>
            <h2 className="text-sm font-semibold text-slate-900">
              Invitations
            </h2>
            <p className="text-xs text-slate-600">
              Pending, accepted, and expired invitations for this company.
            </p>
          </header>
          <div className="space-y-2">
            {invitations && invitations.length > 0 ? (
              <ul className="divide-y divide-slate-100 text-xs">
                {invitations.map((inv) => (
                  <li
                    key={inv.id}
                    className="flex items-center justify-between py-2.5"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {inv.email}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        Role: {roleLabel[inv.role]}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] capitalize text-slate-700">
                        {inv.status}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Expires:{' '}
                        {new Date(inv.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600">No invitations yet.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}