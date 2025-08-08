import  { NextRequest, NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase';
import { detectPlatform, generateRSSFeed } from '@/lib/rss-utils';


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
    
    await supabase.from("analytics").insert({
      podcast_id: podcastId,
      event_type: "rss_access",
      user_agent: userAgent,
      ip_address: ip,
      platform: detectPlatform(userAgent),
      timestamp: new Date().toISOString()
    });

    const { data: podcast, error} = await supabase
      .from("podcasts")
      .select("*")
      .eq("id", podcastId)
      .single();

    if (error || !podcast) {
      return new NextResponse("Podcast not found", { status: 404 });
    }

    const { data: episodes } = await supabase
      .from("episodes")
      .select("*")
      .eq("podcast_id", podcastId)
      .eq("status", "published")
      .order("published_at", { ascending: false });
    
      const rssXml = generateRSSFeed(podcast, episodes || []);

      return new NextResponse(rssXml, {
        status: 200,
        headers: {
          "Content-Type": "application/rss+xml; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
        },
      }
    );
  } catch (error) {
    console.error("Error generating RSS feed: ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
