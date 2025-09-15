import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import toast from 'react-hot-toast';
import EpisodeFormClient from '../EpisodeFormClient';

// Mock Next.js router
const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}));

// Mock auth provider
jest.mock('@/providers/Providers', () => ({
  useAuth: () => ({
    user: { id: 'user-123', email: 'test@example.com' }
  })
}));

// Mock Supabase
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();

// Set up the chained mock behavior
mockInsert.mockReturnValue({
  select: jest.fn().mockReturnValue({
    single: mockSingle
  })
});

mockUpdate.mockReturnValue({
  eq: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      single: mockSingle
    })
  })
});

mockSelect.mockReturnValue({
  eq: mockEq
});

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: mockInsert,
      update: mockUpdate,
      select: mockSelect
    }))
  }
}));

// Mock HeroUI components
jest.mock('@heroui/button', () => ({
  Button: ({ children, onPress, type, isLoading, ...props }: { children: React.ReactNode; onPress?: () => void; type?: 'button' | 'submit' | 'reset'; isLoading?: boolean; [key: string]: unknown }) => (
    <button onClick={onPress} type={type} disabled={isLoading} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@heroui/input', () => ({
  Input: ({ label, value, onChange, type, ...props }: { label?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; [key: string]: unknown }) => (
    <div>
      <label>{label}</label>
      <input 
        aria-label={label}
        value={value} 
        onChange={onChange} 
        type={type}
        {...props} 
      />
    </div>
  ),
  Textarea: ({ label, value, onChange, rows, ...props }: { label?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; rows?: number; [key: string]: unknown }) => (
    <div>
      <label>{label}</label>
      <textarea 
        aria-label={label}
        value={value}
        onChange={onChange}
        rows={rows}
        {...props}
      />
    </div>
  )
}));

jest.mock('@heroui/checkbox', () => ({
  Checkbox: ({ children, isSelected, onValueChange, ...props }: { children: React.ReactNode; isSelected?: boolean; onValueChange?: (value: boolean) => void; [key: string]: unknown }) => (
    <label>
      <input 
        type="checkbox"
        checked={isSelected}
        onChange={(e) => onValueChange?.(e.target.checked)}
        {...props}
      />
      {children}
    </label>
  ),
}));

describe('EpisodeFormClient', () => {
  const defaultProps = {
    podcastId: 'podcast-123',
    initialData: {},
    onSuccess: jest.fn(),
    onCancel: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage to prevent test interference
    localStorage.clear();
    // Default mock for episodes query - empty array
    // Use resolved promise to ensure immediate resolution
    mockEq.mockResolvedValue({
      data: [],
      error: null
    });
  });

  it('should render all form fields', async () => {
    await act(async () => {
      render(<EpisodeFormClient {...defaultProps} />);
    });

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(screen.getByLabelText(/episode title/i)).toBeTruthy();
      expect(screen.getByLabelText(/description/i)).toBeTruthy();
      expect(screen.getByLabelText(/audio url/i)).toBeTruthy();
      expect(screen.getByLabelText(/season number/i)).toBeTruthy();
      expect(screen.getByLabelText(/episode number/i)).toBeTruthy();
      expect(screen.getByRole('checkbox')).toBeTruthy();
    });
  });

  it('should render correct buttons', async () => {
    await act(async () => {
      render(<EpisodeFormClient {...defaultProps} />);
    });

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /publish episode/i })).toBeTruthy();
      expect(screen.getByRole('button', { name: /save draft/i })).toBeTruthy();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeTruthy();
    });
  });

  it('should render correct buttons in edit mode', async () => {
    const initialData = {
      id: 'episode-123',
      title: 'Edit Episode',
      season_number: '1',
      episode_number: '5'
    };

    await act(async () => {
      render(<EpisodeFormClient {...defaultProps} initialData={initialData} />);
    });

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /publish episode/i })).toBeTruthy();
      expect(screen.getByRole('button', { name: /save draft/i })).toBeTruthy();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeTruthy();
    });
  });

  it('should populate form with initial data', async () => {
    const initialData = {
      title: 'Test Episode',
      description: 'Test Description',
      audio_url: 'https://example.com/audio.mp3',
      season_number: '1',
      episode_number: '5',
      explicit: true
    };
    
    await act(async () => {
      render(<EpisodeFormClient {...defaultProps} initialData={initialData} />);
    });

    // Wait for component to render
    await waitFor(() => {
      expect((screen.getByLabelText(/episode title/i) as HTMLInputElement).value).toBe('Test Episode');
      expect((screen.getByLabelText(/description/i) as HTMLTextAreaElement).value).toBe('Test Description');
      expect((screen.getByLabelText(/audio url/i) as HTMLInputElement).value).toBe('https://example.com/audio.mp3');
      expect((screen.getByLabelText(/season number/i) as HTMLInputElement).value).toBe('1');
      expect((screen.getByLabelText(/episode number/i) as HTMLInputElement).value).toBe('5');
      expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(true);
    });
  });

  it('should validate audio URL format', async () => {
    await act(async () => {
      render(<EpisodeFormClient {...defaultProps} />);
    });

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByLabelText(/episode title/i)).toBeTruthy();
    });

    fireEvent.change(screen.getByLabelText(/episode title/i), {
      target: { value: 'Test Episode' }
    });
    fireEvent.change(screen.getByLabelText(/audio url/i), {
      target: { value: 'https://example.com/invalid.pdf' }
    });
    fireEvent.change(screen.getByLabelText(/season number/i), {
      target: { value: '1' }
    });
    fireEvent.change(screen.getByLabelText(/episode number/i), {
      target: { value: '1' }
    });

    // Submit the form directly
    const form = document.querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Audio URL must point to a valid audio file (e.g. .mp3, .m4a, .wav)');
    });
  });

  it('should accept valid audio formats', async () => {
    const validFormats = ['.mp3', '.m4a', '.wav', '.ogg', '.aac', '.flac'];
    
    for (const format of validFormats) {
      jest.clearAllMocks();
      // Reset the episodes mock for each iteration
      mockEq.mockResolvedValue({
        data: [],
        error: null
      });
      
      let unmount: () => void;
      
      await act(async () => {
        const renderResult = render(<EpisodeFormClient {...defaultProps} />);
        unmount = renderResult.unmount;
      });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByLabelText(/episode title/i)).toBeTruthy();
      });

      fireEvent.change(screen.getByLabelText(/episode title/i), {
        target: { value: 'Test Episode' }
      });
      fireEvent.change(screen.getByLabelText(/audio url/i), {
        target: { value: `https://example.com/audio${format}` }
      });

      fireEvent.click(screen.getByRole('button', { name: /publish episode/i }));

      await waitFor(() => {
        expect(toast.error).not.toHaveBeenCalledWith('Audio URL must point to a valid audio file (e.g. .mp3, .m4a, .wav)');
      });
      
      unmount!();
    }
  });

  it('should submit form successfully for publishing episode', async () => {
    // Mock episodes query to return empty array (no existing episodes)
    mockEq.mockResolvedValueOnce({
      data: [],
      error: null
    });

    // Mock successful insert
    mockSingle.mockResolvedValueOnce({
      data: { id: 'episode-123' },
      error: null
    });

    await act(async () => {
      render(<EpisodeFormClient {...defaultProps} />);
    });

    fireEvent.change(screen.getByLabelText(/episode title/i), {
      target: { value: 'Test Episode' }
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test Description' }
    });
    fireEvent.change(screen.getByLabelText(/audio url/i), {
      target: { value: 'https://example.com/audio.mp3' }
    });
    fireEvent.change(screen.getByLabelText(/season number/i), {
      target: { value: '1' }
    });
    fireEvent.change(screen.getByLabelText(/episode number/i), {
      target: { value: '1' }
    });

    fireEvent.click(screen.getByRole('button', { name: /publish episode/i }));

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Episode',
        description: 'Test Description',
        audio_url: 'https://example.com/audio.mp3',
        season_number: '1',
        episode_number: '1',
        explicit: false,
        podcast_id: 'podcast-123',
        status: 'published'
      }));
    });

    expect(toast.success).toHaveBeenCalledWith('Episode published successfully!');
    expect(defaultProps.onSuccess).toHaveBeenCalled();
  });

  it('should submit form successfully for saving as draft', async () => {
    // Mock episodes query to return empty array (no existing episodes)
    mockEq.mockResolvedValueOnce({
      data: [],
      error: null
    });

    // Mock successful insert
    mockSingle.mockResolvedValueOnce({
      data: { id: 'episode-123' },
      error: null
    });

    await act(async () => {
      render(<EpisodeFormClient {...defaultProps} />);
    });

    fireEvent.change(screen.getByLabelText(/episode title/i), {
      target: { value: 'Test Episode' }
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test Description' }
    });
    fireEvent.change(screen.getByLabelText(/audio url/i), {
      target: { value: 'https://example.com/audio.mp3' }
    });
    fireEvent.change(screen.getByLabelText(/season number/i), {
      target: { value: '1' }
    });
    fireEvent.change(screen.getByLabelText(/episode number/i), {
      target: { value: '1' }
    });

    fireEvent.click(screen.getByRole('button', { name: /save draft/i }));

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Episode',
        description: 'Test Description',
        audio_url: 'https://example.com/audio.mp3',
        season_number: '1',
        episode_number: '1',
        explicit: false,
        podcast_id: 'podcast-123',
        status: 'draft'
      }));
    });

    expect(toast.success).toHaveBeenCalledWith('Episode saved as draft successfully!');
    expect(defaultProps.onSuccess).toHaveBeenCalled();
  });

  it('should update publish_date when publishing episode in edit mode', async () => {
    const initialData = {
      id: 'episode-123',
      title: 'Test Episode',
      season_number: '1',
      episode_number: '1',
      status: 'draft' as const
    };

    // Mock episodes query to return empty array
    mockEq.mockResolvedValueOnce({
      data: [],
      error: null
    });

    // Mock successful update
    mockSingle.mockResolvedValueOnce({
      data: { id: 'episode-123' },
      error: null
    });

    await act(async () => {
      render(<EpisodeFormClient {...defaultProps} initialData={initialData} />);
    });

    // Wait for form to be populated
    await waitFor(() => {
      expect((screen.getByLabelText(/episode title/i) as HTMLInputElement).value).toBe('Test Episode');
    });

    fireEvent.change(screen.getByLabelText(/audio url/i), {
      target: { value: 'https://example.com/audio.mp3' }
    });

    fireEvent.click(screen.getByRole('button', { name: /publish episode/i }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Episode',
        audio_url: 'https://example.com/audio.mp3',
        season_number: '1',
        episode_number: '1',
        explicit: false,
        status: 'published',
        publish_date: expect.any(String)
      }));
    });

    expect(toast.success).toHaveBeenCalledWith('Episode updated successfully!');
    expect(defaultProps.onSuccess).toHaveBeenCalled();
  });

  it('should not update publish_date when saving as draft in edit mode', async () => {
    const initialData = {
      id: 'episode-123',
      title: 'Test Episode',
      season_number: '1',
      episode_number: '1',
      status: 'published' as const
    };

    // Mock episodes query to return empty array
    mockEq.mockResolvedValueOnce({
      data: [],
      error: null
    });

    // Mock successful update
    mockSingle.mockResolvedValueOnce({
      data: { id: 'episode-123' },
      error: null
    });

    await act(async () => {
      render(<EpisodeFormClient {...defaultProps} initialData={initialData} />);
    });

    // Wait for form to be populated
    await waitFor(() => {
      expect((screen.getByLabelText(/episode title/i) as HTMLInputElement).value).toBe('Test Episode');
    });

    fireEvent.change(screen.getByLabelText(/audio url/i), {
      target: { value: 'https://example.com/audio.mp3' }
    });

    fireEvent.click(screen.getByRole('button', { name: /save draft/i }));

    await waitFor(() => {
      // Verify update was called but without publish_date
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Episode',
        audio_url: 'https://example.com/audio.mp3',
        season_number: '1',
        episode_number: '1',
        explicit: false,
        status: 'draft'
      }));
      
      // Verify publish_date was NOT included in the update
      expect(mockUpdate).toHaveBeenCalledWith(expect.not.objectContaining({
        publish_date: expect.any(String)
      }));
    });

    expect(toast.success).toHaveBeenCalledWith('Episode saved as draft successfully!');
    expect(defaultProps.onSuccess).toHaveBeenCalled();
  });

  it('should handle cancel button', async () => {
    await act(async () => {
      render(<EpisodeFormClient {...defaultProps} />);
    });

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('should handle database errors', async () => {
    // Mock episodes query to succeed first, then insertion to fail
    mockEq.mockResolvedValueOnce({
      data: [],
      error: null
    });
    
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'Database error' }
    });

    await act(async () => {
      render(<EpisodeFormClient {...defaultProps} />);
    });

    fireEvent.change(screen.getByLabelText(/episode title/i), {
      target: { value: 'Test Episode' }
    });
    fireEvent.change(screen.getByLabelText(/audio url/i), {
      target: { value: 'https://example.com/audio.mp3' }
    });
    fireEvent.change(screen.getByLabelText(/season number/i), {
      target: { value: '1' }
    });
    fireEvent.change(screen.getByLabelText(/episode number/i), {
      target: { value: '1' }
    });

    fireEvent.click(screen.getByRole('button', { name: /publish episode/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to create episode');
    });
  });

  it('should handle explicit content checkbox', async () => {
    await act(async () => {
      render(<EpisodeFormClient {...defaultProps} />);
    });

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  // New tests for smart defaults functionality
  it('should set default season 1 episode 1 when no episodes exist', async () => {
    // Mock empty episodes array
    mockEq.mockResolvedValueOnce({
      data: [],
      error: null
    });

    await act(async () => {
      render(<EpisodeFormClient {...defaultProps} />);
    });

    await waitFor(() => {
      expect((screen.getByLabelText(/season number/i) as HTMLInputElement).value).toBe('1');
      expect((screen.getByLabelText(/episode number/i) as HTMLInputElement).value).toBe('1');
    });
  });

  it('should set default to newest season and next episode number', async () => {
    // Mock existing episodes: Season 1 has episodes 1-3, Season 2 has episodes 1-2
    mockEq.mockResolvedValueOnce({
      data: [
        { season_number: '1', episode_number: '1' },
        { season_number: '1', episode_number: '2' },
        { season_number: '1', episode_number: '3' },
        { season_number: '2', episode_number: '1' },
        { season_number: '2', episode_number: '2' }
      ],
      error: null
    });

    await act(async () => {
      render(<EpisodeFormClient {...defaultProps} />);
    });

    await waitFor(() => {
      expect((screen.getByLabelText(/season number/i) as HTMLInputElement).value).toBe('2');
      expect((screen.getByLabelText(/episode number/i) as HTMLInputElement).value).toBe('3');
    });
  });

  it('should update episode number when season changes to existing season', async () => {
    // Mock existing episodes
    mockEq.mockResolvedValueOnce({
      data: [
        { season_number: '1', episode_number: '1' },
        { season_number: '1', episode_number: '2' },
        { season_number: '1', episode_number: '3' },
        { season_number: '2', episode_number: '1' }
      ],
      error: null
    });

    await act(async () => {
      render(<EpisodeFormClient {...defaultProps} />);
    });

    // Wait for initial defaults to be set
    await waitFor(() => {
      expect((screen.getByLabelText(/season number/i) as HTMLInputElement).value).toBe('2');
      expect((screen.getByLabelText(/episode number/i) as HTMLInputElement).value).toBe('2');
    });

    // Change season to 1
    fireEvent.change(screen.getByLabelText(/season number/i), {
      target: { value: '1' }
    });

    await waitFor(() => {
      expect((screen.getByLabelText(/season number/i) as HTMLInputElement).value).toBe('1');
      expect((screen.getByLabelText(/episode number/i) as HTMLInputElement).value).toBe('4');
    });
  });

  it('should set episode 1 when season changes to new season', async () => {
    // Mock existing episodes
    mockEq.mockResolvedValueOnce({
      data: [
        { season_number: '1', episode_number: '1' },
        { season_number: '1', episode_number: '2' },
        { season_number: '2', episode_number: '1' }
      ],
      error: null
    });

    await act(async () => {
      render(<EpisodeFormClient {...defaultProps} />);
    });

    // Wait for initial defaults
    await waitFor(() => {
      expect((screen.getByLabelText(/season number/i) as HTMLInputElement).value).toBe('2');
    });

    // Change to a new season (3)
    fireEvent.change(screen.getByLabelText(/season number/i), {
      target: { value: '3' }
    });

    await waitFor(() => {
      expect((screen.getByLabelText(/season number/i) as HTMLInputElement).value).toBe('3');
      expect((screen.getByLabelText(/episode number/i) as HTMLInputElement).value).toBe('1');
    });
  });

  it('should not auto-update fields when in edit mode', async () => {
    const initialData = {
      title: 'Edit Episode',
      season_number: '1',
      episode_number: '5'
    };

    // Mock existing episodes
    mockEq.mockResolvedValueOnce({
      data: [
        { season_number: '1', episode_number: '1' },
        { season_number: '2', episode_number: '1' }
      ],
      error: null
    });

    await act(async () => {
      render(<EpisodeFormClient {...defaultProps} initialData={initialData} />);
    });

    // Should keep initial values even with existing episodes
    await waitFor(() => {
      expect((screen.getByLabelText(/season number/i) as HTMLInputElement).value).toBe('1');
      expect((screen.getByLabelText(/episode number/i) as HTMLInputElement).value).toBe('5');
    });

    // Changing season in edit mode should not auto-update episode
    fireEvent.change(screen.getByLabelText(/season number/i), {
      target: { value: '2' }
    });

    await waitFor(() => {
      expect((screen.getByLabelText(/season number/i) as HTMLInputElement).value).toBe('2');
      expect((screen.getByLabelText(/episode number/i) as HTMLInputElement).value).toBe('5'); // Should remain unchanged
    });
  });

  it('should handle episodes fetch error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Mock fetch error
    mockEq.mockResolvedValueOnce({
      data: null,
      error: { message: 'Database error' }
    });

    await act(async () => {
      render(<EpisodeFormClient {...defaultProps} />);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching episodes: ', { message: 'Database error' });
    });

    // Should still render form even with fetch error
    expect(screen.getByLabelText(/episode title/i)).toBeTruthy();
    
    consoleSpy.mockRestore();
  });

  it('should validate episode numbers for duplicates', async () => {
    // Mock existing episodes for the initial fetch
    mockEq.mockResolvedValueOnce({
      data: [
        { season_number: '1', episode_number: '1' },
        { season_number: '1', episode_number: '2' }
      ],
      error: null
    });

    await act(async () => {
      render(<EpisodeFormClient {...defaultProps} />);
    });

    // Wait for initial load and defaults to be set
    await waitFor(() => {
      expect((screen.getByLabelText(/season number/i) as HTMLInputElement).value).toBe('1');
      expect((screen.getByLabelText(/episode number/i) as HTMLInputElement).value).toBe('3');
    });

    fireEvent.change(screen.getByLabelText(/episode title/i), {
      target: { value: 'Test Episode' }
    });
    fireEvent.change(screen.getByLabelText(/audio url/i), {
      target: { value: 'https://example.com/audio.mp3' }
    });
    
    // Try to create a duplicate episode (episode 1 in season 1)
    fireEvent.change(screen.getByLabelText(/episode number/i), {
      target: { value: '1' }
    });

    const form = document.querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('This episode number already exists in the selected season. Pick an unused episode number.');
    });
  });

  // New comprehensive validation tests
  it('should allow consecutive episode creation', async () => {
    // Mock existing episodes: 1, 2
    mockEq.mockResolvedValueOnce({
      data: [
        { season_number: '1', episode_number: '1' },
        { season_number: '1', episode_number: '2' }
      ],
      error: null
    });

    mockSingle.mockResolvedValueOnce({
      data: { id: 'episode-123' },
      error: null
    });

    await act(async () => {
      render(<EpisodeFormClient {...defaultProps} />);
    });

    // Wait for initial load and defaults (should auto-set to episode 3)
    await waitFor(() => {
      expect((screen.getByLabelText(/episode number/i) as HTMLInputElement).value).toBe('3');
    });

    fireEvent.change(screen.getByLabelText(/episode title/i), {
      target: { value: 'Test Episode' }
    });
    fireEvent.change(screen.getByLabelText(/audio url/i), {
      target: { value: 'https://example.com/audio.mp3' }
    });

    fireEvent.click(screen.getByRole('button', { name: /publish episode/i }));

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        episode_number: '3'
      }));
    });
  });

  it('should allow filling gaps between episodes', async () => {
    // Mock existing episodes: 1, 2, 4 (gap at 3)
    mockEq.mockResolvedValueOnce({
      data: [
        { season_number: '1', episode_number: '1' },
        { season_number: '1', episode_number: '2' },
        { season_number: '1', episode_number: '4' }
      ],
      error: null
    });

    mockSingle.mockResolvedValueOnce({
      data: { id: 'episode-123' },
      error: null
    });

    await act(async () => {
      render(<EpisodeFormClient {...defaultProps} />);
    });

    fireEvent.change(screen.getByLabelText(/episode title/i), {
      target: { value: 'Test Episode' }
    });
    fireEvent.change(screen.getByLabelText(/audio url/i), {
      target: { value: 'https://example.com/audio.mp3' }
    });
    
    // Fill the gap at episode 3
    fireEvent.change(screen.getByLabelText(/episode number/i), {
      target: { value: '3' }
    });

    fireEvent.click(screen.getByRole('button', { name: /publish episode/i }));

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        episode_number: '3'
      }));
    });
  });

  it('should allow adding episode before first episode', async () => {
    // Mock existing episodes: 2, 3, 4 (can add episode 1)
    mockEq.mockResolvedValueOnce({
      data: [
        { season_number: '1', episode_number: '2' },
        { season_number: '1', episode_number: '3' },
        { season_number: '1', episode_number: '4' }
      ],
      error: null
    });

    mockSingle.mockResolvedValueOnce({
      data: { id: 'episode-123' },
      error: null
    });

    await act(async () => {
      render(<EpisodeFormClient {...defaultProps} />);
    });

    fireEvent.change(screen.getByLabelText(/episode title/i), {
      target: { value: 'Test Episode' }
    });
    fireEvent.change(screen.getByLabelText(/audio url/i), {
      target: { value: 'https://example.com/audio.mp3' }
    });
    
    // Add episode before the first
    fireEvent.change(screen.getByLabelText(/episode number/i), {
      target: { value: '1' }
    });

    fireEvent.click(screen.getByRole('button', { name: /publish episode/i }));

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        episode_number: '1'
      }));
    });
  });

  it('should prevent arbitrary episode number jumps', async () => {
    // Mock existing episodes: 1, 2, 3
    mockEq.mockResolvedValueOnce({
      data: [
        { season_number: '1', episode_number: '1' },
        { season_number: '1', episode_number: '2' },
        { season_number: '1', episode_number: '3' }
      ],
      error: null
    });

    await act(async () => {
      render(<EpisodeFormClient {...defaultProps} />);
    });

    fireEvent.change(screen.getByLabelText(/episode title/i), {
      target: { value: 'Test Episode' }
    });
    fireEvent.change(screen.getByLabelText(/audio url/i), {
      target: { value: 'https://example.com/audio.mp3' }
    });
    
    // Try to jump to episode 10 (not allowed)
    fireEvent.change(screen.getByLabelText(/episode number/i), {
      target: { value: '10' }
    });

    const form = document.querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Episode 10 is not allowed. You can create episode 4.');
    });
  });

  it('should show gap-filling suggestion only when gaps exist', async () => {
    // Mock existing episodes: 1, 3, 5 (gaps at 2, 4)
    mockEq.mockResolvedValueOnce({
      data: [
        { season_number: '1', episode_number: '1' },
        { season_number: '1', episode_number: '3' },
        { season_number: '1', episode_number: '5' }
      ],
      error: null
    });

    await act(async () => {
      render(<EpisodeFormClient {...defaultProps} />);
    });

    fireEvent.change(screen.getByLabelText(/episode title/i), {
      target: { value: 'Test Episode' }
    });
    fireEvent.change(screen.getByLabelText(/audio url/i), {
      target: { value: 'https://example.com/audio.mp3' }
    });
    
    // Try to jump to episode 10 when gaps exist
    fireEvent.change(screen.getByLabelText(/episode number/i), {
      target: { value: '10' }
    });

    const form = document.querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Episode 10 is not allowed. You can create episode 6 or fill gaps between episodes 1-5.');
    });
  });

  it('should require episode 1 for first episode in new season', async () => {
    // Mock existing episodes in season 1 only
    mockEq.mockResolvedValueOnce({
      data: [
        { season_number: '1', episode_number: '1' },
        { season_number: '1', episode_number: '2' }
      ],
      error: null
    });

    await act(async () => {
      render(<EpisodeFormClient {...defaultProps} />);
    });

    fireEvent.change(screen.getByLabelText(/episode title/i), {
      target: { value: 'Test Episode' }
    });
    fireEvent.change(screen.getByLabelText(/audio url/i), {
      target: { value: 'https://example.com/audio.mp3' }
    });
    
    // Change to new season 2 and try episode 5
    fireEvent.change(screen.getByLabelText(/season number/i), {
      target: { value: '2' }
    });
    fireEvent.change(screen.getByLabelText(/episode number/i), {
      target: { value: '5' }
    });

    const form = document.querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('The first episode in a season must be episode 1.');
    });
  });

  it('should allow drafts with incomplete validation', async () => {
    // Mock existing episodes for validation context
    mockEq.mockResolvedValueOnce({
      data: [
        { season_number: '1', episode_number: '1' },
        { season_number: '1', episode_number: '2' }
      ],
      error: null
    });

    mockSingle.mockResolvedValueOnce({
      data: { id: 'episode-123' },
      error: null
    });

    await act(async () => {
      render(<EpisodeFormClient {...defaultProps} />);
    });

    // Only fill title, leave other fields that might fail validation
    fireEvent.change(screen.getByLabelText(/episode title/i), {
      target: { value: 'Draft Episode' }
    });
    
    // Try to save as draft with episode number that would normally fail validation
    fireEvent.change(screen.getByLabelText(/episode number/i), {
      target: { value: '10' }
    });

    fireEvent.click(screen.getByRole('button', { name: /save draft/i }));

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Draft Episode',
        episode_number: '10',
        status: 'draft'
      }));
    });
  });

  it('should validate minimum episode number', async () => {
    mockEq.mockResolvedValueOnce({
      data: [],
      error: null
    });

    await act(async () => {
      render(<EpisodeFormClient {...defaultProps} />);
    });

    fireEvent.change(screen.getByLabelText(/episode title/i), {
      target: { value: 'Test Episode' }
    });
    fireEvent.change(screen.getByLabelText(/audio url/i), {
      target: { value: 'https://example.com/audio.mp3' }
    });
    
    // Try negative episode number
    fireEvent.change(screen.getByLabelText(/episode number/i), {
      target: { value: '0' }
    });

    const form = document.querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Episode number must be 1 or greater.');
    });
  });

  it('should prevent skipped seasons', async () => {
    // Mock existing episodes in season 1 and 2
    mockEq.mockResolvedValueOnce({
      data: [
        { season_number: '1', episode_number: '1' },
        { season_number: '2', episode_number: '1' }
      ],
      error: null
    });

    await act(async () => {
      render(<EpisodeFormClient {...defaultProps} />);
    });

    fireEvent.change(screen.getByLabelText(/episode title/i), {
      target: { value: 'Test Episode' }
    });
    fireEvent.change(screen.getByLabelText(/audio url/i), {
      target: { value: 'https://example.com/audio.mp3' }
    });
    
    // Try to jump to season 4 (skipping season 3)
    fireEvent.change(screen.getByLabelText(/season number/i), {
      target: { value: '4' }
    });

    const form = document.querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('You cannot skip seasons. the next season should be 3');
    });
  });

  it('should allow publishing draft episode without validation errors', async () => {
    // Mock episodes with 1-4 published (episode 5 exists as draft but will be excluded during edit)
    const existingEpisodes = [
      { season_number: '1', episode_number: '1' },
      { season_number: '1', episode_number: '2' },
      { season_number: '1', episode_number: '3' },
      { season_number: '1', episode_number: '4' },
    ];

    mockEq.mockResolvedValueOnce({
      data: existingEpisodes,
      error: null
    });

    // Mock successful update
    mockSingle.mockResolvedValueOnce({
      data: { id: 'episode-5' },
      error: null
    });

    // Initial data for editing episode 5 (currently a draft)
    const initialData = {
      id: 'episode-5',
      title: 'Episode 5',
      description: 'Draft episode',
      audio_url: 'https://example.com/episode5.mp3',
      season_number: '1',
      episode_number: '5',
      status: 'draft' as const
    };

    const mockOnSuccess = jest.fn();
    const mockOnCancel = jest.fn();

    await act(async () => {
      render(
        <EpisodeFormClient
          podcastId="test-podcast"
          initialData={initialData}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );
    });

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Episode 5')).toBeInTheDocument();
    });

    // Click publish button (episode 5 should be allowed since it's the current episode being edited)
    const publishButton = screen.getByText('Publish Episode');
    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });

    // Should not show any error toasts
    expect(toast.error).not.toHaveBeenCalled();
  });
});
