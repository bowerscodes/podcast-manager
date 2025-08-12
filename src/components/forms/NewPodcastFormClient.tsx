'use client';

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/Providers";
import { NewPodcastFormData } from "@/types/podcast";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

type Props = {
  initialData: Partial<NewPodcastFormData>;
};

export default function NewPodcastFormClient({ initialData }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [formData, setFormData] = useState<NewPodcastFormData>({
    title: initialData.title || "",
    description: initialData.description || "",
    author: initialData.author || "",
    email: initialData.email || "",
    website: initialData.website || "",
    artwork: initialData.artwork || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("podcasts")
        .insert({
          ...formData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Podcast created successfully!");
      router.push(`/podcasts/${data.id}`);
    } catch (error) {
      console.error("Error creating podcast: ", error);
      toast.error("Failed to create podcast");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Podcast Title"
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
        label="Author name"
        value={formData.author}
        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
        required
      />

      <Input
        label="Contact email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />

      <Input
        label="Website (optional)"
        type="url"
        value={formData.website}
        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
      />

      <Input
        label="Artwork URL (optional)"
        type="url"
        value={formData.artwork}
        onChange={(e) => setFormData({ ...formData, artwork: e.target.value })}
      />

      <div className="flex gap-4">
        <Button type="submit" color="primary" isLoading={isLoading}>
          Create Podcast
        </Button>
        <Button type="button" variant="light" onPress={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
