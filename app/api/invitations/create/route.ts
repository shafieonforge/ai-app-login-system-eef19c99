import { NextResponse, type NextRequest } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';

type Role = 'admin' | 'manager' | 'employee';

interface CreateInvitationBody {
  email: string;
  role: Role;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, role } = (await req.json()) as CreateInvitationBody;

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 },
      );
    }

    const { data: actingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUser.id)
      .single<{
        id: string;
        company_id: string;
        role: Role;
        auth_user_id: string;
      }>();

    if (userError || !actingUser) {
      return NextResponse.json(
        { error: 'User context not found' },
        { status: 403 },
      );
    }

    if (actingUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can invite users' },
        { status: 403 },
      );
    }

    const inviteToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error: inviteError } = await supabase.from('invitations').insert({
      company_id: actingUser.company_id,
      email,
      role,
      invite_token: inviteToken,
      expires_at: expiresAt.toISOString(),
      status: 'pending',
    });

    if (inviteError) {
      return NextResponse.json(
        { error: inviteError.message },
        { status: 500 },
      );
    }

    const origin =
      req.headers.get('origin') ??
      process.env.NEXT_PUBLIC_APP_URL ??
      'http://localhost:3000';
    const inviteUrl = `${origin}/invitations/accept/${inviteToken}`;

    // In a real system, send inviteUrl via email here.

    return NextResponse.json({ inviteUrl }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 },
    );
  }
}