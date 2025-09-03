import { Card, CardHeader, CardBody } from '@heroui/card';
import { useMemo } from 'react';

import { Podcast } from '@/types/podcast';
import SeasonAccordion from './SeasonAccordion';
import PlaceholderEpisodeRow from './PlaceholderEpisodeRow';
import useEpisodes from '@/hooks/useEpisodes';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

type EpisodesListProps = {
  podcast: Podcast;
};

export default function EpisodesList({ podcast }: EpisodesListProps) {
  const { episodes, loading, error, refresh } = useEpisodes(podcast.id);

  // Group episodes by season
  const episodesBySeasons = useMemo(() => {
    const grouped = episodes.reduce((acc, episode) => {
      const seasonKey = episode.season_number || 'null';
      if (!acc[seasonKey]) {
        acc[seasonKey] = [];
      }
      acc[seasonKey].push(episode);
      return acc;
    }, {} as Record<string, typeof episodes>);

    // Sort seasons: numbered seasons first (ascending), then 'null' last
    const sortedSeasons = Object.keys(grouped).sort((a, b) => {
      if (a === 'null') return 1;
      if (b === 'null') return -1;
      return parseInt(a) - parseInt(b);
    });

    return sortedSeasons.map(seasonNumber => ({
      seasonNumber,
      episodes: grouped[seasonNumber]
    }));
  }, [episodes]);

  if (loading) return <LoadingSpinner />;

  if (error) throw error;

  return (
    <Card className="mb-6" style={{ background: "var(--gradient-card-subtle)" }}>
      <CardHeader>
        <h2 className="heading-secondary">Episodes</h2>
      </CardHeader>
      <CardBody>
        {episodesBySeasons.map(({ seasonNumber, episodes }, index) => (
          <SeasonAccordion
            key={seasonNumber}
            seasonNumber={seasonNumber}
            episodes={episodes}
            onUpdate={refresh}
            defaultExpanded={true}
            isLastSeason={index === episodesBySeasons.length - 1}
          />
        ))}
        <PlaceholderEpisodeRow podcastId={podcast.id} onEpisodeCreated={refresh} />
      </CardBody>
    </Card>
  );
};
