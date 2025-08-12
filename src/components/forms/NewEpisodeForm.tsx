import { Card, CardHeader, CardBody } from '@heroui/card';

import { Episode } from '@/types/podcast';
import NewEpisodeFormClient from './NewEpisodeFormClient';

type Props = {
  podcastId: string;
  initialData?: Partial<Episode>;
  onSuccess: () => void;
}

export default function NewEpisodeForm({ podcastId, initialData = {}, onSuccess }: Props) {
  return (
    <Card>
      <CardHeader>
        <h2 className="heading-secondary">Add Espisode</h2>
      </CardHeader>
      <CardBody>
        <NewEpisodeFormClient podcastId={podcastId} initialData={initialData} onSuccess={onSuccess} />
      </CardBody>
    </Card>
  )
}
