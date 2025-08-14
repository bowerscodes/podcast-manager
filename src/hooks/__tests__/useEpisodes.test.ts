import { renderHook, waitFor, act } from '@testing-library/react';
import useEpisodes from '@/hooks/useEpisodes';
import { supabase } from '@/lib/supabase';
import { Episode } from '@/types/podcast';

// Mock the supabase module
jest.mock('@/lib/supabase');

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('useEpisodes hook', () => {
  const mockPodcastId = 'test-podcast-id';
  const mockEpisodes: Episode[] = [
    {
      id: '1',
      title: 'Episode 1',
      description: 'First episode',
      audio_url: 'https://example.com/episode1.mp3',
      file_size: 10000000,
      duration: 1800, // 30 minutes in seconds
      publish_date: new Date('2024-01-01T00:00:00Z'),
      podcast_id: mockPodcastId,
      explicit: false,
      created_at: new Date('2024-01-01T00:00:00Z')
    },
    {
      id: '2',
      title: 'Episode 2',
      description: 'Second episode',
      audio_url: 'https://example.com/episode2.mp3',
      file_size: 15000000,
      duration: 2700, // 45 minutes in seconds
      publish_date: new Date('2024-01-02T00:00:00Z'),
      podcast_id: mockPodcastId,
      explicit: false,
      created_at: new Date('2024-01-02T00:00:00Z')
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementation
    mockSupabase.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: mockEpisodes,
        error: null
      })
    });
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useEpisodes(mockPodcastId));

    expect(result.current.loading).toBe(true);
    expect(result.current.episodes).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.refresh).toBe('function');
  });

  it('should fetch episodes successfully', async () => {
    const { result } = renderHook(() => useEpisodes(mockPodcastId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.episodes).toEqual(mockEpisodes);
    expect(result.current.error).toBeNull();
    expect(mockSupabase.from).toHaveBeenCalledWith('episodes');
  });

  it('should handle fetch errors', async () => {
    const mockError = new Error('Failed to fetch episodes');
    
    mockSupabase.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: null,
        error: mockError
      })
    });

    const { result } = renderHook(() => useEpisodes(mockPodcastId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.episodes).toEqual([]);
    expect(result.current.error).toBe(mockError);
  });

  it('should handle null data gracefully', async () => {
    mockSupabase.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: null,
        error: null
      })
    });

    const { result } = renderHook(() => useEpisodes(mockPodcastId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.episodes).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should call supabase with correct parameters', async () => {
    const { result } = renderHook(() => useEpisodes(mockPodcastId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockSupabase.from).toHaveBeenCalledWith('episodes');
  });

  it('should refresh episodes when refresh function is called', async () => {
    const { result } = renderHook(() => useEpisodes(mockPodcastId));

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear previous calls
    jest.clearAllMocks();

    // Setup mock for refresh call
    mockSupabase.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [...mockEpisodes, {
          id: '3',
          title: 'Episode 3',
          description: 'Third episode',
          audio_url: 'https://example.com/episode3.mp3',
          file_size: 20000000,
          duration: 3600, // 60 minutes in seconds
          publish_date: new Date('2024-01-03T00:00:00Z'),
          podcast_id: mockPodcastId,
          explicit: false,
          created_at: new Date('2024-01-03T00:00:00Z')
        }],
        error: null
      })
    });

    // Call refresh
    result.current.refresh();

    // Wait for refresh to complete
    await waitFor(() => {
      expect(result.current.episodes).toHaveLength(3);
    });

    expect(mockSupabase.from).toHaveBeenCalledWith('episodes');
  });

  it('should update episodes when podcastId changes', async () => {
    const { result, rerender } = renderHook(
      (props) => useEpisodes(props.podcastId),
      { initialProps: { podcastId: 'podcast-1' } }
    );

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear previous calls
    jest.clearAllMocks();

    // Setup mock for new podcast
    const newPodcastEpisodes = [mockEpisodes[0]]; // Only one episode for new podcast
    mockSupabase.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: newPodcastEpisodes,
        error: null
      })
    });

    // Change podcast ID
    rerender({ podcastId: 'podcast-2' });

    // Wait for new data to load
    await waitFor(() => {
      expect(result.current.episodes).toHaveLength(1);
    });

    expect(mockSupabase.from).toHaveBeenCalledWith('episodes');
  });

  it('should set loading state correctly during refresh', async () => {
    const { result } = renderHook(() => useEpisodes(mockPodcastId));

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Mock a slow response for refresh
    let resolvePromise: (value: { data: Episode[]; error: null }) => void;
    const slowPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockSupabase.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnValue(slowPromise)
    });

    // Call refresh wrapped in act
    act(() => {
      result.current.refresh();
    });

    // Should be loading immediately
    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    // Resolve the promise
    act(() => {
      resolvePromise!({
        data: mockEpisodes,
        error: null
      });
    });

    // Wait for loading to finish
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.episodes).toEqual(mockEpisodes);
  });
});
