"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Podcast } from "@/types/podcast";
import { CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { applePodcastsSubmitLink, spotifyPodcastsSubmitLink } from "@/lib/data";
import { supabase } from "@/lib/supabase";

type Props = {
  podcast: Podcast;
};

export default function PodcastRSSSection({ podcast }: Props) {
  const [profile, setProfile] = useState<{ username: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", podcast.user_id)
        .single();
      
      if (data) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [podcast.user_id]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("RSS URL copied to clipboard");
  };

  const rssUrl = profile?.username 
  ? `${window.location.origin}/${profile.username}/${podcast.podcast_name}/rss`
  : "Loading RSS URL...";

  return (
    <div className="">
      <CardBody className="space-y-4">
        <p className="text-gray-600 mb-4">
          Use this RSS Feed to submit your podcast to platforms like Apple
          Podcasts and Spotify:
        </p>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={rssUrl || "RSS feed not generated yet"}
            readOnly
            className="flex-1 p-2 border rounded-lg bg-gray-50"
          />
          <Button onPress={() => copyToClipboard(rssUrl)}>Copy</Button>
        </div>
        <div className="flex gap-4">
          <Button
            as="a"
            href={applePodcastsSubmitLink}
            target="_blank"
            variant="bordered"
            className="platform-submit-btn apple-podcasts"
          >
            Submit to Apple Podcasts
          </Button>
          <Button
            as="a"
            href={spotifyPodcastsSubmitLink}
            target="_blank"
            variant="bordered"
            className="platform-submit-btn spotify"
          >
            Submit to Spotify
          </Button>
        </div>
      </CardBody>
    </div>
  );
}
