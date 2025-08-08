import { FaPodcast } from "react-icons/fa";

export const applePodcastsSubmitLink = "https://podcastsconnect.apple.com/";
export const spotifyPodcastsSubmitLink = "https://podcasters.spotify.com/"

export const appTitle = "Podcast Manager";

export const appDescription = 
  `Create, manage, and distribute your podcasts with ease. Generate RSS feeds that work 
  with Apple Podcasts, Spotify, and more.`;

export const actionCards = [
  {
    id: "publish",
    header: (
      <>
        <strong className="text-xs text-white/60 uppercase font-bold">Distribute</strong>
        <strong>Publish your first episode</strong>
      </>
    ),
    body: "Body",
    footer: "Get started",
    href: "/podcasts/new"
  },
  {
    id: "manage",
    header: 
      <>
        <strong className="text-xs text-white/60 uppercase font-bold">Manage</strong>
        <strong>Manage an existing podcast</strong>
      </>,
    body: "Body",
    footer: "View analytics",
    href: "/podcasts/"
  }
];

export const defaultArtwork = () => {
  return (
    <div className="flex w-full h-full items-center justify-center bg-gray-100 text-gray-400 rounded-lg">
      <FaPodcast size={128} />
    </div>
  );
};
