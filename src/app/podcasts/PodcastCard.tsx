import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";

import { Podcast } from "@/types/podcast";
import { Image } from "@heroui/image";
import { defaultArtwork } from "@/lib/data";

type Props = {
  podcast: Podcast
};

export default function PodcastCard({ podcast }: Props) {
  const router = useRouter();

  return (
    <Card key={podcast.id} className="p-4">
      <CardHeader>
        <h3 className="text-lg font-semibold">{podcast.title}</h3>
      </CardHeader>
      <CardBody>
        <div className="w-full aspect-[4/3]">
          {podcast.artwork 
            ? <Image 
              alt={`podcast artwork for ${podcast.title}`} src={podcast.artwork}
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
        <p className="text-gray-600 text-sm">{podcast.description}</p>
      </CardBody>
      <CardFooter className="flex gap-2">
        <Button
          color="primary"
          size="md"
          variant="solid"
          onPress={() => router.push(`/podcasts/${podcast.id}`)}
        >
          Manage
        </Button>
        <Button
          color="default"
          size="md"
          variant="solid"
          onPress={() => router.push(podcast.rss_url)}
          target="_blank"
        >
          RSS Feed
        </Button>
      </CardFooter>
    </Card>
  );
};
