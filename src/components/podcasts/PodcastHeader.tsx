import { useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { Button } from "@heroui/button";

import { Podcast } from "@/types/podcast";
import { formatDate } from "@/lib/date-utils";
import { supabase } from "@/lib/supabase";
import EditableImage from "../ui/EditableImage";
import ExplicitTag from "../ui/ExplicitTag";
import ExpandableText from "../ui/ExpandableText";
import usePodcast from "@/hooks/usePodcast";
import PodcastModal from "../modals/PodcastModal";
import { useAuth } from "../auth/Provider";

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const displayPodcast = podcast || initialPodcast;

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
            fallback={undefined}
            className="rounded-lg shadow-md"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <h1 className="text-3xl font-bold truncate">
                {displayPodcast.title}
              </h1>
              <ExplicitTag isExplicit={displayPodcast.explicit} />
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
          <div className="flex gap-4 text-sm text-gray-500">
            <span>{episodeCount} episodes</span>
            <span>•</span>
            <span>Created {formatDate(displayPodcast.created_at)}</span>
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
