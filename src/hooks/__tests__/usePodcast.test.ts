import { renderHook, waitFor } from "@testing-library/react";

import usePodcast from "@/hooks/usePodcast";

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

describe("usePodcast", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch podcast data successfully", async () => {
    const mockPodcast = {
      id: "podcast-123",
      title: "Test Podcast",
      description: "Test Description",
      author: "Test Author",
      email: "test@example.com",
      website: "https://example.com",
      artwork: "https://example.com/art.jpg",
      categories: ["Technology"],
      explicit: false,
      created_at: "2023-01-01T00:00:00.000Z",
      user_id: "user-123",
    };

    mockSingle.mockResolvedValue({
      data: mockPodcast,
      error: null,
    });

    const { result } = renderHook(() => usePodcast("podcast-123"));

    expect(result.current.loading).toBe(true);
    expect(result.current.podcast).toBe(null);
    expect(result.current.error).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.podcast).toEqual(mockPodcast);
      expect(result.current.error).toBe(null);
    });

    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(mockEq).toHaveBeenCalledWith("id", "podcast-123");
    expect(mockSingle).toHaveBeenCalled();
  });

  it("should fetch podcast data with user filter", async () => {
    const mockPodcast = {
      id: "podcast-123",
      title: "Test Podcast",
      user_id: "user-123",
    };

    mockSingle.mockResolvedValue({
      data: mockPodcast,
      error: null,
    });

    renderHook(() => usePodcast("podcast-123", "user-123"));

    await waitFor(() => {
      expect(mockEq).toHaveBeenCalledWith("id", "podcast-123");
      expect(mockEq).toHaveBeenCalledWith("user_id", "user-123");
    });
  });

  it("should handle fetch errors", async () => {
    const mockError = new Error("Fetch failed");
    
    mockSingle.mockResolvedValue({
      data: null,
      error: mockError,
    });

    const { result } = renderHook(() => usePodcast("podcast-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.podcast).toBe(null);
      expect(result.current.error).toBe(mockError);
    });
  });

  it("should not fetch when podcastId is empty", () => {
    const { result } = renderHook(() => usePodcast(""));

    expect(result.current.loading).toBe(true);
    expect(result.current.podcast).toBe(null);
    expect(result.current.error).toBe(null);
    expect(mockSelect).not.toHaveBeenCalled();
  });

  it("should refresh podcast data when refresh is called", async () => {
    const mockPodcast = {
      id: "podcast-123",
      title: "Test Podcast",
    };

    mockSingle.mockResolvedValue({
      data: mockPodcast,
      error: null,
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
    mockSingle.mockResolvedValue({
      data: updatedPodcast,
      error: null,
    });

    // Call refresh
    result.current.refresh();

    await waitFor(() => {
      expect(result.current.podcast).toEqual(updatedPodcast);
    });

    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(mockEq).toHaveBeenCalledWith("id", "podcast-123");
    expect(mockSingle).toHaveBeenCalled();
  });
});
