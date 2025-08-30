import { useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { Button } from "@heroui/button";

import { Podcast } from "@/types/podcast";
import { formatDate } from "@/lib/date-utils";
import { supabase } from "@/lib/supabase";
import EditableImage from "../ui/EditableImage";
import Tag from "../ui/Tag";
import ExpandableText from "../ui/ExpandableText";
import usePodcast from "@/hooks/usePodcast";
import useEpisodes from "@/hooks/useEpisodes";
import PodcastModal from "../modals/PodcastModal";
import { useAuth } from "../auth/Provider";
import { defaultArtwork } from "@/lib/data";

type Props = {
  podcast: Podcast;
  episodeCount: number;
};

export default function PodcastHeader({
  podcast: initialPodcast,
  episodeCount,
}: Props) {
  const { user } = useAuth();
  const { podcast, refresh } = usePodcast(initialPodcast.id, user?.id);
  const { episodes } = useEpisodes(initialPodcast.id);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const displayPodcast = podcast || initialPodcast;

  const mostRecentEpisodeDate =
    episodes.length > 0
      ? episodes.reduce((latest, episode) =>
          new Date(episode.created_at) > new Date(latest.created_at)
            ? episode
            : latest
        ).created_at
      : null;

  const handlePodcastUpdate = () => {
    refresh();
    setIsEditModalOpen(false);
  };

  return (
    <>
      <div className="flex items-start gap-6 mb-6">
        <div className="flex-shrink-0">
          <EditableImage
            src={displayPodcast.artwork}
            alt={`${displayPodcast.title} artwork`}
            onSave={async (newImageUrl: string) => {
              const { error } = await supabase
                .from("podcasts")
                .update({ artwork: newImageUrl })
                .eq("id", displayPodcast.id);
              if (error) throw error;

              // Refresh the podcast data to show the updated image
              refresh();
            }}
            fallback={defaultArtwork()}
            className="rounded-lg shadow-md"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <h1 className="text-3xl font-bold truncate">
                {displayPodcast.title}
              </h1>
              <div className="hidden sm:block flex-shrink-0">
                <Tag explicit={displayPodcast.explicit} />
              </div>
            </div>
            <Button
              // isIconOnly
              variant="light"
              color="primary"
              className="top-0 right-0 z-10"
              onPress={() => setIsEditModalOpen(true)}
            >
              Edit <AiOutlineEdit size={20} />
            </Button>
          </div>

          <div className="mb-2">
            <ExpandableText text={displayPodcast.description} maxLines={3} />
          </div>
          <div className="text-sm text-gray-500 mb-2">
            By
            <span className="truncate font-medium">
              {" "}
              {displayPodcast.author}
            </span>
          </div>
          {displayPodcast.categories.length > 0 && (
            <div className="hidden sm:flex flex-wrap gap-2  mb-2">
              {podcast?.categories.map((category, index) => (
                <Tag key={index} color="blue">{category}</Tag>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 sm:justify-start">
            <span>{episodeCount} episodes</span>
            {mostRecentEpisodeDate && (
              <div className="hidden sm:inline">
                <Tag className="sm:inline">
                  <strong>Latest: </strong>
                  {formatDate(mostRecentEpisodeDate)}
                </Tag>
              </div>
            )}
            <div className="hidden md:inline">
              <Tag className="md:inline">
                <strong>Created: </strong>
                {formatDate(displayPodcast.created_at)}
              </Tag>
            </div>
          </div>
        </div>
      </div>

      <PodcastModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handlePodcastUpdate}
        initialData={displayPodcast}
      />
    </>
  );
}
