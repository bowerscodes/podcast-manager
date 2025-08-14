import { Modal, ModalContent } from "@heroui/modal";

import EpisodeForm from "../forms/EpisodeForm";
import { Episode } from "@/types/podcast";

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
    <Modal isOpen={isOpen} onOpenChange={onClose} placement="center">
      <ModalContent className="max-h-[90vh] overflow-y-auto">
        <EpisodeForm
          podcastId={podcastId}
          initialData={initialData}
          onSuccess={() => {
            onClose();
            onSuccess();
          }}
          onCancel={onClose}
        />
      </ModalContent>
    </Modal>
  );
};
