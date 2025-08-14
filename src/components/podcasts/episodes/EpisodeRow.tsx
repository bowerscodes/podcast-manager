import { useState } from 'react';
import { Card, CardHeader, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { MdDeleteForever } from "react-icons/md";
import { AiOutlineEdit } from "react-icons/ai";

import { Episode } from '@/types/podcast';
import EpisodeModal from '@/components/modals/EpisodeModal';
import DeleteModal from '@/components/modals/DeleteModal';

type EpisodeRowProps = {
  episode: Episode;
  onUpdate: () => void;
};

export default function EpisodeRow({ 
  episode, 
  onUpdate, 
}: EpisodeRowProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <>
      <div>
        <Card className="flex flex-col mb-3">
          <CardHeader className="flex justify-between items-center pb-0">
            <h3>{episode.episode_number}. {episode.title}</h3>
            <div className="flex flex-row gap-1">
              <Button 
                className="flex items-center justify-center px-1 aspect-square min-w-0" 
                size="sm" 
                color="primary"
                onPress={() => setIsEditModalOpen(true)}
              >
                <AiOutlineEdit size={18} />
              </Button>
              <Button 
                className="flex items-center justify-center px-1 aspect-square min-w-0" 
                size="sm" 
                color="danger"
                onPress={() => setIsDeleteModalOpen(true)}
              >
                <MdDeleteForever size={18} />
              </Button>
            </div>
          </CardHeader>
          <CardBody className="flex-grow pt-0">
            {episode.description}
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
};
