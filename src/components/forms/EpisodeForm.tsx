import { Episode } from '@/types/podcast';
import EpisodeFormClient from './EpisodeFormClient';

type Props = {
  podcastId: string;
  initialData?: Partial<Episode>;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EpisodeForm({ podcastId, initialData = {}, onSuccess, onCancel }: Props) {
  return (
    <EpisodeFormClient 
      podcastId={podcastId} 
      initialData={initialData} 
      onSuccess={onSuccess} 
      onCancel={onCancel} 
    />
  );
};
