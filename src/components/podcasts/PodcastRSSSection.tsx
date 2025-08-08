"use client";

import toast from "react-hot-toast";

import { Podcast } from "@/types/podcast";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { applePodcastsSubmitLink, spotifyPodcastsSubmitLink } from "@/lib/data";

type Props = {
  podcast: Podcast;
};

export default function PodcastRSSSection({ podcast }: Props) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const rssUrl = `${baseUrl}/api/rss/${podcast.id}`;

  const copyRSSUrl = () => {
    navigator.clipboard.writeText(rssUrl);
    toast.success("RSS URL copied to clipboard!");
  };
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <h2>RSS Feed</h2>
      </CardHeader>
      <CardBody>
        <p className="text-gray-600 mb-4">
          Use this RSS Feed to submit your podcast to platforms like Apple
          Podcasts and Spotify:
        </p>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={podcast.rss_url || "RSS feed not generated yet"}
            readOnly
            className="flex-1 p-2 border rounded-lg bg-gray-50"
          />
          <Button onPress={copyRSSUrl} disabled={!podcast.rss_url}>
            Copy
          </Button>
        </div>
        <div className="flex gap-4">
          <Button
            as="a"
            href={applePodcastsSubmitLink}
            target="_blank"
            color="primary"
            variant="bordered"
          >
            Submit to Apple Podcasts
          </Button>
          <Button
            as="a"
            href={spotifyPodcastsSubmitLink}
            target="_blank"
            color="success"
            variant="bordered"
          >
            Submit to Spotify
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};
