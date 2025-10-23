import { useState } from "react";
import toast from "react-hot-toast";

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/Modal";

type DeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
} & (
  | { podcastId: string; episodeId?: never }
  | { episodeId: string; podcastId?: never }
);

export default function DeleteModal(props: DeleteModalProps) {
  const { isOpen, onClose, onSuccess } = props;
  const [isDeleting, setIsDeleting] = useState(false);

  const isDeletePodcast = "podcastId" in props;
  const itemType = isDeletePodcast ? "Podcast" : "Episode";
  const itemId = isDeletePodcast ? props.podcastId : props.episodeId;

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from(isDeletePodcast ? "podcasts" : "episodes")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error(`Error deleting ${itemType.toLowerCase()}: `, error);
      toast.error(`Failed to delete ${itemType.toLowerCase()}`);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center">
      <ModalContent className="max-h-[90vh] overflow-y-auto">
        <ModalHeader className="heading-secondary">Delete {itemType}</ModalHeader>
        <ModalBody>
          <p className="font-normal">
            Are you sure you want to delete this {itemType.toLowerCase()}? This action cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="bordered"
            onPress={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            color="danger"
            onPress={handleDelete}
            isLoading={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
