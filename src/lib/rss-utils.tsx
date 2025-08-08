import { Episode, Podcast } from '@/types/podcast';

export function detectPlatform(userAgent: string): string {
  if (userAgent.includes("AppleCoreMedia")) return "Apple Podcasts";
  if (userAgent.includes("Spotify")) return "Spotify";
  if (userAgent.includes("Overcast")) return "Overcast";
  if (userAgent.includes("PocketCasts")) return "Pocket Casts";
  return "Unknown"
};

export function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

export function generateRSSFeed(podcast: Podcast, episodes: Episode[]): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "localhost:3000";

  return (
    `<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
        <channel>
          <title>${escapeXml(podcast.title)}</title>
          <description>${escapeXml(podcast.description)}</description>
          <link>${baseUrl}/podcasts/${podcast.id}</link>
          <language>${podcast.language}</language>
          <itunes:author>${escapeXml(podcast.author)}</itunes:author>
          <itunes:image href="${podcast.artwork}" />

          ${episodes.map(episode => `
            <item>
              <title>${escapeXml(episode.title)}</title>
              <description>${escapeXml(episode.description)}</description>
              <enclosure url="${episode.audio_url}" length="${episode.file_size || 0}" type="audio/mpeg" />
              <guid>${episode.id}</guid>
              <pubDate>${new Date(episode.publish_date).toUTCString()}</pubDate>
              <itunes:duration>${episode.duration || '00:00:00'}</itunes:duration>
            </item>
          `).join('')}
        </channel>
      </rss>`
  );
};
