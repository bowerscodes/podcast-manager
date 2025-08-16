import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/Providers";
import { EpisodeFormData } from "@/types/podcast";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";
import toast from "react-hot-toast";

type Props = {
  podcastId: string;
  initialData: Partial<EpisodeFormData>;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function EpisodeFormClient({
  podcastId,
  initialData,
  onSuccess,
  onCancel,
}: Props) {
  const { user } = useAuth();
  const [isLoading, setLoading] = useState(false);
  const [episodes, setEpisodes] = useState<
    Array<{ season_number: string; episode_number: string }>
  >([]);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState<EpisodeFormData>({
    id: initialData.id || "",
    title: initialData.title || "",
    description: initialData.description || "",
    audio_url: initialData.audio_url || "",
    season_number: initialData.season_number || undefined,
    episode_number: initialData.episode_number || undefined,
    explicit: initialData.explicit || false,
  });

  useEffect(() => {
    const fetchEpisodesAndSetDefaults = async () => {
      const editMode = !!(
        initialData.season_number && initialData.episode_number
      );
      setIsEditMode(editMode);

      const { data: epsiodesData, error } = await supabase
        .from("episodes")
        .select("season_number, episode_number")
        .eq("podcast_id", podcastId);

      if (error) {
        console.error("Error fetching episodes: ", error);
        return;
      }

      setEpisodes(epsiodesData || []);

      if (!editMode && epsiodesData) {
        const { defaultSeason, defaultEpisode } =
          calculateDefaults(epsiodesData);
        setFormData((prev) => ({
          ...prev,
          season_number: defaultSeason.toString(),
          episode_number: defaultEpisode.toString(),
        }));
      }
    };

    fetchEpisodesAndSetDefaults();
  }, [podcastId, initialData.season_number, initialData.episode_number]);

  const calculateDefaults = (
    episodesData: Array<{ season_number: string; episode_number: string }>
  ) => {
    if (!episodesData.length) {
      return { defaultSeason: 1, defaultEpisode: 1 };
    }

    const seasons = episodesData
      .map((ep) => parseInt(ep.season_number))
      .filter((n) => !isNaN(n));
    const newestSeason = Math.max(...seasons);

    const episodesInNewestSeason = episodesData
      .filter((ep) => parseInt(ep.season_number) === newestSeason)
      .map((ep) => parseInt(ep.episode_number))
      .filter((n) => !isNaN(n));

    const nextEpisode = episodesInNewestSeason.length
      ? Math.max(...episodesInNewestSeason) + 1
      : 1;

    return { defaultSeason: newestSeason, defaultEpisode: nextEpisode };
  };

  const handleSeasonChange = (newSeason: string) => {
    setFormData((prev) => ({ ...prev, season_number: newSeason }));

    if (!isEditMode && episodes.length > 0) {
      const seasonNum = parseInt(newSeason);
      if (!isNaN(seasonNum)) {
        const episodesInSeason = episodes
          .filter((ep) => parseInt(ep.season_number) === seasonNum)
          .map((ep) => parseInt(ep.episode_number))
          .filter((n) => !isNaN(n));

        const nextEpisode = episodesInSeason.length
          ? Math.max(...episodesInSeason) + 1
          : 1;

        setFormData((prev) => ({
          ...prev,
          episode_number: nextEpisode.toString(),
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const audioExtensions = [".mp3", ".m4a", ".wav", ".ogg", ".aac", ".flac"];
    const url = formData.audio_url.toLowerCase();
    const isAudio = audioExtensions.some((ext) => url.endsWith(ext));

    if (!isAudio) {
      toast.error(
        "Audio URL must point to a valid audio file (e.g. .mp3, .m4a, .wav)"
      );
      return;
    }

    // use cached episode data instead of fetching again
    const episodesData = episodes;

    // Get all episode numbers in current season
    const episodesInSeason = episodesData?.filter(
      (ep) =>
        parseInt(ep.season_number as string) ===
        parseInt(formData.season_number as string)
    );
    const existingEpisodeNumbers = episodesInSeason
      ?.map((ep) => parseInt(ep.episode_number))
      .filter((n) => !isNaN(n));
    const maxEpisode = existingEpisodeNumbers?.length
      ? Math.max(...existingEpisodeNumbers)
      : 0;
    const selectedEpisode = parseInt(formData.episode_number as string);

    if (
      selectedEpisode > maxEpisode + 1 ||
      (maxEpisode > 0 &&
        selectedEpisode < maxEpisode &&
        !existingEpisodeNumbers?.includes(selectedEpisode))
    ) {
      toast.error(
        `you cannot skip episode numbers. the next episode should be ${
          maxEpisode + 1
        }`
      );
      return;
    }

    // Check for duplicate episode number in the same season
    const duplicate = episodesData?.some((ep) => {
      const isSameSeason =
        parseInt(ep.season_number as string) ===
        parseInt(formData.season_number as string);
      const isSameEpisodeNumber = ep.episode_number === formData.episode_number;

      // If we're in edit mode, exclude the current episode from duplicate check
      if (isEditMode) {
        const isCurrentEpisode =
          ep.season_number === initialData.season_number &&
          ep.episode_number === initialData.episode_number;
        return isSameSeason && isSameEpisodeNumber && !isCurrentEpisode;
      }
      // For new episodes, check normally
      return isSameSeason && isSameEpisodeNumber;
    });

    if (duplicate) {
      toast.error(
        "This episode number already exists in the selected season. Pick an unused episode number."
      );
      return;
    }

    // Prevent skipped seasons
    const existingSeasons = episodesData
      ?.map((ep) => parseInt(ep.season_number))
      .filter((n) => !isNaN(n));
    const maxSeason = existingSeasons?.length
      ? Math.max(...existingSeasons)
      : 0;
    const selectedSeason = parseInt(formData.season_number as string);

    if (
      selectedSeason > maxSeason + 1 ||
      (maxSeason > 0 &&
        selectedSeason < maxSeason &&
        !existingSeasons?.includes(selectedSeason))
    ) {
      toast.error(
        `You cannot skip seasons. the next season should be ${maxSeason + 1}`
      );
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        const { error } = await supabase
          .from("episodes")
          .update({
            title: formData.title,
            description: formData.description,
            audio_url: formData.audio_url,
            season_number: formData.season_number,
            episode_number: formData.episode_number,
            explicit: formData.explicit,
          })
          .eq("id", initialData.id)
          .select()
          .single();

        if (error) {
          console.error("Supabase update error:", error);
          throw error;
        }

      } else {
        const { error } = await supabase
          .from("episodes")
          .insert({
            title: formData.title,
            description: formData.description,
            audio_url: formData.audio_url,
            season_number: formData.season_number,
            episode_number: formData.episode_number,
            explicit: formData.explicit,
            podcast_id: podcastId,
            publish_date: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error("Supabase insert error:", error);
          throw error;
        }

      }

      toast.success(
        isEditMode
          ? "Episode updated successfully!"
          : "Episode created successfully!"
      );
      onSuccess();
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} episode:`,
        error
      );
      toast.error(`Failed to ${isEditMode ? "update" : "create"} episode`);
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
        <label className="block text-sm font-normal mb-2">Description</label>
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
        onChange={(e) =>
          setFormData({ ...formData, audio_url: e.target.value })
        }
        required
      />

      <Input
        label="Season number"
        type="number"
        value={formData.season_number ?? ""}
        onChange={(e) => handleSeasonChange(e.target.value)}
        required
      />

      <Input
        label="Episode number"
        type="number"
        value={formData.episode_number ?? ""}
        onChange={(e) =>
          setFormData({ ...formData, episode_number: e.target.value })
        }
        required
      />

      <label>
        <Checkbox
          isSelected={formData.explicit}
          onValueChange={(checked) => setFormData({ ...formData, explicit: checked })}
        />
        Explicit
      </label>

      <div className="flex gap-4 mt-6">
        <Button type="submit" color="primary" isLoading={isLoading}>
          {isEditMode ? "Update" : "Add"} Episode
        </Button>
        <Button type="button" variant="light" onPress={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
