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
    const raw = await req.text();
    let body: SignupBody;

    try {
      body = JSON.parse(raw) as SignupBody;
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 },
      );
    }

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
        { error: 'Missing required fields in onboarding payload' },
        { status: 400 },
      );
    }

    const supabase = createClient();

    // Insert company
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
        {
          error: `Failed to create company: ${
            companyError?.message ?? 'No company returned'
          }`,
        },
        { status: 500 },
      );
    }

    // Insert app-level admin user
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
        {
          error: `Failed to create app user: ${userError.message}`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to complete onboarding';

    return NextResponse.json(
      { error: `Onboarding route error: ${message}` },
      { status: 500 },
    );
  }
}