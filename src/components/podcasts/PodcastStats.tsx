import { Card, CardBody } from "@heroui/card";

type Props = {
  episodeCount: number;
  totalDownloads?: number;
  uniqueListeners?: number;
  platformBreakdown?: Record<string, number>
};

export default function PodcastStats({ 
  episodeCount,
  totalDownloads = 0,
  uniqueListeners= 0,
  platformBreakdown = {} 
}: Props) {
  const topPlatform = Object.entries(platformBreakdown)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || "None";

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardBody className="text-center">
          <h3>{episodeCount}</h3>
          <p className="text-gray-600">Episodes</p>
        </CardBody>
      </Card>
      <Card>
        <CardBody className="text-center">
          <h3>{totalDownloads.toLocaleString()}</h3>
          <p className="text-gray-600">Total Downloads</p>
        </CardBody>
      </Card>
      <Card>
        <CardBody className="text-center">
          <h3>{uniqueListeners.toLocaleString()}</h3>
          <p className="text-gray-600">Unique Listeners</p>
        </CardBody>
      </Card>
      <Card>
        <CardBody className="text-center">
          <h3>{topPlatform}</h3>
          <p className="text-gray-600">Top Platform</p>
        </CardBody>
      </Card>
    </div>
  );
};
