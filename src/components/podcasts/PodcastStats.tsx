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

  const statsCards = [
    {
      value: episodeCount,
      attribute: "Episodes"
    },
    {
      value: totalDownloads.toLocaleString(),
      attribute: "Total Downloads"
    },
    {
      value: uniqueListeners.toLocaleString(),
      attribute: "Unique Listeners"
    },
    {
      value: topPlatform,
      attribute: "Top Platform"
    }
  ];

  return (
    <div className="podcast-stats-container gap-4 mb-6">
      {statsCards.map((card, index) => (
        <Card key={index} className="stats-card" style={{ background: "var(--gradient-card-subtle)" }}>
          <CardBody className="text-center">
            <h3 className="text-2xl font-bold text-gradient">
              {card.value}
            </h3>
            <p className="text-muted">
              {card.attribute}
            </p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};
