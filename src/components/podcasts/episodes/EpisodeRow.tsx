
import { Card, CardHeader, CardBody } from '@heroui/card';
import { Episode } from '@/types/podcast';

type EpisodeRowProps = {
  episode: Episode;
};

export default function EpisodeRow({
  episode,
}: EpisodeRowProps) {
  return (
    <div>
      <Card className="flex flex-col mb-3">
        <CardHeader className="flex-shrink-0 w-1/3 pb-0">
          <h3>{episode.episode_number}. {episode.title}</h3>
        </CardHeader>
        <CardBody className="flex-grow pt-0">
          {episode.description}
        </CardBody>
      </Card>
    </div>
  );
};
