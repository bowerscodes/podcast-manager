import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase';
import { detectPlatform, generateRSSFeed } from '@/lib/rss-utils';
import { createClient } from '@supabase/supabase-js';

// Service role client for RSS generation (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ podcastId: string }> }
) {
  try {
    const { podcastId } = await params;
    const userAgent = request.headers.get("user-agent") || "";
    const ip = request.headers.get("x-forwarded-for") ||
               request.headers.get("x-real-ip") ||
               "Unknown";
        
    // Log analytics (but don't fail if it errors)
    try {
      await supabase.from("analytics").insert({
        podcast_id: podcastId,
        event_type: "rss_access",
        user_agent: userAgent,
        ip_address: ip,
        platform: detectPlatform(userAgent),
        timestamp: new Date().toISOString()
      });
    } catch (analyticsError) {
      console.warn('⚠️ Analytics insert failed:', analyticsError);
    }

    // Fetch podcast data
    const { data: podcasts, error } = await supabaseAdmin
      .from("podcasts")
      .select("*")
      .eq("id", podcastId);

    if (error) {
      console.error('❌ Database error:', error);
      return new NextResponse(`Database error: ${error.message}`, { status: 500 });
    }

    if (!podcasts || podcasts.length === 0) {
      return new NextResponse("Podcast not found", { status: 404 });
    }

    const podcast = podcasts[0];

    // Fetch episodes
    const { data: episodes } = await supabaseAdmin
      .from("episodes")
      .select("*")
      .eq("podcast_id", podcastId)
      .eq("status", "published")
      .order("published_at", { ascending: false });
    
    // Generate RSS
    const rssXml = generateRSSFeed(podcast, episodes || []);
    console.log('🎉 RSS XML generated successfully');

    return new NextResponse(rssXml, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("❌ RSS Generation Error:", error);
    return new NextResponse(`Internal Server Error: ${error}`, { status: 500 });
  }
}