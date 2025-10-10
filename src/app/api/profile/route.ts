// Create this new route for handling profile operations

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/createServiceClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'No user ID provided' }, { status: 400 });
    }
    
    const supabase = createServerClient();
    
    // Check if profile exists
    const { data } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', userId)
      .maybeSingle();
    
    // If profile exists, we're done
    if (data) {
      return NextResponse.json({ success: true, hasUsername: !!data.username });
    }
    
    // Create profile with temporary username
    const tempUsername = `user_${Date.now().toString().slice(-6)}`;
    
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username: tempUsername,
        display_name: "New User",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (insertError) {
      console.error("Error creating profile:", insertError);
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, hasUsername: false });
  } catch (err) {
    console.error("Error in profile API route:", err);
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : "Unknown error" 
    }, { status: 500 });
  }
}