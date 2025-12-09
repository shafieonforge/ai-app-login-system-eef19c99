import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } },
): Promise<NextResponse> {
  try {
    const supabase = createClient();
    const { token } = params;

    const { data: invitation, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('invite_token', token)
      .single<Invitation>();

    if (error || !invitation) {
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

    return NextResponse.json(invitation, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to load invitation' },
      { status: 500 },
    );
  }
}