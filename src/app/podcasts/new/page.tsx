'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/Providers';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';

export default function NewPodcastPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    author: "", 
    email: user?.email || "",
    website: "",
    artwork: ""
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
          rss_url: "",
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

  if (!user) {
    return <div className="p-8 text-center">Please log in to create a podcast.</div>
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1>Create New Podcast</h1>
      <Card>
        <CardHeader>
          <h2>Podcast Details</h2>
        </CardHeader>
        <CardBody>
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
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              onChange={(e) => setFormData ({ ...formData, website: e.target.value })}
            />

            <Input
              label="Artwork URL (optional)"
              type="url"
              value={formData.artwork}
              onChange={(e) => setFormData({ ...formData, artwork: e.target.value })}
            />

            <div className="flex gap-4">
              <Button
                type="button"
                variant="light"
                onPress={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                isLoading={loading}
              >
                Create Podcast
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
