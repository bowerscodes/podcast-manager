import { Card, CardHeader, CardBody } from '@heroui/card';

import { Episode, Podcast } from '@/types/podcast';
import EpisodeRow from './EpisodeRow';
import PlaceholderEpisodeRow from './PlaceholderEpisodeRow';

type EpisodesListProps = {
  episodes: Episode[];
  podcast: Podcast;
};

export default function EpisodesList({ episodes, podcast }: EpisodesListProps) {
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
