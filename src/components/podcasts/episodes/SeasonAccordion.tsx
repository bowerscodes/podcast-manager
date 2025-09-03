import { useState } from 'react';

import { Episode } from '@/types/podcast';
import EpisodeRow from './EpisodeRow';
import Tag from '@/components/ui/Tag';

type SeasonAccordionProps = {
  seasonNumber: string;
  episodes: Episode[];
  onUpdate: () => void;
  defaultExpanded?: boolean;
};

// CSS-based chevron component
const ChevronIcon = ({ isExpanded }: { isExpanded: boolean }) => (
  <div 
    className={`w-2 h-2 border-r-2 border-b-2 transform transition-transform duration-200 ${
      isExpanded ? 'rotate-45' : 'rotate-[-135deg]'
    }`}
    style={{ 
      marginTop: isExpanded ? '0px' : '-1px',
      borderColor: "var(--color-primary)"
    }}
  />
);

export default function SeasonAccordion({ 
  seasonNumber, 
  episodes, 
  onUpdate, 
  defaultExpanded = true 
}: SeasonAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const seasonLabel = seasonNumber === 'null' || !seasonNumber 
    ? 'No Season' 
    : `Season ${seasonNumber}`;

  return (
    <div className="season-accordion mb-6">
      {/* Season Header */}
      <div className="relative mb-4">
        {/* Background border line */}
        <div 
          className="absolute inset-x-0 top-1/2 h-px"
          style={{ background: "var(--gradient-primary)" }}
        ></div>
        
        {/* Season label with background */}
        <div className="relative flex justify-center">
          <button
            onClick={toggleExpanded}
            className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
            style={{ 
              background: "var(--gradient-card)",
              border: "1px solid rgba(139, 92, 246, 0.2)"
            }}
          >
            <ChevronIcon isExpanded={isExpanded} />
            <span className="text-sm font-semibold text-gradient">
              {seasonLabel}
            </span>
            <Tag mode="light" color="blue">
              {episodes.length} episode{episodes.length !== 1 ? 's' : ''}
            </Tag>
          </button>
        </div>
      </div>

      {/* Episodes Container */}
      <div className={`season-episodes transition-all duration-300 ease-in-out overflow-hidden ${
        isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="space-y-2">
          {episodes.map((episode) => (
            <EpisodeRow key={episode.id} episode={episode} onUpdate={onUpdate} />
          ))}
        </div>
      </div>
    </div>
  );
}
