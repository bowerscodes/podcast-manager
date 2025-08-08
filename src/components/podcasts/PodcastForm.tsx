import { Card, CardHeader, CardBody } from "@heroui/card";

import { Podcast } from "@/types/podcast";
import PodcastFormClient from "./PodcastFormClient";

type Props = {
  initialData?: Partial<Podcast>;
};

export default function PodcastForm({
  initialData = {},
}: Props) {
  return (
    <Card>
      <CardHeader>
        <h2>Podcast Details</h2>
      </CardHeader>
      <CardBody>
        <PodcastFormClient initialData={initialData} />
      </CardBody>
    </Card>
  );
};
