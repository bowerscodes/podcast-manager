import { Metadata } from "next";
import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { createServerClient } from "@/lib/createServiceClient";
import PodcastDetailView from "@/components/podcasts/PodcastDetailView";
import BackButton from "@/components/ui/BackButton";

export async function generateMetadata(props: {
  params: { username: string; podcastName: string };
}): Promise<Metadata> {
  const { username, podcastName } = await props.params;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (!profile) {
    return {
      title: "User Not Found",
      description: "The requested user could not be found",
    };
  }

  const { data: podcast } = await supabase
    .from("podcasts")
    .select("*")
    .eq("user_id", profile.id)
    .eq("podcast_name", podcastName)
    .single();

  if (!podcast) {
    return {
      title: "Podcast Not Found",
      description: "The requested podcast could not be found",
    };
  }

  return {
    title: podcast.title,
    description: podcast.description,
  };
}

export default async function PodcastPage(props: {
  params: { username: string; podcastName: string };
}) {
  const supabaseServer = createServerClient();

  const { username, podcastName } = await props.params;

  const { data: profile } = await supabaseServer
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (!profile) {
    console.log("User not found:", username);
    notFound();
  }


  const { data: podcasts } = await supabaseServer
    .from("podcasts")
    .select("*")
    .eq("user_id", profile.id)
    .eq("podcast_name", podcastName);

  // If the above find something, use the first match
  const podcast = podcasts && podcasts.length > 0 ? podcasts[0] : null;

  if (!podcast) {
    notFound();
  }

  return (
    <>
      <div className="ml-8 mt-0 mb-0">
        <BackButton to="podcasts" />
      </div>
      <PodcastDetailView podcastId={podcast.id} />
    </>
  );
}
