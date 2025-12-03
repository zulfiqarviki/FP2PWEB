import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// CREATE - Register new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name } = body;

    console.log('📥 Received request:', { email, full_name });

    // Validasi input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create auth user
    console.log('🔐 Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error('❌ Auth Error:', authError);
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: 'Failed to create user' },
        { status: 400 }
      );
    }

    console.log('✅ Auth user created:', authData.user.id);

    // Create user profile
    console.log('💾 Creating user profile...');
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email,
          full_name: full_name || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Database Error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    console.log('✅ User created successfully:', data);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Server Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// READ - Get all users
export async function GET(request: NextRequest) {
  try {
    console.log('📥 GET /api/users');
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database Error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    console.log('✅ Users fetched:', data?.length || 0);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('❌ Server Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}