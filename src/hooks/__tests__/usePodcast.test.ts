import { renderHook, waitFor } from "@testing-library/react";

import usePodcast from "@/hooks/usePodcast";
import { PodcastQueries } from "@/lib/queries/podcast-queries";

// Mock Supabase
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          eq: mockEq.mockReturnValue({
            single: mockSingle,
          }),
          single: mockSingle,
        }),
      }),
    })),
  },
}));

// Mock the PodcastQueries class
jest.mock("@/lib/queries/podcast-queries");

describe("usePodcast", () => {
  const mockPodcastData = {
    id: "podcast-123",
    title: "Test Podcast",
    // other podcast fields
  };
  
  const mockEpisodes = [
    { id: "ep-1", title: "Episode 1" },
    { id: "ep-2", title: "Episode 2" }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch podcast data successfully", async () => {
    // Mock the getPodcastWithStats method
    (PodcastQueries.getPodcastWithStats as jest.Mock).mockResolvedValue({
      podcast: mockPodcastData,
      episodes: mockEpisodes,
      episodeCount: 2,
      totalDuration: 3600,
      seasonCount: 1
    });

    const { result } = renderHook(() => usePodcast("podcast-123"));

    expect(result.current.loading).toBe(true);
    expect(result.current.podcast).toBeUndefined();
    expect(result.current.error).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.podcast).toEqual(mockPodcastData);
      expect(result.current.episodes).toEqual(mockEpisodes);
      expect(result.current.episodeCount).toBe(2);
      expect(result.current.error).toBe(null);
    });

    expect(PodcastQueries.getPodcastWithStats).toHaveBeenCalledWith("podcast-123");
  });

    it("should handle fetch errors", async () => {
    const mockError = new Error("Failed to fetch");
    (PodcastQueries.getPodcastWithStats as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => usePodcast("podcast-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.podcast).toBeUndefined(); // Changed from null to undefined
      expect(result.current.error).toEqual(mockError);
    });
  });

  it("should not fetch when podcastId is empty", () => {
    const { result } = renderHook(() => usePodcast(""));

    expect(result.current.loading).toBe(true);
    expect(result.current.podcast).toBeUndefined();
    expect(result.current.error).toBe(null);
    expect(mockSelect).not.toHaveBeenCalled();
  });

  it("should refresh podcast data when refresh is called", async () => {
    const mockPodcast = {
      id: "podcast-123",
      title: "Test Podcast",
    };

    // Mock initial data
    (PodcastQueries.getPodcastWithStats as jest.Mock).mockResolvedValue({
      podcast: mockPodcast,
      episodes: [],
      episodeCount: 0,
      totalDuration: 0,
      seasonCount: 0
    });

    const { result } = renderHook(() => usePodcast("podcast-123"));
    
    await waitFor(() => {
      expect(result.current.podcast).toEqual(mockPodcast);
    });
  
    // Clear mocks and set up new data
    jest.clearAllMocks();
    const updatedPodcast = {
      id: "podcast-123",
      title: "Updated Podcast",
    };
  
    // Mock updated data
    (PodcastQueries.getPodcastWithStats as jest.Mock).mockResolvedValue({
      podcast: updatedPodcast,
      episodes: [],
      episodeCount: 0,
      totalDuration: 0,
      seasonCount: 0
    });

    // Call refresh
    result.current.refresh();

    await waitFor(() => {
      expect(result.current.podcast).toEqual(updatedPodcast);
    });

    // Verify the query method was called
    expect(PodcastQueries.getPodcastWithStats).toHaveBeenCalledWith("podcast-123");
  });
});
