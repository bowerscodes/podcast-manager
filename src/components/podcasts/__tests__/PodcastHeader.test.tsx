import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import PodcastHeader from "@/components/podcasts/PodcastHeader";
import { Podcast, Episode } from "@/types/podcast";
import usePodcast from "@/hooks/usePodcast";
import useEpisodes from "@/hooks/useEpisodes";

// Mock the auth provider
jest.mock("@/providers/Providers", () => ({
  useAuth: () => ({
    user: { id: "user-123", email: "test@example.com" },
  }),
}));

// Mock the usePodcast hook
const mockRefresh = jest.fn();
jest.mock("@/hooks/usePodcast", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    podcast: undefined,
    episodes: undefined,
    episodeCount: undefined,
    totalDuration: undefined,
    seasonCount: undefined,
    loading: false,
    error: null,
    refresh: mockRefresh,
  })),
}));

// Mock the useEpisodes hook
jest.mock("@/hooks/useEpisodes", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    episodes: [],
    loading: false,
    error: null,
    refresh: jest.fn(),
  })),
}));

const mockUsePodcast = usePodcast as jest.MockedFunction<typeof usePodcast>;
const mockUseEpisodes = useEpisodes as jest.MockedFunction<typeof useEpisodes>;

// Mock Supabase
const mockUpdate = jest.fn();
const mockEq = jest.fn();

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      update: mockUpdate.mockReturnValue({
        eq: mockEq.mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    })),
  },
}));

