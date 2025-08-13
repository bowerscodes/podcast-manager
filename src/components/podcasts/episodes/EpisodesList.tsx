import { Card, CardHeader, CardBody } from '@heroui/card';

import { Episode, Podcast } from '@/types/podcast';
import EpisodeRow from './EpisodeRow';
import PlaceholderEpisodeRow from './PlaceholderEpisodeRow';
import useEpisodes from '@/hooks/useEpisodes';

type EpisodesListProps = {
  podcast: Podcast;
};

export default function EpisodesList({ podcast }: EpisodesListProps) {
  const { episodes, loading: episodesLoading, error: episodesError } = useEpisodes(podcast.id);

  return (
    <Card className="mb-6">
      <CardHeader>
        <h2 className="heading-secondary">Episodes</h2>
      </CardHeader>
      <CardBody className="">
        {episodes.map((ep) => (
          <EpisodeRow key={ep.id} episode={ep} podcast={podcast} />
        ))}
        <PlaceholderEpisodeRow podcastId={podcast.id} />
      </CardBody>
    </Card>
  )
}
