
import { Card, CardHeader, CardBody } from '@heroui/card';
import { Episode, Podcast } from '@/types/podcast';

type EpisodeRowProps = {
  episode: Episode;
  podcast?: Podcast;
};

export default function EpisodeRow({
  episode,
  podcast
}: EpisodeRowProps) {
  return (
    <div>
      <Card>
        <CardHeader>
          {episode.title}
        </CardHeader>
        <CardBody>

        </CardBody>
      </Card>
    </div>
  );
};
