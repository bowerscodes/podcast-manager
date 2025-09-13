import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@heroui/card";
import { Image } from "@heroui/image";

import { Podcast } from "@/types/podcast";
import { defaultArtwork } from "@/lib/data";
import { supabase } from "@/lib/supabase";

type Props = {
  podcast: Podcast;
};

export default function PodcastCard({ podcast }: Props) {
  const router = useRouter();

  const [profile, setProfile] = useState<{ username: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", podcast.user_id)
        .single();
      
      if (data) {
        setProfile(data);
      }
    }

    fetchProfile();
  }, [podcast.user_id]);

  return (
    <Card
      className="w-full h-[300px] podcast-card border-gradient group relative overflow-hidden"
      isPressable
      onPress={() => {
        if (profile?.username) {
          router.push(`/${profile.username}/${podcast.podcast_name}`);
        }
      }}
    >
      {podcast.artwork ? (
        <Image
          removeWrapper
          alt={`podcast artwork for ${podcast.title}`}
          className="absolute inset-0 w-full h-full object-cover pbject-center z-0 -top-1 scale-105"
          src={podcast.artwork}
          tabIndex={-1}
        />
      ) : (
        defaultArtwork()
      )}

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-5" />

      <div className="absolute text-left bottom-0 left-0 right-0 z-10 p-4 space-y-2">
        <h3
          className="text-white font-bold text-xl leading-tight truncate drop-shadow-lg"
          style={{
            textShadow:
              "0 0 3px rgba(0,0,0,0.6), 1px 1px 2px rgba(0,0,0,0.3), 2px 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          {podcast.title}
        </h3>
        <p
          className="text-white/90 text-sm font-medium line-clamp-2 leading-relaxed"
          style={{
            textShadow: "0 0 2px rgba(0,0,0,0.8), 2px 2px 3px rgba(0,0,0,0.7)",
          }}
        >
          {podcast.description}
        </p>
      </div>
    </Card>
  );
}
