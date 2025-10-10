import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/auth?error=oauth_error', request.url));
  }

  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) throw error;
      
      // Redirect to your app with session
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(new URL('/auth?error=oauth_error', request.url));
    }
  }

  return NextResponse.redirect(new URL('/auth?error=invalid_request', request.url));
}
