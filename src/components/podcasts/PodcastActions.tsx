"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Podcast } from "@/types/podcast";
import DeleteModal from "../modals/DeleteModal";
import BackButton from "../ui/BackButton";
import { Button } from "@/components/ui/Button";

type Props = {
  podcast: Podcast;
};

export default function PodcastActions({ podcast }: Props) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteSuccess = () => {
    // After successful delete, navigate back to podcasts
    router.push("/podcasts");
  };

  return (
    <>
      <div className="flex justify-between">
        <BackButton
          to="podcasts"
        />
        <Button
          variant="bordered"
          color="danger"
          onPress={() => setIsDeleteModalOpen(true)}
        >
          Delete Podcast
        </Button>
      </div>

      <DeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        podcastId={podcast.id}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
};
