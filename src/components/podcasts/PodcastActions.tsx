"use client";

import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Podcast } from "@/types/podcast";
import DeleteModal from "../modals/DeleteModal";
import BackButton from "../ui/BackButton";

type Props = {
  podcast: Podcast;
};

export default function PodcastActions({ podcast }: Props) {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, []);

  const handleBack = () => {
    if (canGoBack) {
      router.back();
    }
    else {
      router.push("/podcasts")
    }
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
        onSuccess={handleBack}
      />
    </>
  );
};
