import { useState } from "react";
import { MdDeleteForever } from "react-icons/md";
import { AiOutlineEdit } from "react-icons/ai";

import { Episode } from "@/types/podcast";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import EpisodeModal from "@/components/modals/EpisodeModal";
import DeleteModal from "@/components/modals/DeleteModal";
import ExpandableText from "@/components/ui/ExpandableText";
import Tag from "@/components/ui/Tag";
import { formatDate } from "@/lib/date-utils";

type EpisodeRowProps = {
  episode: Episode;
  onUpdate: () => void;
  className?: string;
};

export default function EpisodeRow({
  episode,
  onUpdate,
  className = "",
}: EpisodeRowProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <>
      <div className={className}>
        <Card className="flex flex-col p-3 mb-3 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex justify-between items-center pb-0 gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <h3 className="break-words truncate flex-shrink">
                {episode.episode_number}. {episode.title}
              </h3>
              <Tag
                className="flex-shrink-0"
                explicit={episode.explicit}
                mode="light"
              />
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {episode.status === "draft" ? (
                <Tag className="text-left text-sm" color="yellow" mode="light">
                  DRAFT
                </Tag>
              ) : (
                <Tag className="text-left text-sm" mode="light">
                  {formatDate(episode.publish_date)}
                </Tag>
              )}
              <div className="flex items-center flex-row gap-1 flex-shrink-0 ">
                <Button
                  isIconOnly
                  size="sm"
                  color="primary"
                  variant="solid"
                  onPress={() => setIsEditModalOpen(true)}
                  aria-label="Edit episode"
                >
                  <AiOutlineEdit size={18} />
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  color="danger"
                  variant="solid"
                  onPress={() => setIsDeleteModalOpen(true)}
                  aria-label="Delete episode"
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
