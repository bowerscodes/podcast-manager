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
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("RSS URL copied to clipboard");
  };

  const rssUrl = `${window.location.origin}/api/rss/${podcast.id}`;

  return (
    <Card className="mb-6 border border-gray-200 shadow-md" style={{ background: "var(--gradient-card-subtle)" }}>
      <CardHeader>
        <h2 className="heading-secondary">RSS Feed & Distribution</h2>
      </CardHeader>
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
          <Button onPress={() => copyToClipboard(rssUrl)}>
            Copy
          </Button>
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
    </Card>
  );
};
