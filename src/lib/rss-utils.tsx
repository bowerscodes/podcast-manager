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

  // Generate iTunes categories
  const itunesCategories = podcast.categories.map(category => 
    `<itunes:category text="${escapeXml(category)}" />`
  ).join('\n          ');

  return (
    `<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
        <channel>
          <title>${escapeXml(podcast.title)}</title>
          <description>${escapeXml(podcast.description)}</description>
          <link>${baseUrl}/podcasts/${podcast.id}</link>
          <atom:link href="${baseUrl}/api/rss/${podcast.id}" rel="self" type="application/rss+xml" />
          <language>${podcast.language}</language>
          <copyright>© ${new Date().getFullYear()} ${escapeXml(podcast.author)}</copyright>
          <managingEditor>${escapeXml(podcast.email)} (${escapeXml(podcast.author)})</managingEditor>
          <webMaster>${escapeXml(podcast.email)} (${escapeXml(podcast.author)})</webMaster>
          <generator>Podcast Manager</generator>
          <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
          <ttl>60</ttl>
          <itunes:type>episodic</itunes:type>
          <itunes:author>${escapeXml(podcast.author)}</itunes:author>
          <itunes:summary>${escapeXml(podcast.description)}</itunes:summary>
          <itunes:email>${escapeXml(podcast.email)}</itunes:email>
          <itunes:owner>
            <itunes:name>${escapeXml(podcast.author)}</itunes:name>
            <itunes:email>${escapeXml(podcast.email)}</itunes:email>
          </itunes:owner>
          <itunes:image href="${podcast.artwork}" />
          <itunes:explicit>${podcast.explicit ? 'true' : 'false'}</itunes:explicit>
          <itunes:complete>no</itunes:complete>
          <itunes:new-feed-url>${baseUrl}/api/rss/${podcast.id}</itunes:new-feed-url>
          ${itunesCategories}
          ${podcast.website ? `<itunes:link href="${podcast.website}" />` : ''}

          ${episodes.map(episode => `
            <item>
              <title>${escapeXml(episode.title)}</title>
              <description>${escapeXml(episode.description)}</description>
              <content:encoded><![CDATA[${episode.description}]]></content:encoded>
              <enclosure url="${episode.audio_url}" length="${episode.file_size || 0}" type="audio/mpeg" />
              <guid isPermaLink="false">${episode.id}</guid>
              <pubDate>${new Date(episode.publish_date).toUTCString()}</pubDate>
              <itunes:author>${escapeXml(podcast.author)}</itunes:author>
              <itunes:summary>${escapeXml(episode.description)}</itunes:summary>
              <itunes:duration>${episode.duration || '00:00:00'}</itunes:duration>
              <itunes:explicit>${episode.explicit ? 'true' : 'false'}</itunes:explicit>
              <itunes:episodeType>full</itunes:episodeType>
              ${episode.season_number ? `<itunes:season>${escapeXml(episode.season_number)}</itunes:season>` : ''}
              ${episode.episode_number ? `<itunes:episode>${escapeXml(episode.episode_number)}</itunes:episode>` : ''}
            </item>
          `).join('')}
        </channel>
      </rss>`
  );
};
