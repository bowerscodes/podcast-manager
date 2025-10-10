'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/Providers';
import { Button } from '@heroui/button';
import Link from 'next/link';
import { MdLink, MdPodcasts, MdRssFeed } from 'react-icons/md';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect authenticated users to /podcasts
    if (!loading && user) {
      router.replace('/podcasts');
    }
  }, [user, loading, router]);

  // Show nothing while checking auth or redirecting
  if (loading || user) {
    return null;
  }  return (
    <div>
      <main className="page-container">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="heading-primary mb-6">
            Generate Professional Podcast RSS Feeds
          </h1>
          <p className="text-muted text-lg mb-8 max-w-2xl mx-auto">
            Create and manage podcast episodes by linking to your existing audio files. 
            Generate RSS feeds ready for distribution to Apple Podcasts, Spotify, and other platforms.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button 
              as={Link} 
              href="/podcasts" 
              className="btn-primary"
              size="lg"
            >
              Get Started
            </Button>
            <Button 
              as={Link} 
              href="/about" 
              variant="bordered"
              size="lg"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="stats-card p-6 text-center">
            <MdLink className="w-12 h-12 mx-auto mb-4 text-purple-600" />
            <h3 className="font-bold mb-2">Link Your Episodes</h3>
            <p className="text-muted text-sm">
              Add episodes by linking to your audio files hosted anywhere. No file uploads required.
            </p>
          </div>
          
          <div className="stats-card p-6 text-center">
            <MdRssFeed className="w-12 h-12 mx-auto mb-4 text-cyan-600" />
            <h3 className="font-bold mb-2">Generate RSS Feeds</h3>
            <p className="text-muted text-sm">
              Automatically create professional RSS feeds compatible with all major podcast platforms.
            </p>
          </div>
          
          <div className="stats-card p-6 text-center">
            <MdPodcasts className="w-12 h-12 mx-auto mb-4 text-amber-600" />
            <h3 className="font-bold mb-2">Distribute Everywhere</h3>
            <p className="text-muted text-sm">
              Get your RSS feed ready for Apple Podcasts, Spotify, Google Podcasts, and more.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="heading-secondary mb-4 mt-12">
            Ready to get your podcast on all major platforms?
          </h2>
          <Button 
            as={Link} 
            href="/podcasts" 
            className="btn-primary"
            size="lg"
          >
            Create Your RSS Feed
          </Button>
        </div>
      </main>
    </div>
  );
}