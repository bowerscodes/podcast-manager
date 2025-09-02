import { useState } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { MdDeleteForever } from "react-icons/md";
import { AiOutlineEdit } from "react-icons/ai";

import { Episode } from "@/types/podcast";
import EpisodeModal from "@/components/modals/EpisodeModal";
import DeleteModal from "@/components/modals/DeleteModal";
import ExpandableText from "@/components/ui/ExpandableText";
import Tag from "@/components/ui/Tag";
import { formatDate } from "@/lib/date-utils";

type EpisodeRowProps = {
  episode: Episode;
  onUpdate: () => void;
};

export default function EpisodeRow({ episode, onUpdate }: EpisodeRowProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <>
      <div>
        <Card className="flex flex-col mb-3 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex justify-between items-center pb-0 gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <h3 className="break-words truncate flex-shrink">
                {episode.episode_number}. {episode.title}
              </h3>
              <Tag className="flex-shrink-0" explicit={episode.explicit} mode="light" />
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Tag className="text-left text-sm font-medium" mode="light">
                {formatDate(episode.created_at)}
              </Tag>

              <div className="flex items-center flex-row gap-1 flex-shrink-0 ">
                <Button
                  className="flex items-center justify-center px-1 aspect-square w-6 h-6 min-w-0"
                  size="sm"
                  color="primary"
                  onPress={() => setIsEditModalOpen(true)}
                >
                  <AiOutlineEdit size={18} />
                </Button>
                <Button
                  className="flex items-center justify-center px-1 aspect-square w-6 h-6 min-w-0"
                  size="sm"
                  color="danger"
                  onPress={() => setIsDeleteModalOpen(true)}
                >
                  <MdDeleteForever size={18} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody className="flex-grow pt-2">
            <ExpandableText className="text-black" text={episode.description} />
          </CardBody>
        </Card>
      </div>
      <EpisodeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        podcastId={episode.podcast_id}
        initialData={episode}
        onSuccess={() => onUpdate()}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        episodeId={episode.id}
        onSuccess={() => onUpdate()}
      />
    </>
  );
}
