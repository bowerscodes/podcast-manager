import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@/components/ui/Modal";
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
    <Modal isOpen={isOpen} onOpenChange={handleOpenChange} placement="center" size="xl">
      <ModalContent className="max-h-[90vh] overflow-y-auto">
        <ModalHeader>
          {initialData && Object.keys(initialData).length > 0 ? "Edit Podcast" : "Create Podcast"}
        </ModalHeader>
        <ModalBody>
          <PodcastForm 
            key={formKey}
            initialData={initialData}
            onSuccess={()=> {
              onClose(); 
              onSuccess();
            }}
            onCancel={onClose}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
