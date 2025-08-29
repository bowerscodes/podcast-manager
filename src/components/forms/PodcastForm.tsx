import { Card, CardHeader, CardBody } from "@heroui/card";

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
  const isEditing = Object.keys(initialData).length > 0;

  return (
    <Card>
      <CardHeader>
        <h2 className="heading-secondary">
          {isEditing ? "Edit Podcast" : "Create Podcast"}
        </h2>
      </CardHeader>
      <CardBody>
        <PodcastFormClient 
          initialData={initialData} 
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </CardBody>
    </Card>
  );
};
