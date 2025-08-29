'use client';

import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Checkbox } from "@heroui/checkbox";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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
  onCancel 
}: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState<PodcastFormData>({
    ...(initialData.id && { id: initialData.id }),
    title: initialData.title || "",
    description: initialData.description || "",
    author: initialData.author || "",
    email: initialData.email || "",
    website: initialData.website || "",
    artwork: initialData.artwork || "",
    categories: initialData.categories || [],
    explicit: initialData.explicit || false,
  });

  useEffect(() => {
    const editMode = !!(initialData.id);
    setIsEditMode(editMode);
  }, [initialData.id]);

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
            description: formData.description,
            author: formData.author,
            email: formData.email,
            website: formData.website,
            artwork: formData.artwork,
            categories: formData.categories,
            explicit: formData.explicit
          })
          .eq("id", initialData.id)
          .select()
          .single();
  
        if (error) {
          console.error("Supabase update error: ", error)
          throw error;
        }
  
        toast.success("Podcast updated successfully!");
        onSuccess();

      } else {
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
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} podcast: `, error);
      toast.error(`Failed to ${isEditMode ? "update" : "create"} podcast`);
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
      
      <Textarea 
        label="Description"
        rows={4}
        value={formData.description}
        onChange={(e) => {
          setFormData({ ...formData, description: e.target.value})
        }}
        required
      />

      <Select 
        label="Categories"
        selectionMode="multiple"
        value={formData.categories || []}
        onSelectionChange={(keys) => {
          const selectedArray = Array.from(keys) as string[];
          setFormData({ ...formData, categories: selectedArray });
        }}
      >
        {podcastCategories.map((category) => (
          <SelectItem key={category} >{category}</SelectItem>
        ))}
      </Select>

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

        <Checkbox
          isSelected={formData.explicit}
          onValueChange={(checked) => setFormData({ ...formData, explicit: checked })}
        >
          Explicit
        </Checkbox>

      <div className="flex gap-4 mt-6">
        <Button type="submit" color="primary" isLoading={isLoading}>
          {isEditMode ? "Update" : "Create"} Podcast
        </Button>
        <Button type="button" variant="light" onPress={() => onCancel()}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
