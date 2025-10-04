import { NextRequest, NextResponse } from "next/server";

import { detectPlatform, generateRSSFeed } from "@/lib/rss-utils";
import { createServerClient } from "@/lib/createServiceClient";


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string; podcastName: string }> }
) {
  try {
    const { username, podcastName } = await params;
    const userAgent = request.headers.get("user-agent") || "";
    const ip = request.headers.get("x-forwarded-for") ||
               request.headers.get("x-real-ip") ||
               "Unknown";
    
    // Create a server client with admin access
    const supabaseServer = createServerClient();
    
    // First, get the user ID from the username
    const { data: profile, error: profileError } = await supabaseServer
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();
    
    if (profileError || !profile) {
      console.error('Profile error:', profileError);
      return new NextResponse("User not found", { status: 404 });
    }
    
    // Then, get the podcast using the user ID and podcast_name
    const { data: podcasts, error: podcastError } = await supabaseServer
      .from("podcasts")
      .select("*")
      .eq("user_id", profile.id)
      .eq("podcast_name", podcastName);
    
    if (podcastError) {
      console.error('Podcast error:', podcastError);
      return new NextResponse(`Database error: ${podcastError.message}`, { status: 500 });
    }
    
    if (!podcasts || podcasts.length === 0) {
      return new NextResponse("Podcast not found", { status: 404 });
    }
    
    const podcast = podcasts[0];
    
    // Log analytics (optional)
    try {
      await supabaseServer.from("analytics").insert({
        podcast_id: podcast.id,
        event_type: "rss_access",
        user_agent: userAgent,
        ip_address: ip,
        platform: detectPlatform(userAgent),
        timestamp: new Date().toISOString()
      });
    } catch (analyticsError) {
      console.warn('Analytics insert failed:', analyticsError);
    }
    
    // Fetch episodes
    const { data: episodes, error: episodesError } = await supabaseServer
      .from("episodes")
      .select("*")
      .eq("podcast_id", podcast.id)
      .eq("status", "published")
      .order("season_number", { ascending: true })
      .order("episode_number", { ascending: true });
    
    if (episodesError) {
      console.error('Episodes error:', episodesError);
      return new NextResponse(`Episodes error: ${episodesError.message}`, { status: 500 });
    }
    
    // Generate RSS
    const rssXml = generateRSSFeed(podcast, episodes || []);
    
    return new NextResponse(rssXml, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("RSS Generation Error:", error);
    return new NextResponse(`Internal Server Error: ${error}`, { status: 500 });
  }
}