// Mock PodcastModal
jest.mock("@/components/modals/PodcastModal", () => {
  return function MockPodcastModal({
    isOpen,
    onClose,
    onSuccess,
    initialData,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData: Partial<Podcast>;
  }) {
    if (!isOpen) return null;
    return (
      <div data-testid="podcast-modal">
        <div>Modal Title: {initialData?.title}</div>
        <button onClick={onSuccess} data-testid="form-success">
          Save
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
});

// Mock EditableImage
jest.mock("@/components/ui/EditableImage", () => {
  return function MockEditableImage({
    src,
    alt,
    onSave,
    className,
  }: {
    src?: string;
    alt: string;
    onSave: (url: string) => Promise<void>;
    className?: string;
  }) {
    return (
      <div data-testid="editable-image" className={className}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} />
        <button
          onClick={() => onSave("new-image-url.jpg")}
          data-testid="save-image"
        >
          Save Image
        </button>
      </div>
    );
  };
});

// Mock other UI components
jest.mock("@/components/ui/Tag", () => {
  return function MockTag({ children, explicit, className }: { children?: React.ReactNode; explicit?: boolean; className?: string }) {
    // If explicit prop is true, render explicit tag
    if (explicit) {
      return <span data-testid="explicit-tag">EXPLICIT</span>;
    }
    // Otherwise render children (for other tag usage)
    if (children) {
      return <span className={className}>{children}</span>;
    }
    return null;
  };
});

jest.mock("@/components/ui/ExpandableText", () => {
  return function MockExpandableText({
    text,
    maxLines,
  }: {
    text: string;
    maxLines: number;
  }) {
    return (
      <div data-testid="expandable-text" data-max-lines={maxLines}>
        {text}
      </div>
    );
  };
});

// Mock HeroUI Button
jest.mock("@heroui/button", () => ({
  Button: ({
    children,
    onPress,
    variant,
    color,
    className,
    ...props
  }: {
    children: React.ReactNode;
    onPress?: () => void;
    variant?: string;
    color?: string;
    className?: string;
    [key: string]: unknown;
  }) => (
    <button
      onClick={onPress}
      className={className}
      data-variant={variant}
      data-color={color}
      {...props}
    >
      {children}
    </button>
  ),
}));

describe("PodcastHeader", () => {
  const mockPodcast: Podcast = {
    id: "podcast-123",
    title: "Test Podcast",
    podcast_name: "test-podcast",
    description: "This is a test podcast description that provides context.",
    author: "Test Author",
    email: "test@example.com",
    website: "https://example.com",
    artwork: "https://example.com/artwork.jpg",
    categories: ["Technology", "Education"],
    explicit: false,
    created_at: new Date("2025-01-01"),
    updated_at: new Date("2025-01-02"),
    user_id: "user-123",
    language: "",
  };

  const defaultProps = {
    podcast: mockPodcast,
    episodeCount: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mocks to default state
    mockUsePodcast.mockReturnValue({
      podcast: undefined,
      episodes: undefined,
      episodeCount: undefined,
      totalDuration: undefined,
      seasonCount: undefined,
      loading: false,
      error: null,
      refresh: mockRefresh,
    });
    
    mockUseEpisodes.mockReturnValue({
      episodes: [],
      loading: false,
      error: null,
      refresh: jest.fn(),
    });
  });

  it("should render podcast information correctly", () => {
    render(<PodcastHeader {...defaultProps} />);

    expect(screen.getByText("Test Podcast")).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element?.textContent === "By Test Author";
    })).toBeInTheDocument();
    expect(screen.getByText("5 episodes")).toBeInTheDocument();
    expect(screen.getByText(/Created/)).toBeInTheDocument();
    expect(screen.getByTestId("expandable-text")).toHaveTextContent(
      "This is a test podcast description that provides context."
    );
  });

  it("should show explicit tag when podcast is explicit", () => {
    const explicitPodcast = { ...mockPodcast, explicit: true };
    render(<PodcastHeader podcast={explicitPodcast} episodeCount={3} />);

    expect(screen.getByTestId("explicit-tag")).toBeInTheDocument();
  });

  it("should not show explicit tag when podcast is not explicit", () => {
    render(<PodcastHeader {...defaultProps} />);

    expect(screen.queryByTestId("explicit-tag")).not.toBeInTheDocument();
  });

  it("should open edit modal when edit button is clicked", () => {
    render(<PodcastHeader {...defaultProps} />);

    const editButton = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editButton);

    expect(screen.getByTestId("podcast-modal")).toBeInTheDocument();
    expect(screen.getByText("Modal Title: Test Podcast")).toBeInTheDocument();
  });

  it("should close edit modal when close button is clicked", () => {
    render(<PodcastHeader {...defaultProps} />);

    // Open modal
    const editButton = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editButton);

    expect(screen.getByTestId("podcast-modal")).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);

    expect(screen.queryByTestId("podcast-modal")).not.toBeInTheDocument();
  });

  it("should handle podcast update and refresh", async () => {
    render(<PodcastHeader {...defaultProps} />);

    // Open modal
    const editButton = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editButton);

    // Save changes - use more specific selector
    const saveButton = screen.getByTestId("form-success");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
      expect(screen.queryByTestId("podcast-modal")).not.toBeInTheDocument();
    });
  });

  it("should handle image update and refresh", async () => {
    render(<PodcastHeader {...defaultProps} />);

    const saveImageButton = screen.getByTestId("save-image");
    fireEvent.click(saveImageButton);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({ artwork: "new-image-url.jpg" });
      expect(mockEq).toHaveBeenCalledWith("id", "podcast-123");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("should render editable image with correct props", () => {
    render(<PodcastHeader {...defaultProps} />);

    const editableImage = screen.getByTestId("editable-image");
    expect(editableImage).toBeInTheDocument();
    expect(editableImage).toHaveClass("rounded-lg", "shadow-md");

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/artwork.jpg");
    expect(img).toHaveAttribute("alt", "Test Podcast artwork");
  });

  it("should handle different episode counts", () => {
    render(<PodcastHeader podcast={mockPodcast} episodeCount={2} />);
    expect(screen.getByText("2 episodes")).toBeInTheDocument();

    render(<PodcastHeader podcast={mockPodcast} episodeCount={1} />);
    expect(screen.getByText("1 episode")).toBeInTheDocument();
  });

  it("should handle podcasts with zero episodes", () => {
    render(<PodcastHeader podcast={mockPodcast} episodeCount={0} />);
    expect(screen.queryByText(/episode/)).not.toBeInTheDocument();
  });

  it("should apply correct styling to edit button", () => {
    render(<PodcastHeader {...defaultProps} />);

    const editButton = screen.getByRole("button", { name: /edit/i });
    expect(editButton).toHaveAttribute("data-variant", "light");
    expect(editButton).toHaveAttribute("data-color", "primary");
    expect(editButton).toHaveClass("top-0", "right-0", "z-10");
  });

  describe("Episode information display", () => {
    const mockEpisodes: Episode[] = [
      {
        id: "episode-1",
        podcast_id: "podcast-123",
        title: "Episode 1",
        description: "First episode",
        audio_url: "https://example.com/episode1.mp3",
        duration: 3600,
        file_size: 50000000,
        publish_date: new Date("2025-01-15"),
        season_number: "1",
        episode_number: "1",
        explicit: false,
        status: "published",
        created_at: new Date("2025-01-10"),
      },
      {
        id: "episode-2", 
        podcast_id: "podcast-123",
        title: "Episode 2",
        description: "Second episode",
        audio_url: "https://example.com/episode2.mp3",
        duration: 2400,
        file_size: 40000000,
        publish_date: new Date("2025-01-20"),
        season_number: "1",
        episode_number: "2",
        explicit: false,
        status: "published",
        created_at: new Date("2025-01-18"),
      },
      {
        id: "episode-3",
        podcast_id: "podcast-123",
        title: "Episode 3",
        description: "Third episode",
        audio_url: "https://example.com/episode3.mp3",
        duration: 1800,
        file_size: 30000000,
        publish_date: new Date("2025-01-25"),
        season_number: "1",
        episode_number: "3",
        explicit: false,
        status: "published",
        created_at: new Date("2025-01-23"),
      },
    ];

    beforeEach(() => {
      mockUseEpisodes.mockReturnValue({
        episodes: mockEpisodes,
        loading: false,
        error: null,
        refresh: jest.fn(),
      });
    });

    it("should display the most recent episode date correctly", () => {
      render(<PodcastHeader {...defaultProps} />);

      // The most recent episode should be Episode 3 (2025-01-25)
      expect(screen.getByText(/Latest:/)).toBeInTheDocument();
      expect(screen.getByText(/01\/25\/2025/)).toBeInTheDocument();
    });

    it("should handle episodes with no publish dates", () => {
      const episodesWithInvalidDates: Episode[] = [
        { ...mockEpisodes[0], publish_date: new Date("invalid-date") },
      ];
      
      mockUseEpisodes.mockReturnValue({
        episodes: episodesWithInvalidDates,
        loading: false,
        error: null,
        refresh: jest.fn(),
      });

      render(<PodcastHeader {...defaultProps} />);

      // When dates are invalid, the component might still show "Latest:" with invalid date
      // This is actually testing the current behavior - we might want to improve error handling
      expect(screen.getByText(/Latest:/)).toBeInTheDocument();
    });

    it("should not show latest episode date when no episodes exist", () => {
      mockUseEpisodes.mockReturnValue({
        episodes: [],
        loading: false,
        error: null,
        refresh: jest.fn(),
      });

      render(<PodcastHeader {...defaultProps} />);

      expect(screen.queryByText(/Latest:/)).not.toBeInTheDocument();
    });

    it("should correctly calculate most recent episode from mixed dates", () => {
      const mixedDateEpisodes: Episode[] = [
        { ...mockEpisodes[0], publish_date: new Date("2025-02-01") },
        { ...mockEpisodes[1], publish_date: new Date("2025-01-15") },
        { ...mockEpisodes[2], publish_date: new Date("2025-01-30") },
      ];

      mockUseEpisodes.mockReturnValue({
        episodes: mixedDateEpisodes,
        loading: false,
        error: null,
        refresh: jest.fn(),
      });

      render(<PodcastHeader {...defaultProps} />);

      // Most recent should be Feb 1, 2025 (02/01/2025 in MM/DD/YYYY format)
      expect(screen.getByText(/02\/01\/2025/)).toBeInTheDocument();
    });
  });

  describe("Podcast data display priority", () => {
    it("should prefer hook data over initial data when available", () => {
      const hookPodcast: Podcast = {
        ...mockPodcast,
        title: "Updated Hook Title",
        description: "Updated description from hook",
        author: "Updated Author",
      };

      mockUsePodcast.mockReturnValue({
        podcast: hookPodcast,
        episodes: undefined,
        episodeCount: undefined,
        totalDuration: undefined,
        seasonCount: undefined,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      render(<PodcastHeader {...defaultProps} />);

      expect(screen.getByText("Updated Hook Title")).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return element?.textContent === "By Updated Author";
      })).toBeInTheDocument();
      expect(screen.getByTestId("expandable-text")).toHaveTextContent(
        "Updated description from hook"
      );
    });

    it("should fall back to initial data when hook returns null", () => {
      mockUsePodcast.mockReturnValue({
        podcast: undefined,
        episodes: undefined,
        episodeCount: undefined,
        totalDuration: undefined,
        seasonCount: undefined,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      render(<PodcastHeader {...defaultProps} />);

      expect(screen.getByText("Test Podcast")).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return element?.textContent === "By Test Author";
      })).toBeInTheDocument();
      expect(screen.getByTestId("expandable-text")).toHaveTextContent(
        "This is a test podcast description that provides context."
      );
    });
  });

  describe("Categories display", () => {
    it("should display all categories when present", () => {
      const podcastWithCategories = {
        ...mockPodcast,
        categories: ["Technology", "Education", "Business"],
      };

      mockUsePodcast.mockReturnValue({
        podcast: podcastWithCategories,
        episodes: undefined,
        episodeCount: undefined,
        totalDuration: undefined,
        seasonCount: undefined,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      render(<PodcastHeader podcast={podcastWithCategories} episodeCount={5} />);

      expect(screen.getByText("Technology")).toBeInTheDocument();
      expect(screen.getByText("Education")).toBeInTheDocument();
      expect(screen.getByText("Business")).toBeInTheDocument();
    });

    it("should not display category section when categories are empty", () => {
      const podcastWithoutCategories = {
        ...mockPodcast,
        categories: [],
      };

      mockUsePodcast.mockReturnValue({
        podcast: podcastWithoutCategories,
        episodes: undefined,
        episodeCount: undefined,
        totalDuration: undefined,
        seasonCount: undefined,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      render(<PodcastHeader podcast={podcastWithoutCategories} episodeCount={5} />);

      expect(screen.queryByText("Technology")).not.toBeInTheDocument();
      expect(screen.queryByText("Education")).not.toBeInTheDocument();
    });

    it("should use hook data categories over initial data categories", () => {
      const hookPodcast: Podcast = {
        ...mockPodcast,
        categories: ["Science", "Health"],
      };

      mockUsePodcast.mockReturnValue({
        podcast: hookPodcast,
        episodes: undefined,
        episodeCount: undefined,
        totalDuration: undefined,
        seasonCount: undefined,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      render(<PodcastHeader {...defaultProps} />);

      expect(screen.getByText("Science")).toBeInTheDocument();
      expect(screen.getByText("Health")).toBeInTheDocument();
      expect(screen.queryByText("Technology")).not.toBeInTheDocument();
      expect(screen.queryByText("Education")).not.toBeInTheDocument();
    });
  });

  describe("Date formatting", () => {
    it("should display created date correctly", () => {
      const podcastWithSpecificDate = {
        ...mockPodcast,
        created_at: new Date("2025-03-15T10:30:00Z"),
      };

      render(<PodcastHeader podcast={podcastWithSpecificDate} episodeCount={3} />);

      expect(screen.getByText(/Created:/)).toBeInTheDocument();
      expect(screen.getByText(/03\/15\/2025/)).toBeInTheDocument();
    });

    it("should handle invalid dates gracefully", () => {
      const podcastWithInvalidDate = {
        ...mockPodcast,
        created_at: new Date("invalid-date"),
      };

      render(<PodcastHeader podcast={podcastWithInvalidDate} episodeCount={3} />);

      // Should not crash and should still render the component
      expect(screen.getByText("Test Podcast")).toBeInTheDocument();
    });
  });

  describe("Artwork handling", () => {
    it("should display podcast artwork with correct attributes", () => {
      render(<PodcastHeader {...defaultProps} />);

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "https://example.com/artwork.jpg");
      expect(img).toHaveAttribute("alt", "Test Podcast artwork");
    });

    it("should use hook data artwork over initial data", () => {
      const hookPodcast: Podcast = {
        ...mockPodcast,
        artwork: "https://example.com/updated-artwork.jpg",
      };

      mockUsePodcast.mockReturnValue({
        podcast: hookPodcast,
        episodes: undefined,
        episodeCount: undefined,
        totalDuration: undefined,
        seasonCount: undefined,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      render(<PodcastHeader {...defaultProps} />);

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "https://example.com/updated-artwork.jpg");
    });
  });

  describe("Episode count display", () => {
    it("should display singular form for one episode", () => {
      render(<PodcastHeader podcast={mockPodcast} episodeCount={1} />);
      expect(screen.getByText("1 episode")).toBeInTheDocument();
    });

    it("should display plural form for multiple episodes", () => {
      render(<PodcastHeader podcast={mockPodcast} episodeCount={5} />);
      expect(screen.getByText("5 episodes")).toBeInTheDocument();
    });

    it("should display plural form for zero episodes (when count is 0, episode text should not appear)", () => {
      render(<PodcastHeader podcast={mockPodcast} episodeCount={0} />);
      expect(screen.queryByText(/episode/)).not.toBeInTheDocument();
    });

    it("should handle large episode counts", () => {
      render(<PodcastHeader podcast={mockPodcast} episodeCount={100} />);
      expect(screen.getByText("100 episodes")).toBeInTheDocument();
    });
  });
});
