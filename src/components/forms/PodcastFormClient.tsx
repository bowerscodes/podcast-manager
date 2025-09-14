"use client";

import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Checkbox } from "@heroui/checkbox";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

import { useFormPersistence } from "@/hooks/useFormPersistence";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/Providers";
import { PodcastFormData } from "@/types/podcast";
import { podcastCategories } from "@/lib/data";

type Props = {
  initialData: Partial<PodcastFormData>;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function PodcastFormClient({
  initialData,
  onSuccess,
  onCancel,
}: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileUsername, setProfileUsername] = useState<string>("");
  const [hasEditedPodcastName, setHasEditedPodcastName] = useState(false);

  const { formData, setFormData, clearPersistedData } = useFormPersistence(
    `podcast-form-${initialData.id || "new"}`,
    {
      title: initialData.title || "",
      podcast_name: initialData.podcast_name || "",
      description: initialData.description || "",
      author: initialData.author || "",
      email: initialData.email || "",
      website: initialData.website || "",
      artwork: initialData.artwork || "",
      categories: initialData.categories || [],
      explicit: initialData.explicit || false,
    }
  );

  // Fetch profile username on mount
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();
      if (profile?.username) setProfileUsername(profile.username);
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    const editMode = !!(initialData.id && initialData.id.trim() !== "");
    setIsEditMode(editMode);
  }, [initialData.id]);

  // Generate  podcast_name from title
  useEffect(() => {
    if (hasEditedPodcastName) return;
    if (!formData.title) return;
    const handler = setTimeout(() => {
      const podcastName = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");

      setFormData((prev) => ({
        ...prev,
        podcast_name: podcastName,
      }));
    }, 500);
    return () => clearTimeout(handler);
  }, [formData.title, hasEditedPodcastName, setFormData]);

  const handlePodcastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasEditedPodcastName(true);
    setFormData({ ...formData, podcast_name: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setLoading(true);
    try {
      if (isEditMode) {
        const { error } = await supabase
          .from("podcasts")
          .update({
            title: formData.title,
            podcast_name: formData.podcast_name,
            description: formData.description,
            author: formData.author,
            email: formData.email,
            website: formData.website,
            artwork: formData.artwork,
            categories: formData.categories,
            explicit: formData.explicit,
          })
          .eq("id", initialData.id)
          .select()
          .single();

        if (error) {
          console.error("Supabase update error: ", error);
          throw error;
        }

        toast.success("Podcast updated successfully!");
        clearPersistedData();
        onSuccess();
      } else {
        // For create operations, exclude the id field to let Supabase generate it
        const createData = Object.fromEntries(
          Object.entries(formData).filter(([key]) => key !== "id")
        );
        const { data, error } = await supabase
          .from("podcasts")
          .insert({
            ...createData,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) {
          toast.error("Failed to create podcast");
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        const username = profile?.username;
        if (!username) {
          toast.error("Please set your username first");
          setLoading(false);
          return;
        }

        clearPersistedData();
        toast.success("Podcast created successfully!");
        router.push(`/${username}/${data.podcast_name}`);
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} podcast: `,
        error
      );
      toast.error(`Failed to ${isEditMode ? "update" : "create"} podcast`);
    } finally {
      setLoading(false);
    }
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
        label="Podcast Title"
        labelPlacement="outside-top"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        isRequired
        variant="bordered"
        autoFocus
      />

      <Input
        value={formData.podcast_name}
        onChange={handlePodcastNameChange}
        label="Podcast URL"
        labelPlacement="outside-top"
        startContent={
          <span className="text-gray-500 font-normal">
            {process.env.NEXT_PUBLIC_BASE_URL}/{profileUsername}/
          </span>
        }
        isRequired
        minLength={3}
        variant="bordered"
      />

      <Textarea
        label="Description"
        labelPlacement="outside-top"
        rows={4}
        value={formData.description}
        onChange={(e) => {
          setFormData({ ...formData, description: e.target.value });
        }}
        isRequired
        variant="bordered"
      />

      <Select
        label="Categories"
        selectionMode="multiple"
        value={formData.categories || []}
        onSelectionChange={(keys) => {
          const selectedArray = Array.from(keys) as string[];
          setFormData({ ...formData, categories: selectedArray });
        }}
        variant="flat"
        className=" border-2 border-gray-300 rounded-xl"
      >
        {podcastCategories.map((category) => (
          <SelectItem key={category} className="border-0 outline-0">{category}</SelectItem>
        ))}
      </Select>

      <Input
        label="Author name"
        labelPlacement="outside-top"
        value={formData.author}
        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
        variant="bordered"
        isRequired
      />

      <Input
        label="Contact email"
        labelPlacement="outside-top"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        variant="bordered"
        isRequired
      />

      <Input
        label="Website (optional)"
        labelPlacement="outside-top"
        type="url"
        value={formData.website}
        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
        variant="bordered"
      />

      <Input
        label="Artwork URL (optional)"
        labelPlacement="outside-top"
        type="url"
        value={formData.artwork}
        onChange={(e) => setFormData({ ...formData, artwork: e.target.value })}
        variant="bordered"
      />

      <Checkbox
        isSelected={formData.explicit}
        onValueChange={(checked) =>
          setFormData({ ...formData, explicit: checked })
        }
      >
        Explicit
      </Checkbox>

      <div className="flex gap-4 mt-6">
        <Button type="submit" color="primary" isLoading={isLoading}>
          {isEditMode ? "Update" : "Create"} Podcast
        </Button>
        <Button type="button" variant="light" onPress={() => handleCancel()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
