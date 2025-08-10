"use client";

import { Button } from "@heroui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/Providers";
import { Podcast } from "@/types/podcast";
import toast from "react-hot-toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PodcastCard from "../../components/podcasts/PodcastCard";

export default function PodcastsList() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    const fetchPodcasts = async () => {
      if (!user) return;
      
      setDataLoading(true);
      try {
        const { data, error } = await supabase
          .from("podcasts")
          .select("*")
          .eq("user_id", user?.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPodcasts(data || []);
      } catch (error) {
        console.error("Error fetching podcasts: ", error);
        toast.error("Failed to load podcasts. Please refresh the page.")
      } finally {
        setDataLoading(false);
      }
    };

    fetchPodcasts();
  }, [user]);

  if (authLoading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (!user) {
    return (
      <div className="p-8 text-center">Please login to view your podcasts.</div>
    );
  }
  
  if (dataLoading) {
    return <LoadingSpinner message="Loading podcasts..." />;
  }

  return (
    <div className="page-container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="heading-primary">Podcasts</h1>
        <Button className="btn-primary" onPress={() => router.push("/podcasts/new")}>
          Add new podcast
        </Button>
      </div>

      {podcasts.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl mb-4">No podcasts yet</h2>
          <p className="text-muted mb-6">
            Create your first podcast to get started
          </p>
          <Button color="primary" onPress={() => router.push("/podcasts/new")}>
            Create Podcast
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {podcasts.map((podcast) => (
            <PodcastCard key={podcast.id} podcast={podcast}/>
          ))}
        </div>
      )}
    </div>
  );
};
