import { Card, CardBody } from "@heroui/card";

type Props = {
  episodeCount: number;
};

export default function PodcastStats({ episodeCount }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardBody className="text-center">
          <h3>{episodeCount}</h3>
          <p className="text-gray-600">Episodes</p>
        </CardBody>
      </Card>
      <Card>
        <CardBody className="text-center">
          <h3>0</h3>
          <p className="text-gray-600">Total Listeners</p>
        </CardBody>
      </Card>
      <Card>
        <CardBody className="text-center">
          <h3>N/A</h3>
          <p className="text-gray-600">Rating</p>
        </CardBody>
      </Card>
    </div>
  );
};
