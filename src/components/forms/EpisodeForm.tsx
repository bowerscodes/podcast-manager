import { Card, CardHeader, CardBody } from '@heroui/card';

import { Episode } from '@/types/podcast';
import EpisodeFormClient from './EpisodeFormClient';

type Props = {
  podcastId: string;
  initialData?: Partial<Episode>;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EpisodeForm({ podcastId, initialData = {}, onSuccess, onCancel }: Props) {
  const isEditing = Object.keys(initialData).length > 0;

  return (
    <Card>
      <CardHeader>
        <h2 className="heading-secondary">
          {isEditing ? "Edit Episode" : "Add Episode"}
        </h2>
      </CardHeader>
      <CardBody>
        <EpisodeFormClient 
          podcastId={podcastId} 
          initialData={initialData} 
          onSuccess={onSuccess} 
          onCancel={onCancel} 
        />
      </CardBody>
    </Card>
  );
};
