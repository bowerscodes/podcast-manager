import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Podcast } from '@/types/podcast';
import { defaultArtwork } from '@/lib/data';
import { formatDate } from '@/lib/date-utils';
import { supabase } from '@/lib/supabase';
import EditableField from '../ui/EditableField';
import EditableImage from '../ui/EditableImage';
import ExplicitTag from '../ui/ExplicitTag';
import ExpandableText from '../ui/ExpandableText';

type Props = {
  podcast: Podcast;
  episodeCount: number;
};

export default function PodcastHeader({ podcast, episodeCount }: Props) {
  const router = useRouter();
  const [localPodcast, setLocalPodcast] = useState(podcast);

  const updatePodcast = async (field: string, value: string) => {
    // Optimistic update: Update local state immediately
    setLocalPodcast((prev) => ({ ...prev, [field]: value }));

    try {
      // Then update the database
      const { error } = await supabase
        .from("podcasts")
        .update({ [field]: value })
        .eq("id", podcast.id);

      if (error) {
        // If database fails, revert the local state
        setLocalPodcast((prev) => ({
          ...prev,
          [field]: podcast[field as keyof Podcast],
        }));
        throw error;
      }
      // Refresh router cache in background
      router.refresh();
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="flex items-start gap-6 mb-6">
      <EditableImage 
        src={localPodcast.artwork}
        alt={`${localPodcast.title} artwork`}
        onSave={(imageUrl) => updatePodcast("artwork", imageUrl)}
        fallback={defaultArtwork()}
        className="shadow-md"
      />
      <div className="flex-1">
        <div className="flex gap-2 mb-2">
          <EditableField
            value={localPodcast.title}
            onSave={(value) => updatePodcast("title", value)}
          >
            <h1>{localPodcast.title}</h1>
          </EditableField>
          <ExplicitTag isExplicit={podcast.explicit} className="flex my-auto" />
        </div>        
        <div className="mb-4">
          <EditableField
            value={localPodcast.description}
            onSave={(value) => updatePodcast("description", value)}
            maxLines={3}
          >
            <ExpandableText 
              text={localPodcast.description}
              maxLines={3}
            />
          </EditableField>
        </div>
        <div className="text-sm gap-1 text-gray-500 h-5 mb-2 flex items-start">
            By {" "}
            <EditableField
              value={localPodcast.author}
              onSave={(value) => updatePodcast("author", value)}
            >
              <span>{localPodcast.author}</span>
            </EditableField>
        </div>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>{episodeCount} episodes</span>
          <span>•</span>
          <span>Created {formatDate(localPodcast.created_at)}</span>
        </div>
      </div>
    </div>
  );
};
