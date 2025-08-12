import { FaPodcast } from "react-icons/fa";

export const applePodcastsSubmitLink = "https://podcastsconnect.apple.com/";
export const spotifyPodcastsSubmitLink = "https://podcasters.spotify.com/";

export const appTitle = "Podcast Manager";

export const appDescription = `Create, manage, and distribute your podcasts with ease. Generate RSS feeds that work 
  with Apple Podcasts, Spotify, and more.`;

export const actionCards = [
  {
    id: "publish",
    header: (
      <>
        <strong className="text-xs text-white/60 uppercase font-bold">
          Distribute
        </strong>
        <strong>Publish your first episode</strong>
      </>
    ),
    body: "Body",
    footer: "Get started",
    href: "/podcasts/new",
  },
  {
    id: "manage",
    header: (
      <>
        <strong className="text-xs text-white/60 uppercase font-bold">
          Manage
        </strong>
        <strong>Manage an existing podcast</strong>
      </>
    ),
    body: "Body",
    footer: "View analytics",
    href: "/podcasts/",
  },
];

export const defaultArtwork = () => {
  return (
    <div className="flex w-full h-full items-center justify-center bg-gray-100 text-gray-400 rounded-lg">
      <FaPodcast size={128} />
    </div>
  );
};

export const podcastCards = [
  {
    id: "testPodcast1",
    title: "Chattin'",
    artwork: "https://static.simpsonswiki.com/images/b/b7/The_Homer_Simpson_Shows.png",
  },
  {
    id: "testPodcast2",
    title: "Shoppin'",
    artwork: "https://nypost.com/wp-content/uploads/sites/2/2022/07/simpsons-secret-revealed-114.jpg?quality=75&strip=all",
  },
  {
    id: "testPodcast3",
    title: "Eatin'",
    artwork: "https://i.ytimg.com/vi/2XUEuPGnCBc/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLB4YGIkLaqlNbrN4cxOFIDnS8ydTA",
  },
  {
    id: "testPodcast4",
    title: "Watchin'",
    artwork: "https://reviewnebula.wordpress.com/wp-content/uploads/2021/03/homer-simpson-bored-watching-tv.jpg",
  },
  {
    id: "testPodcast5",
    title: "Drinkin'",
    artwork: "https://deadhomersociety.wordpress.com/wp-content/uploads/2011/06/bloodfeud6.png",
  },
];

export const episodeCards = [
    {
    id: "ep1",
    podcast_id: "testPodcast1",
    title: "Welcome to Chattin'",
    description: "Our very first episode! Meet the hosts and learn what this show is all about.",
    audio_url: "https://example.com/audio/chattin-ep1.mp3",
    duration: 1800,
    file_size: 25000000,
    publish_date: new Date("2024-01-01"),
    season_number: 1,
    episode_number: 1,
    explicit: false,
    created_at: new Date("2024-01-01"),
  },
  {
    id: "ep2",
    podcast_id: "testPodcast1",
    title: "Chattin' About News",
    description: "We discuss the latest news and trends.",
    audio_url: "https://example.com/audio/chattin-ep2.mp3",
    duration: 2100,
    file_size: 30000000,
    publish_date: new Date("2024-01-08"),
    season_number: 1,
    episode_number: 2,
    explicit: false,
    created_at: new Date("2024-01-08"),
  },
  {
    id: "ep1",
    podcast_id: "testPodcast2",
    title: "Shopping Tips",
    description: "Best tips for saving money while shopping.",
    audio_url: "https://example.com/audio/shoppin-ep1.mp3",
    duration: 1500,
    file_size: 20000000,
    publish_date: new Date("2024-02-01"),
    season_number: 1,
    episode_number: 1,
    explicit: false,
    created_at: new Date("2024-02-01"),
  },
]
