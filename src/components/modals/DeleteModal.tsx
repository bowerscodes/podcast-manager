import { Modal, ModalContent } from "@heroui/modal";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { Button } from "@heroui/button";


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
  const itemId = isDeletePodcast ? props.podcastId : props.episodeId

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from(isDeletePodcast ? "podcasts" : "episodes")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      toast.success(`${itemType} deleted successfully`);
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
    <Modal isOpen={isOpen} onOpenChange={onClose} placement="center">
      <ModalContent className="max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <h3 className="heading-secondary">Delete {itemType}</h3>
          </CardHeader>
          <CardBody>
            <p className="font-normal">
              Are you sure you want to delete this {itemType.toLowerCase()}? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="bordered"
                onPress={onClose}
                disabled= {isDeleting}
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
            </div>
          </CardBody>
        </Card>
      </ModalContent>
    </Modal>
  );
};
