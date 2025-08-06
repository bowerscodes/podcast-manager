export const appTitle = "Podcast Manager";

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
    onPress: () => {}
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
    onPress: () => {}
  }
];

export const appDescription = 
  "Create, manage, and distribute your podcasts with ease. Generate RSS feeds that work with Apple Podcasts, Spotify, and more.";