import { Episode } from "@/types/podcast";
import EpisodeRow from "./EpisodeRow";
import Tag from "@/components/ui/Tag";
import ExpandableContent from "@/components/ui/ExpandableContent";
import { MdExpandLess, MdExpandMore } from "react-icons/md";

type SeasonAccordionProps = {
  seasonNumber: string;
  episodes: Episode[];
  onUpdate: () => void;
  defaultExpanded?: boolean;
  className?: string;
  isLastSeason?: boolean;
};

export default function SeasonAccordion({
  seasonNumber,
  episodes,
  onUpdate,
  defaultExpanded = true,
  className = "",
  isLastSeason = false,
}: SeasonAccordionProps) {

  const seasonLabel =
    seasonNumber === "null" || !seasonNumber
      ? "No Season"
      : `Season ${seasonNumber}`;

  const customHeader = (isExpanded: boolean) => (
    <div className="relative mb-4  pt-0">
      {/* Background border line */}
      <div
        className="absolute inset-x-0 top-1/2 h-px"
        style={{ background: "var(--gradient-primary)" }}
      />

      {/* Season label with background */}
      <div className="relative flex justify-center">
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          style={{
            background: "var(--gradient-card)",
            border: "1px solid rgba(139, 92, 246, 0.2)",
          }}
        >
          <div className="text-gray-600 transition-colors">
            {isExpanded ? (
              <MdExpandLess size={16} className="transition-transform duration-200" />
            ) : (
              <MdExpandMore size={16} className="transition-transform duration-200" />
            )}
          </div>
          <span className="text-sm font-semibold text-gradient">
            {seasonLabel}
          </span>
          <Tag mode="light" color="blue">
            {episodes.length} episode{episodes.length !== 1 ? "s" : ""}
          </Tag>
        </div>
      </div>
    </div>
  );

  return (
    <ExpandableContent
      variant="season"
      customHeader={customHeader}
      defaultExpanded={defaultExpanded}
      className={className}
      contentClassName="space-y-2"
    >
      {episodes.map((episode, index) => (
        <EpisodeRow
          key={episode.id}
          episode={episode}
          onUpdate={onUpdate}
          className={
            // Add margin to last episode if not the last season
            !isLastSeason && index === episodes.length - 1 ? "mb-8" : ""
          }
        />
      ))}
    </ExpandableContent>
  );
}
