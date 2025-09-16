import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/Providers";
import { EpisodeFormData } from "@/types/podcast";
import { useFormPersistence } from "@/hooks/useFormPersistence";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
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

  const { formData, setFormData, clearPersistedData } = useFormPersistence(
    `episode-form-${podcastId}-${initialData.id || "new"}`,
    {
      id: initialData.id || "",
      title: initialData.title || "",
      description: initialData.description || "",
      audio_url: initialData.audio_url || "",
      season_number: initialData.season_number || undefined,
      episode_number: initialData.episode_number || undefined,
      explicit: initialData.explicit || false,
      status: initialData.status || "published",
    }
  );

  useEffect(() => {
    const fetchEpisodesAndSetDefaults = async () => {
      const editMode = !!(
        initialData.season_number && initialData.episode_number
      );
      setIsEditMode(editMode);

      const { data: epsiodesData, error } = await supabase
        .from("episodes")
        .select("season_number, episode_number")
        .eq("podcast_id", podcastId)
        .eq("status", "published");

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
  }, [
    podcastId,
    initialData.season_number,
    initialData.episode_number,
    setFormData,
  ]);

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

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    if (!user) return;

    if (!isDraft) {
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

      // Get all episode numbers in current season, excluding the current episode if editing
      const episodesInSeason = episodesData?.filter(
        (ep) => {
          const isSameSeason = parseInt(ep.season_number as string) ===
            parseInt(formData.season_number as string);
          
          // If we're in edit mode, exclude the current episode from the list
          if (isEditMode) {
            const isCurrentEpisode =
              ep.season_number === initialData.season_number &&
              ep.episode_number === initialData.episode_number;
            return isSameSeason && !isCurrentEpisode;
          }
          
          return isSameSeason;
        }
      );
      const existingEpisodeNumbers = episodesInSeason
        ?.map((ep) => parseInt(ep.episode_number))
        .filter((n) => !isNaN(n));

      const selectedEpisode = parseInt(formData.episode_number as string);

      if (selectedEpisode < 1) {
        toast.error("Episode number must be 1 or greater.");
        return;
      }

      // Check for duplicate episode number (using filtered list that excludes current episode)
      if (existingEpisodeNumbers?.includes(selectedEpisode)) {
        toast.error(
          "This episode number already exists in the selected season. Pick an unused episode number."
        );
        return;
      }

      // Smart episode validation - allow consecutive episodes OR filling gaps
      if (existingEpisodeNumbers?.length > 0) {
        const minEpisode = Math.min(...existingEpisodeNumbers);
        const maxEpisode = Math.max(...existingEpisodeNumbers);

        // Allow if:
        // 1. It's the next consecutive episode (maxEpisode + 1)
        // 2. It's filling a gap (between minEpisode and maxEpisode but not already taken)
        // 3. It's before the first episode (e.g., adding episode 1 when you have 2,3,4)
        const isNextEpisode = selectedEpisode === maxEpisode + 1;
        const isFillingGap =
          selectedEpisode >= minEpisode &&
          selectedEpisode <= maxEpisode &&
          !existingEpisodeNumbers.includes(selectedEpisode);
        const isBeforeFirst = selectedEpisode < minEpisode;

        if (!isNextEpisode && !isFillingGap && !isBeforeFirst) {
          // Check if there are actual gaps to fill
          const hasGaps =
            maxEpisode - minEpisode + 1 > existingEpisodeNumbers.length;

          let errorMessage = `Episode ${selectedEpisode} is not allowed. You can create episode ${
            maxEpisode + 1
          }`;

          if (hasGaps) {
            errorMessage += ` or fill gaps between episodes ${minEpisode}-${maxEpisode}`;
          }

          errorMessage += ".";

          toast.error(errorMessage);
          return;
        }
      } else {
        // If no episodes exist in this season, only allow episode 1
        if (selectedEpisode !== 1) {
          toast.error("The first episode in a season must be episode 1.");
          return;
        }
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

      if (selectedSeason < 1) {
        toast.error("Season number must be 1 or greater.");
        return;
      }
    }

    const episodeStatus = isDraft ? "draft" : "published";

    setLoading(true);
    try {
      if (isEditMode) {
        const updateData: {
          title: string;
          description: string;
          audio_url: string;
          season_number: string | undefined;
          episode_number: string | undefined;
          explicit: boolean;
          status: string;
          publish_date?: string;
        } = {
          title: formData.title,
          description: formData.description,
          audio_url: formData.audio_url,
          season_number: formData.season_number,
          episode_number: formData.episode_number,
          explicit: formData.explicit,
          status: episodeStatus,
        };

        // Update publish_date when publishing an episode
        if (!isDraft) {
          updateData.publish_date = new Date().toISOString();
        }

        const { error } = await supabase
          .from("episodes")
          .update(updateData)
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
            publish_date: new Date().toISOString(),
            status: episodeStatus,
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
          ? `Episode ${isDraft ? "saved as draft" : "updated"} successfully!`
          : `Episode ${isDraft ? "saved as draft" : "published"} successfully!`
      );
      clearPersistedData();
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

  const handlePublish = () => {
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(fakeEvent, false);
  };

  const handleSaveDraft = () => {
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(fakeEvent, true);
  };

  const handleCancel = useCallback(() => {
    clearPersistedData();
    onCancel();
  }, [clearPersistedData, onCancel]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleCancel]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Episode Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
        autoFocus
      />

      <Textarea
        label="Description"
        rows={4}
        value={formData.description}
        onChange={(e) => {
          setFormData({ ...formData, description: e.target.value });
        }}
        required
      />

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
          onValueChange={(checked) =>
            setFormData({ ...formData, explicit: checked })
          }
        />
        Explicit
      </label>

      <div className="flex gap-4 mt-6">
        <Button
          type="button"
          color="primary"
          isLoading={isLoading}
          onPress={handlePublish}
        >
          Publish Episode
        </Button>
        <Button
          type="button"
          variant="bordered"
          color="primary"
          isLoading={isLoading}
          onPress={handleSaveDraft}
        >
          Save Draft
        </Button>
        <Button type="button" variant="light" onPress={() => handleCancel()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
