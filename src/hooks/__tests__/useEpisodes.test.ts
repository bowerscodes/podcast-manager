import { renderHook, waitFor, act } from '@testing-library/react';
import useEpisodes from '@/hooks/useEpisodes';
import { EpisodeQueries } from '@/lib/queries/episode-queries';
import { Episode } from '@/types/podcast';

// Mock the EpisodeQueries module
jest.mock('@/lib/queries/episode-queries');

describe('useEpisodes hook', () => {
  const mockPodcastId = 'test-podcast-id';
  const mockEpisodes: Episode[] = [
    {
      id: '1',
      title: 'Episode 1',
      description: 'First episode',
      audio_url: 'https://example.com/episode1.mp3',
      file_size: 10000000,
      duration: 1800,
      publish_date: new Date('2024-01-01T00:00:00Z'),
      podcast_id: mockPodcastId,
      explicit: false,
      created_at: new Date('2024-01-01T00:00:00Z'),
      status: 'published'
    },
    {
      id: '2',
      title: 'Episode 2',
      description: 'Second episode',
      audio_url: 'https://example.com/episode2.mp3',
      file_size: 15000000,
      duration: 2700,
      publish_date: new Date('2024-01-02T00:00:00Z'),
      podcast_id: mockPodcastId,
      explicit: false,
      created_at: new Date('2024-01-02T00:00:00Z'),
      status: 'draft'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (EpisodeQueries.getEpisodesByPodcast as jest.Mock).mockResolvedValue(mockEpisodes);
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
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.episodes).toEqual(mockEpisodes);
    expect(result.current.error).toBeNull();
    expect(EpisodeQueries.getEpisodesByPodcast).toHaveBeenCalledWith(mockPodcastId, {
      seasonNumber: undefined,
      status: undefined
    });
  });

  it('should handle fetch errors', async () => {
    const mockError = new Error('Failed to fetch episodes');
    (EpisodeQueries.getEpisodesByPodcast as jest.Mock).mockRejectedValueOnce(mockError);
    const { result } = renderHook(() => useEpisodes(mockPodcastId));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.episodes).toEqual([]);
    expect(result.current.error).toEqual(mockError);
  });

  it('should handle null data gracefully', async () => {
    (EpisodeQueries.getEpisodesByPodcast as jest.Mock).mockResolvedValueOnce([]);
    const { result } = renderHook(() => useEpisodes(mockPodcastId));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.episodes).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should call EpisodeQueries with correct parameters', async () => {
    const { result } = renderHook(() => useEpisodes(mockPodcastId));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(EpisodeQueries.getEpisodesByPodcast).toHaveBeenCalledWith(mockPodcastId, {
      seasonNumber: undefined,
      status: undefined
    });
  });

  it('should refresh episodes when refresh function is called', async () => {
    const { result } = renderHook(() => useEpisodes(mockPodcastId));
    await waitFor(() => expect(result.current.loading).toBe(false));
    jest.clearAllMocks();
    const newEpisode: Episode = {
      id: '3',
      title: 'Episode 3',
      description: 'Third episode',
      audio_url: 'https://example.com/episode3.mp3',
      file_size: 20000000,
      duration: 3600,
      publish_date: new Date('2024-01-03T00:00:00Z'),
      podcast_id: mockPodcastId,
      explicit: false,
      created_at: new Date('2024-01-03T00:00:00Z'),
      status: 'published'
    };
    (EpisodeQueries.getEpisodesByPodcast as jest.Mock).mockResolvedValue([...mockEpisodes, newEpisode]);
    await act(async () => await result.current.refresh());
    await waitFor(() => expect(result.current.episodes).toHaveLength(3));
    expect(EpisodeQueries.getEpisodesByPodcast).toHaveBeenCalledWith(mockPodcastId, {
      seasonNumber: undefined,
      status: undefined
    });
  });

  it('should update episodes when podcastId changes', async () => {
    const { result, rerender } = renderHook(
      (props) => useEpisodes(props.podcastId),
      { initialProps: { podcastId: 'podcast-1' } }
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    jest.clearAllMocks();
    const newPodcastEpisodes = [mockEpisodes[0]];
    (EpisodeQueries.getEpisodesByPodcast as jest.Mock).mockResolvedValue(newPodcastEpisodes);
    rerender({ podcastId: 'podcast-2' });
    await waitFor(() => expect(result.current.episodes).toHaveLength(1));
    expect(EpisodeQueries.getEpisodesByPodcast).toHaveBeenCalledWith('podcast-2', {
      seasonNumber: undefined,
      status: undefined
    });
  });

  it('should set loading state correctly during refresh', async () => {
    const { result } = renderHook(() => useEpisodes(mockPodcastId));
    await waitFor(() => expect(result.current.loading).toBe(false));
    let resolvePromise: (value: Episode[]) => void;
    const slowPromise = new Promise<Episode[]>((resolve) => { resolvePromise = resolve; });
    (EpisodeQueries.getEpisodesByPodcast as jest.Mock).mockReturnValue(slowPromise);
    act(() => { result.current.refresh(); });
    await waitFor(() => expect(result.current.loading).toBe(true));
    act(() => { resolvePromise!(mockEpisodes); });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.episodes).toEqual(mockEpisodes);
  });
});
