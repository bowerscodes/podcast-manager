import { useState } from 'react';
import { Card, CardBody } from '@heroui/card';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/modal';
import { AiOutlinePlusCircle } from 'react-icons/ai';
import NewEpisodeForm from '@/components/forms/NewEpisodeForm';


type Props = {
  podcastId: string;
  isFirstInList?: boolean;
};


export default function PlaceholderEpisodeRow({ podcastId, isFirstInList }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card
        className="podcast-card group border-2 border-dashed"
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
      <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen} placement="center">
        <ModalContent>
          <NewEpisodeForm podcastId={podcastId} onSuccess={() => setIsModalOpen(false)} />
        </ModalContent>
      </Modal>
    </>
  )
}
