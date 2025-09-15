import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const { email, password, fullName, subaccountName } = await request.json();

  if (!email || !password || !fullName || !subaccountName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Check if user already exists
    const { data: existingUser, error: existingUserError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUserError && existingUserError.code !== 'PGRST116') { // PGRST116: no rows found
      console.error('Error checking for existing user:', existingUserError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // 1. Create a new user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'SUBACCOUNT_USER', // Default role
        },
      },
    });

    if (authError) {
      console.error('Auth sign-up error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'User creation failed' }, { status: 500 });
    }

    const newUser = authData.user;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Use a transaction to ensure all-or-nothing creation of agency and subaccount
    const { data, error: transactionError } = await supabaseAdmin.rpc('create_subaccount_for_default_agency', { 
        p_email: email,
        p_full_name: fullName,
        p_password: hashedPassword,
        p_subaccount_name: subaccountName, 
        p_user_id: newUser.id
    });

    if (transactionError) {
        console.error('Transaction error:', transactionError);
        // Clean up the created user if the transaction fails
        await supabaseAdmin.auth.admin.deleteUser(newUser.id);
        return NextResponse.json({ error: 'Failed to create subaccount' }, { status: 500 });
    }

    return NextResponse.json({ message: 'User and subaccount created successfully' }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
