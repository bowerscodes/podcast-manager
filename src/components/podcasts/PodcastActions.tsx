"use client";

import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";

import { Podcast } from "@/types/podcast";

type Props = {
  podcast: Podcast;
};

export default function PodcastActions({ podcast }: Props) {
  const router = useRouter();

  return (
    <div className="flex gap-4">
      <Button
        color="primary"
        onPress={() => router.push(`/podcasts/${podcast.id}/episodes/new`)}
      >
        Add Episode
      </Button>
      <Button
        variant="bordered"
        onPress={() => router.push(`/podcasts/${podcast.id}/episodes`)}
      >
        Manage Episodes
      </Button>
      <Button variant="light" onPress={() => router.push("/podcasts/")}>
        Back to Podcasts
      </Button>
    </div>
  );
};
