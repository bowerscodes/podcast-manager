import { Card, CardHeader, CardBody } from '@heroui/card';

import { Podcast } from '@/types/podcast';
import EpisodeRow from './EpisodeRow';
import PlaceholderEpisodeRow from './PlaceholderEpisodeRow';
import useEpisodes from '@/hooks/useEpisodes';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

type EpisodesListProps = {
  podcast: Podcast;
};

export default function EpisodesList({ podcast }: EpisodesListProps) {
  const { episodes, loading, error, refresh } = useEpisodes(podcast.id);

  if (loading) return <LoadingSpinner />;

  if (error) throw error;

  return (
    <Card className="mb-6">
      <CardHeader>
        <h2 className="heading-secondary">Episodes</h2>
      </CardHeader>
      <CardBody className="">
        {episodes.map((ep) => (
          <EpisodeRow key={ep.id} episode={ep}  onUpdate={refresh} />
        ))}
        <PlaceholderEpisodeRow podcastId={podcast.id} onEpisodeCreated={refresh} />
      </CardBody>
    </Card>
  );
};
