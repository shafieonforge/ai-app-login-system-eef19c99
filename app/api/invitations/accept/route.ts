import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Role = 'admin' | 'manager' | 'employee';

interface AcceptBody {
  token: string;
  authUserId: string;
  firstName: string;
  lastName: string;
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

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as AcceptBody;
    const { token, authUserId, firstName, lastName } = body;

    if (!token || !authUserId || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const supabase = createClient();

    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .select('*')
      .eq('invite_token', token)
      .single<Invitation>();

    if (inviteError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 },
      );
    }

    const now = new Date();
    if (
      invitation.status !== 'pending' ||
      new Date(invitation.expires_at) < now
    ) {
      return NextResponse.json(
        { error: 'Invitation is expired or already used' },
        { status: 400 },
      );
    }

    const { error: userInsertError } = await supabase.from('users').insert({
      company_id: invitation.company_id,
      first_name: firstName,
      last_name: lastName,
      email: invitation.email,
      role: invitation.role,
      auth_user_id: authUserId,
    });

    if (userInsertError) {
      return NextResponse.json(
        { error: userInsertError.message },
        { status: 500 },
      );
    }

    await supabase
      .from('invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 },
    );
  }
}