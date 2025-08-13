
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
      <Card className="flex flex-row">
        <CardHeader className="flex-shrink-0 w-1/3">
          {episode.title}
        </CardHeader>
        <CardBody className="flex-grow">
          Description
        </CardBody>
      </Card>
    </div>
  );
};
