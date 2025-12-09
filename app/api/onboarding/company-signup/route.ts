import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface SignupBody {
  companyName: string;
  companyEmail: string;
  industry?: string;
  firstName: string;
  lastName: string;
  adminEmail: string;
  authUserId: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as SignupBody;
    const {
      companyName,
      companyEmail,
      industry,
      firstName,
      lastName,
      adminEmail,
      authUserId,
    } = body;

    if (
      !companyName ||
      !companyEmail ||
      !firstName ||
      !lastName ||
      !adminEmail ||
      !authUserId
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const supabase = createClient();

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: companyName,
        email: companyEmail,
        industry: industry || null,
      })
      .select()
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: companyError?.message ?? 'Failed to create company' },
        { status: 500 },
      );
    }

    const { error: userError } = await supabase.from('users').insert({
      company_id: company.id,
      first_name: firstName,
      last_name: lastName,
      email: adminEmail,
      role: 'admin',
      auth_user_id: authUserId,
    });

    if (userError) {
      return NextResponse.json(
        { error: userError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 },
    );
  }
}