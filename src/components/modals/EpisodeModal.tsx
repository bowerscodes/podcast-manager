
import EpisodeForm from "../forms/EpisodeForm";
import { Episode } from "@/types/podcast";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@/components/ui/Modal";

type EpisodeModalProps = {
  isOpen: boolean;
  podcastId: string;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Partial<Episode>;
};

export default function EpisodeModal({
  isOpen,
  podcastId,
  onClose,
  onSuccess,
  initialData,
}: EpisodeModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center">
      <ModalContent className="max-h-[90vh] overflow-y-auto">
        <ModalHeader>
          {initialData && Object.keys(initialData).length > 0 ? "Edit Episode" : "Add Episode"}
        </ModalHeader>
        <ModalBody>
          <EpisodeForm
            podcastId={podcastId}
            initialData={initialData}
            onSuccess={() => {
              onClose();
              onSuccess();
            }}
            onCancel={onClose}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
