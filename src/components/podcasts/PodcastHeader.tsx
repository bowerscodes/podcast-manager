import { Image } from '@heroui/image';
import { Podcast } from '@/types/podcast';
import { defaultArtwork } from '@/lib/data';

type Props = {
  podcast: Podcast;
  episodeCount: number;
}

export default function PodcastHeader({ podcast, episodeCount }: Props) {
  return (
    <div className="flex items-start gap-6 mb-8">
      {podcast.artwork 
      ? <Image 
          src={podcast.artwork}
          alt={`${podcast.title} artwork`}
          className="w-48 h-48 rounded-lg object-cover shadow-lg"
        />
      : defaultArtwork()
      }
      <div className="flex-1">
        <h1>{podcast.title}</h1>
        <p className="text-gray-600 mb-4">{podcast.description}</p>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>By {podcast.author}</span>
          <span>•</span>
          <span>{episodeCount} episodes</span>
          <span>•</span>
          <span>
            Created {new Date(podcast.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};
