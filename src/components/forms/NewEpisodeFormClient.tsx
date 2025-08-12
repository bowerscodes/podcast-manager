'use client';

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/Providers";
import { NewEpisodeFormData } from "@/types/podcast";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { Episode } from "@/types/podcast";


type Props = {
  podcastId: string;
  initialData: Partial<NewEpisodeFormData>;
  onSuccess: () => void;
};

export default function NewEpisodeFormClient({ podcastId, initialData, onSuccess }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [formData, setFormData] = useState<NewEpisodeFormData>({
    title: initialData.title || "",
    description: initialData.description || "",
    audio_url: initialData.audio_url || "",
    season_number: initialData.season_number || undefined,
    episode_number: initialData.episode_number || undefined,
    explicit: initialData.explicit || false,
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const audioExtensions = [".mp3", ".m4a", ".wav", ".ogg", ".aac", ".flac"];
    const url = formData.audio_url.toLowerCase();
    const isAudio = audioExtensions.some(ext => url.endsWith(ext));

    if (!isAudio) {
      toast.error("Audio URL must point to a valid audio file (e.g. .mp3, .m4a, .wav)");
      return;
    }

    setLoading(true);
    try {
      const { error} = await supabase
        .from("episodes")
        .insert({
          ...formData,
          user_id: user.id,
          podcast_id: podcastId
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Podcast created successfully!");
      onSuccess();
    } catch (error) {
      console.error("Error creating episode: ", error);
      toast.error("Failed to create episode");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Episode Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
        autoFocus
      />
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          className="w-full p-3 border rounded-lg"
          rows={4}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />
      </div>

      <Input
        label="Audio URL"
        value={formData.audio_url}
        onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
        required
      />

      <Input
        label="Season number"
        type="number"
        value={formData.season_number}
        onChange={(e) => setFormData({ ...formData, season_number: e.target.value })}
        required
      />

      <Input
        label="Episode number"
        type="number"
        value={formData.episode_number}
        onChange={(e) => setFormData({ ...formData, episode_number: e.target.value })}
        required
      />

      <label>
        <Checkbox
          type="checkbox"
          checked={formData.explicit}
          onChange={(e) => setFormData({ ...formData, explicit: e.target.checked })}
        />
        Explicit
      </label>

      <div className="flex gap-4 mt-6">
        <Button type="submit" color="primary" isLoading={isLoading}>
          Create Podcast
        </Button>
        <Button type="button" variant="light" onPress={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
