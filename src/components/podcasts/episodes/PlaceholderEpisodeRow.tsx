import { useState } from 'react';
import { Card, CardBody } from '@heroui/card';
import { AiOutlinePlusCircle } from 'react-icons/ai';
import EpisodeModal from '@/components/modals/EpisodeModal';


type Props = {
  podcastId: string;
  onEpisodeCreated: () => void;
  isFirstInList?: boolean;
};


export default function PlaceholderEpisodeRow({ podcastId, onEpisodeCreated, isFirstInList }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card
        className="podcast-card group border-2 border-dashed w-[100%] mt-1"
        style={{
          borderColor: 'rgba(139, 92, 246, 0.3)',
          background: 'rgba(139, 92, 246, 0.05)'
        }}
        isPressable
        onPress={() => setIsModalOpen(true)}
      >
        <CardBody className="flex flex-row items-center justify-center text-center">
          <div 
            className="rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300"
            style={{
              background: 'var(--gradient-primary)',
            }}
          >
            <AiOutlinePlusCircle className="text-white text-2xl" size={28} />          
          </div>
          <h3 className="text-gradient text-lg font-semibold ">
            Add new Episode
          </h3>
          {isFirstInList &&
            <p className="text-muted text-sm max-w-xs">
              Create your first Epidode to get started
            </p>
          }
        </CardBody>
      </Card>
      <EpisodeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        podcastId={podcastId}
        onSuccess={onEpisodeCreated}
      />
    </>
  );
};
