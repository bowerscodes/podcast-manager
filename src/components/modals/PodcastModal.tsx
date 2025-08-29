import { Modal, ModalContent } from "@heroui/modal";

import PodcastForm from "../forms/PodcastForm";
import { Podcast } from "@/types/podcast";


type PodcastModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Partial<Podcast>;
};

export default function PodcastModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  initialData
}: PodcastModalProps) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} placement="center" size="2xl">
      <ModalContent className="max-h-[90vh] overflow-y-auto">
        <PodcastForm 
          initialData={initialData}
          onSuccess={()=> {
            onClose(); 
            onSuccess();
          }}
          onCancel={onClose}
        />
      </ModalContent>
    </Modal>
  )
}
