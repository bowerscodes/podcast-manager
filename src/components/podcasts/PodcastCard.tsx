import { useRouter } from "next/navigation";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Image } from "@heroui/image";

import { Podcast } from "@/types/podcast";
import { defaultArtwork } from "@/lib/data";

type Props = {
  podcast: Podcast
};

export default function PodcastCard({ podcast }: Props) {
  const router = useRouter();

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  return (
    <Card 
      className="podcast-card group"
      isPressable
      onPress={() => router.push(`/podcasts/${podcast.id}`)} 
    >
      <CardHeader className="pb-2">
        <h3 className="text-xl font-bold text-gradient">
          {podcast.title}
        </h3>
      </CardHeader>
      <CardBody className="pt-2">
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
          {podcast.artwork 
            ? <Image 
              alt={`podcast artwork for ${podcast.title}`} 
              src={podcast.artwork}
              radius="sm"
              className="w-full h-full object-cover"
              classNames={{
                wrapper: "w-full h-full",
                img: "w-full h-full object-cover"
              }}
              width="100%"
              height="100%"
            />
            : defaultArtwork()
          }
        </div>
      </CardBody>
      <CardFooter 
        className="pt-4"
      >
        <p className="text-muted text-sm">{truncateText(podcast.description)}</p>
      </CardFooter>
    </Card>
  );
};
