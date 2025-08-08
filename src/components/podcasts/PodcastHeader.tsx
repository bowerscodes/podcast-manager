import { Image } from '@heroui/image';
import { useRouter } from 'next/navigation';

import { Podcast } from '@/types/podcast';
import { defaultArtwork } from '@/lib/data';
import { formatDate } from '@/lib/date-utils';
import { supabase } from '@/lib/supabase';
import EditableField from '../ui/EditableField';

type Props = {
  podcast: Podcast;
  episodeCount: number;
}

export default function PodcastHeader({ podcast, episodeCount }: Props) {
  const router = useRouter();

  const updatePodcast = async (field: string, value: string) => {
    const { error } = await supabase
      .from("podcasts")
      .update({ [field]: value })
      .eq("id", podcast.id);

    if (error) throw error;
    router.refresh();
  };

  return (
    <div className="flex items-start gap-6 mb-6">
      <div className="relative">
        {podcast.artwork 
        ? <Image 
            src={podcast.artwork}
            alt={`${podcast.title} artwork`}
            shadow="md"
            className="w-48 h-48 rounded-lg object-cover"
          />
        : <div className="w-48 h-48 shadow-lg">{defaultArtwork()}</div>
        }
      </div>
      <div className="flex-1">
        <EditableField
          value={podcast.title}
          onSave={(value) => updatePodcast("title", value)}
        >
          <h1>{podcast.title}</h1>
        </EditableField>
        <div className="mb-4">
          <EditableField
            value={podcast.description}
            onSave={(value) => updatePodcast("description", value)}
          >
            <p className="text-gray-600">{podcast.description}</p>
          </EditableField>
        </div>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>By 
            <EditableField
              value={podcast.author}
              onSave={(value) => updatePodcast("author", value)}
            >
              <span>{podcast.author}</span>
            </EditableField>
          </span>
          <span>•</span>
          <span>{episodeCount} episodes</span>
          <span>•</span>
          <span>
            Created {formatDate(podcast.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
};
