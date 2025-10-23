
import { Podcast } from "@/types/podcast";
import PodcastFormClient from "./PodcastFormClient";

type Props = {
  initialData?: Partial<Podcast>;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function PodcastForm({
  initialData = {},
  onSuccess,
  onCancel
}: Props) {
  return (
    <PodcastFormClient 
      initialData={initialData} 
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
};
