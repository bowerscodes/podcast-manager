import { useState } from "react";
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
  const [formKey, setFormKey] = useState(0);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    } else {
      setFormKey((k) => k + 1);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={handleOpenChange} placement="center" size="2xl">
      <ModalContent className="max-h-[90vh] overflow-y-auto">
        <PodcastForm 
          key={formKey}
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
