import { useEffect, useMemo, useRef } from "react";

import { Podcast } from "@/types/podcast";
import SeasonAccordion from "./SeasonAccordion";
import PlaceholderEpisodeRow from "./PlaceholderEpisodeRow";
import useEpisodes from "@/hooks/useEpisodes";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

type EpisodesListProps = {
  podcast: Podcast;
};

export default function EpisodesList({ podcast }: EpisodesListProps) {
  const { episodes, loading, error, refresh } = useEpisodes(podcast.id);
  const containerRef = useRef<HTMLDivElement>(null);

  // Group episodes by season
  const episodesBySeasons = useMemo(() => {
    const grouped = episodes.reduce((acc, episode) => {
      // Handle undefined season_number by providing a default value
      const seasonKey = episode.season_number || "null";
      if (!acc[seasonKey]) {
        acc[seasonKey] = [];
      }
      acc[seasonKey].push(episode);
      return acc;
    }, {} as Record<string, typeof episodes>);

    // Sort seasons: numbered seasons first (ascending), then 'null' last
    const sortedSeasons = Object.keys(grouped).sort((a, b) => {
      if (a === "null") return 1;
      if (b === "null") return -1;
      return parseInt(a) - parseInt(b);
    });

    return sortedSeasons.map((seasonNumber) => ({
      seasonNumber,
      episodes: grouped[seasonNumber].sort((a, b) => {
        // Sort episodes within each season by episode number
      const episodeA = parseInt(a.episode_number ?? "0");
      const episodeB = parseInt(b.episode_number ?? "0");
      return episodeA - episodeB;
      }),
    }));
  }, [episodes]);

  // Force height recalculation when episodes change
  useEffect(() => {
    if (containerRef.current) {
      // Force reflow by temporarily changing and reverting a style property
      const container = containerRef.current;
      const expandableContent = container.closest('[data-expanded="true"]');
      if (expandableContent) {
        // Trigger a reflow on the expandableContent
        const element = expandableContent as HTMLElement;
        element.style.height = "auto";
        void element.offsetHeight;
      }
    }
  }, [episodes.length, episodesBySeasons.length]);

  if (loading) return <LoadingSpinner />;

  if (error) throw error;

  return (
    <div
      ref={containerRef}
      className="episodes-list-container w-full"
      style={{
        minHeight: "fit-content",
        height: "auto"
      }}
    >
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
      <PlaceholderEpisodeRow
        podcastId={podcast.id}
        onEpisodeCreated={refresh}
      />
    </div>
  );
}
