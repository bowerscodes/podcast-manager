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
  eq: jest.fn().mockReturnValue({
    eq: mockEq
  })
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
        { season_number: '1', episode_number: '1', status: 'published' },
        { season_number: '1', episode_number: '2', status: 'published' },
        { season_number: '1', episode_number: '3', status: 'published' },
        { season_number: '2', episode_number: '1', status: 'published' },
        { season_number: '2', episode_number: '2', status: 'published' }
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
        { season_number: '1', episode_number: '1', status: 'published' },
        { season_number: '1', episode_number: '2', status: 'published' },
        { season_number: '1', episode_number: '3', status: 'published' },
        { season_number: '2', episode_number: '1', status: 'published' }
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
        { season_number: '1', episode_number: '1', status: 'published' },
        { season_number: '1', episode_number: '2', status: 'published' },
        { season_number: '2', episode_number: '1', status: 'published' }
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
        { season_number: '1', episode_number: '1', status: 'published' },
        { season_number: '2', episode_number: '1', status: 'published' }
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
        { season_number: '1', episode_number: '1', status: 'published' },
        { season_number: '1', episode_number: '2', status: 'published' }
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
        { season_number: '1', episode_number: '1', status: 'published' },
        { season_number: '1', episode_number: '2', status: 'published' }
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
        { season_number: '1', episode_number: '1', status: 'published' },
        { season_number: '1', episode_number: '2', status: 'published' },
        { season_number: '1', episode_number: '4', status: 'published' }
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
        { season_number: '1', episode_number: '2', status: 'published' },
        { season_number: '1', episode_number: '3', status: 'published' },
        { season_number: '1', episode_number: '4', status: 'published' }
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
        { season_number: '1', episode_number: '1', status: 'published' },
        { season_number: '1', episode_number: '2', status: 'published' },
        { season_number: '1', episode_number: '3', status: 'published' }
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
        { season_number: '1', episode_number: '1', status: 'published' },
        { season_number: '1', episode_number: '3', status: 'published' },
        { season_number: '1', episode_number: '5', status: 'published' }
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
        { season_number: '1', episode_number: '1', status: 'published' },
        { season_number: '1', episode_number: '2', status: 'published' }
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
        { season_number: '1', episode_number: '1', status: 'published' },
        { season_number: '1', episode_number: '2', status: 'published' }
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
        { season_number: '1', episode_number: '1', status: 'published' },
        { season_number: '2', episode_number: '1', status: 'published' }
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
      { season_number: '1', episode_number: '1', status: 'published' },
      { season_number: '1', episode_number: '2', status: 'published' },
      { season_number: '1', episode_number: '3', status: 'published' },
      { season_number: '1', episode_number: '4', status: 'published' },
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

  // TDD Tests for Season/Episode Validation - Edge Cases and Requirements
  describe('TDD: Season Validation Requirements', () => {
    it('should allow creating season 1 when no episodes exist', async () => {
      mockEq.mockResolvedValueOnce({
        data: [],
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
      fireEvent.change(screen.getByLabelText(/season number/i), {
        target: { value: '1' }
      });
      fireEvent.change(screen.getByLabelText(/episode number/i), {
        target: { value: '1' }
      });

      fireEvent.click(screen.getByRole('button', { name: /publish episode/i }));

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
          season_number: '1',
          episode_number: '1'
        }));
      });
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should allow creating season 2 when season 1 exists', async () => {
      mockEq.mockResolvedValueOnce({
        data: [
          { season_number: '1', episode_number: '1', status: 'published' },
          { season_number: '1', episode_number: '2', status: 'published' }
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
      fireEvent.change(screen.getByLabelText(/season number/i), {
        target: { value: '2' }
      });
      fireEvent.change(screen.getByLabelText(/episode number/i), {
        target: { value: '1' }
      });

      fireEvent.click(screen.getByRole('button', { name: /publish episode/i }));

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
          season_number: '2',
          episode_number: '1'
        }));
      });
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should prevent skipping seasons (cannot create season 3 when only season 1 exists)', async () => {
      mockEq.mockResolvedValueOnce({
        data: [
          { season_number: '1', episode_number: '1', status: 'published' },
          { season_number: '1', episode_number: '2', status: 'published' }
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
      fireEvent.change(screen.getByLabelText(/season number/i), {
        target: { value: '3' }
      });
      fireEvent.change(screen.getByLabelText(/episode number/i), {
        target: { value: '1' }
      });

      const form = document.querySelector('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('You cannot skip seasons. the next season should be 2');
      });
    });

    it('should allow creating season 3 when seasons 1 and 2 exist', async () => {
      mockEq.mockResolvedValueOnce({
        data: [
          { season_number: '1', episode_number: '1', status: 'published' },
          { season_number: '1', episode_number: '2', status: 'published' },
          { season_number: '2', episode_number: '1', status: 'published' }
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
      fireEvent.change(screen.getByLabelText(/season number/i), {
        target: { value: '3' }
      });
      fireEvent.change(screen.getByLabelText(/episode number/i), {
        target: { value: '1' }
      });

      fireEvent.click(screen.getByRole('button', { name: /publish episode/i }));

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
          season_number: '3',
          episode_number: '1'
        }));
      });
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should prevent creating season 0 or negative seasons', async () => {
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
      fireEvent.change(screen.getByLabelText(/season number/i), {
        target: { value: '0' }
      });
      fireEvent.change(screen.getByLabelText(/episode number/i), {
        target: { value: '1' }
      });

      const form = document.querySelector('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Season number must be 1 or greater.');
      });
    });
  });

  describe('TDD: Episode Validation Requirements', () => {
    it('should allow creating episode 2 when episode 1 exists in same season', async () => {
      mockEq.mockResolvedValueOnce({
        data: [
          { season_number: '1', episode_number: '1', status: 'published' }
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
      fireEvent.change(screen.getByLabelText(/season number/i), {
        target: { value: '1' }
      });
      fireEvent.change(screen.getByLabelText(/episode number/i), {
        target: { value: '2' }
      });

      fireEvent.click(screen.getByRole('button', { name: /publish episode/i }));

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
          season_number: '1',
          episode_number: '2'
        }));
      });
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should allow creating episode 5 when episodes 1-4 exist in same season', async () => {
      mockEq.mockResolvedValueOnce({
        data: [
          { season_number: '1', episode_number: '1', status: 'published' },
          { season_number: '1', episode_number: '2', status: 'published' },
          { season_number: '1', episode_number: '3', status: 'published' },
          { season_number: '1', episode_number: '4', status: 'published' }
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
      fireEvent.change(screen.getByLabelText(/season number/i), {
        target: { value: '1' }
      });
      fireEvent.change(screen.getByLabelText(/episode number/i), {
        target: { value: '5' }
      });

      fireEvent.click(screen.getByRole('button', { name: /publish episode/i }));

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
          season_number: '1',
          episode_number: '5'
        }));
      });
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should prevent skipping episodes (cannot create episode 3 when only episode 1 exists)', async () => {
      mockEq.mockResolvedValueOnce({
        data: [
          { season_number: '1', episode_number: '1', status: 'published' }
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
      fireEvent.change(screen.getByLabelText(/season number/i), {
        target: { value: '1' }
      });
      fireEvent.change(screen.getByLabelText(/episode number/i), {
        target: { value: '3' }
      });

      const form = document.querySelector('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Episode 3 is not allowed. You can create episode 2.');
      });
    });

    it('should allow creating episode 1 in new season even when other seasons have multiple episodes', async () => {
      mockEq.mockResolvedValueOnce({
        data: [
          { season_number: '1', episode_number: '1', status: 'published' },
          { season_number: '1', episode_number: '2', status: 'published' },
          { season_number: '1', episode_number: '3', status: 'published' }
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
      fireEvent.change(screen.getByLabelText(/season number/i), {
        target: { value: '2' }
      });
      fireEvent.change(screen.getByLabelText(/episode number/i), {
        target: { value: '1' }
      });

      fireEvent.click(screen.getByRole('button', { name: /publish episode/i }));

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
          season_number: '2',
          episode_number: '1'
        }));
      });
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should prevent creating episode 2 as first episode in new season', async () => {
      mockEq.mockResolvedValueOnce({
        data: [
          { season_number: '1', episode_number: '1', status: 'published' },
          { season_number: '1', episode_number: '2', status: 'published' }
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
      fireEvent.change(screen.getByLabelText(/season number/i), {
        target: { value: '2' }
      });
      fireEvent.change(screen.getByLabelText(/episode number/i), {
        target: { value: '2' }
      });

      const form = document.querySelector('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('The first episode in a season must be episode 1.');
      });
    });
  });

  describe('TDD: Draft Mode Validation Bypass', () => {
    it('should allow saving invalid season as draft (skipping seasons)', async () => {
      mockEq.mockResolvedValueOnce({
        data: [
          { season_number: '1', episode_number: '1', status: 'published' }
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
        target: { value: 'Draft Episode' }
      });
      fireEvent.change(screen.getByLabelText(/season number/i), {
        target: { value: '5' }
      });
      fireEvent.change(screen.getByLabelText(/episode number/i), {
        target: { value: '10' }
      });

      fireEvent.click(screen.getByRole('button', { name: /save draft/i }));

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
          title: 'Draft Episode',
          season_number: '5',
          episode_number: '10',
          status: 'draft'
        }));
      });
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should allow saving invalid episode as draft (skipping episodes)', async () => {
      mockEq.mockResolvedValueOnce({
        data: [
          { season_number: '1', episode_number: '1', status: 'published' },
          { season_number: '1', episode_number: '2', status: 'published' }
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
        target: { value: 'Draft Episode' }
      });
      fireEvent.change(screen.getByLabelText(/season number/i), {
        target: { value: '1' }
      });
      fireEvent.change(screen.getByLabelText(/episode number/i), {
        target: { value: '15' }
      });

      fireEvent.click(screen.getByRole('button', { name: /save draft/i }));

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
          title: 'Draft Episode',
          season_number: '1',
          episode_number: '15',
          status: 'draft'
        }));
      });
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should allow saving draft with negative season/episode numbers', async () => {
      mockEq.mockResolvedValueOnce({
        data: [
          { season_number: '1', episode_number: '1', status: 'published' }
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
        target: { value: 'Draft Episode' }
      });
      fireEvent.change(screen.getByLabelText(/season number/i), {
        target: { value: '-1' }
      });
      fireEvent.change(screen.getByLabelText(/episode number/i), {
        target: { value: '-5' }
      });

      fireEvent.click(screen.getByRole('button', { name: /save draft/i }));

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
          title: 'Draft Episode',
          season_number: '-1',
          episode_number: '-5',
          status: 'draft'
        }));
      });
      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  describe('TDD: Draft to Published Validation', () => {
    it('should apply validation when editing a draft and publishing it', async () => {
      // Mock existing episodes for the initial fetch
      mockEq.mockResolvedValueOnce({
        data: [
          { season_number: '1', episode_number: '1', status: 'published' },
          { season_number: '1', episode_number: '2', status: 'published' }
        ],
        error: null
      });

      const initialData = {
        id: 'episode-123',
        title: 'Draft Episode',
        season_number: '1',
        episode_number: '15', // Invalid episode number saved as draft
        status: 'draft' as const
      };

      await act(async () => {
        render(<EpisodeFormClient {...defaultProps} initialData={initialData} />);
      });

      // Wait for form to be populated
      await waitFor(() => {
        expect((screen.getByLabelText(/episode title/i) as HTMLInputElement).value).toBe('Draft Episode');
        expect((screen.getByLabelText(/episode number/i) as HTMLInputElement).value).toBe('15');
      });

      fireEvent.change(screen.getByLabelText(/audio url/i), {
        target: { value: 'https://example.com/audio.mp3' }
      });

      // Try to publish the draft with invalid episode number
      fireEvent.click(screen.getByRole('button', { name: /publish episode/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Episode 15 is not allowed. You can create episode 3.');
      });
    });

    it('should allow publishing draft after fixing validation issues', async () => {
      // Mock existing episodes for the initial fetch
      mockEq.mockResolvedValueOnce({
        data: [
          { season_number: '1', episode_number: '1', status: 'published' },
          { season_number: '1', episode_number: '2', status: 'published' }
        ],
        error: null
      });

      mockSingle.mockResolvedValueOnce({
        data: { id: 'episode-123' },
        error: null
      });

      const initialData = {
        id: 'episode-123',
        title: 'Draft Episode',
        season_number: '1',
        episode_number: '15', // Invalid episode number saved as draft
        status: 'draft' as const
      };

      await act(async () => {
        render(<EpisodeFormClient {...defaultProps} initialData={initialData} />);
      });

      // Wait for form to be populated
      await waitFor(() => {
        expect((screen.getByLabelText(/episode title/i) as HTMLInputElement).value).toBe('Draft Episode');
        expect((screen.getByLabelText(/episode number/i) as HTMLInputElement).value).toBe('15');
      });

      fireEvent.change(screen.getByLabelText(/audio url/i), {
        target: { value: 'https://example.com/audio.mp3' }
      });
      
      // Fix the episode number to be valid
      fireEvent.change(screen.getByLabelText(/episode number/i), {
        target: { value: '3' }
      });

      fireEvent.click(screen.getByRole('button', { name: /publish episode/i }));

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
          title: 'Draft Episode',
          audio_url: 'https://example.com/audio.mp3',
          season_number: '1',
          episode_number: '3',
          status: 'published'
        }));
      });
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should allow re-saving invalid draft without validation', async () => {
      mockEq.mockResolvedValueOnce({
        data: [
          { season_number: '1', episode_number: '1', status: 'published' },
          { season_number: '1', episode_number: '2', status: 'published' }
        ],
        error: null
      });

      mockSingle.mockResolvedValueOnce({
        data: { id: 'episode-123' },
        error: null
      });

      const initialData = {
        id: 'episode-123',
        title: 'Draft Episode',
        season_number: '1',
        episode_number: '15', // Invalid episode number
        status: 'draft' as const
      };

      await act(async () => {
        render(<EpisodeFormClient {...defaultProps} initialData={initialData} />);
      });

      fireEvent.change(screen.getByLabelText(/episode title/i), {
        target: { value: 'Updated Draft Episode' }
      });

      // Save as draft again - should not validate
      fireEvent.click(screen.getByRole('button', { name: /save draft/i }));

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
          title: 'Updated Draft Episode',
          season_number: '1',
          episode_number: '15',
          status: 'draft'
        }));
      });
      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  describe('TDD: Edit Mode Episode Exclusion', () => {
    it('should prevent editing episode 5 to be episode 6 when episodes 1-5 exist (creates gap)', async () => {
      mockEq.mockResolvedValueOnce({
        data: [
          { season_number: '1', episode_number: '1', status: 'published', id: 'ep1' },
          { season_number: '1', episode_number: '2', status: 'published', id: 'ep2' },
          { season_number: '1', episode_number: '3', status: 'published', id: 'ep3' },
          { season_number: '1', episode_number: '4', status: 'published', id: 'ep4' },
          { season_number: '1', episode_number: '5', status: 'published', id: 'episode-5' }
        ],
        error: null
      });

      const initialData = {
        id: 'episode-5',
        title: 'Episode 5',
        season_number: '1',
        episode_number: '5',
        status: 'published' as const
      };

      await act(async () => {
        render(<EpisodeFormClient {...defaultProps} initialData={initialData} />);
      });

      fireEvent.change(screen.getByLabelText(/audio url/i), {
        target: { value: 'https://example.com/audio.mp3' }
      });
      
      // Change episode 5 to episode 6 - should NOT be allowed (creates gap at 5)
      fireEvent.change(screen.getByLabelText(/episode number/i), {
        target: { value: '6' }
      });

      fireEvent.click(screen.getByRole('button', { name: /publish episode/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Episode 6 is not allowed. You can create episode 5.');
      });
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should allow editing episode 5 to remain episode 5 when episodes 1-5 exist', async () => {
      mockEq.mockResolvedValueOnce({
        data: [
          { season_number: '1', episode_number: '1', status: 'published', id: 'ep1' },
          { season_number: '1', episode_number: '2', status: 'published', id: 'ep2' },
          { season_number: '1', episode_number: '3', status: 'published', id: 'ep3' },
          { season_number: '1', episode_number: '4', status: 'published', id: 'ep4' },
          { season_number: '1', episode_number: '5', status: 'published', id: 'episode-5' }
        ],
        error: null
      });

      mockSingle.mockResolvedValueOnce({
        data: { id: 'episode-5' },
        error: null
      });

      const initialData = {
        id: 'episode-5',
        title: 'Episode 5',
        season_number: '1',
        episode_number: '5',
        status: 'published' as const
      };

      await act(async () => {
        render(<EpisodeFormClient {...defaultProps} initialData={initialData} />);
      });

      fireEvent.change(screen.getByLabelText(/audio url/i), {
        target: { value: 'https://example.com/audio.mp3' }
      });
      
      // Keep episode 5 as episode 5 - should be allowed
      fireEvent.click(screen.getByRole('button', { name: /publish episode/i }));

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
          season_number: '1',
          episode_number: '5'
        }));
      });
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should allow editing episode 3 to be episode 2 when episodes 1-3 exist (reordering)', async () => {
      mockEq.mockResolvedValueOnce({
        data: [
          { season_number: '1', episode_number: '1', status: 'published' },
          { season_number: '1', episode_number: '2', status: 'published' },
          { season_number: '1', episode_number: '3', status: 'published' }
        ],
        error: null
      });

      mockSingle.mockResolvedValueOnce({
        data: { id: 'episode-3' },
        error: null
      });

      const initialData = {
        id: 'episode-3',
        title: 'Episode 3',
        season_number: '1',
        episode_number: '3',
        status: 'published' as const
      };

      await act(async () => {
        render(<EpisodeFormClient {...defaultProps} initialData={initialData} />);
      });

      fireEvent.change(screen.getByLabelText(/audio url/i), {
        target: { value: 'https://example.com/audio.mp3' }
      });
      
      // Change episode 3 to episode 2 - should fail because episode 2 exists
      fireEvent.change(screen.getByLabelText(/episode number/i), {
        target: { value: '2' }
      });

      const form = document.querySelector('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('This episode number already exists in the selected season. Pick an unused episode number.');
      });
    });

    it('should allow editing episode 2 to fill gap at episode 5 when episodes 1,2,3,6 exist', async () => {
      mockEq.mockResolvedValueOnce({
        data: [
          { season_number: '1', episode_number: '1', status: 'published' },
          { season_number: '1', episode_number: '2', status: 'published' },
          { season_number: '1', episode_number: '3', status: 'published' },
          { season_number: '1', episode_number: '6', status: 'published' }
        ],
        error: null
      });

      mockSingle.mockResolvedValueOnce({
        data: { id: 'episode-2' },
        error: null
      });

      const initialData = {
        id: 'episode-2',
        title: 'Episode 2',
        season_number: '1',
        episode_number: '2',
        status: 'published' as const
      };

      await act(async () => {
        render(<EpisodeFormClient {...defaultProps} initialData={initialData} />);
      });

      fireEvent.change(screen.getByLabelText(/audio url/i), {
        target: { value: 'https://example.com/audio.mp3' }
      });
      
      // Change episode 2 to episode 5 (filling gap) - should be allowed
      fireEvent.change(screen.getByLabelText(/episode number/i), {
        target: { value: '5' }
      });

      fireEvent.click(screen.getByRole('button', { name: /publish episode/i }));

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
          season_number: '1',
          episode_number: '5'
        }));
      });
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should prevent publishing draft with duplicate episode number when edited', async () => {
      // Mock existing published episode 5
      mockEq.mockResolvedValueOnce({
        data: [
          { season_number: '1', episode_number: '5', id: 'published-ep-5', status: 'published' }
        ],
        error: null
      });

      // Initial data for editing a DRAFT episode that also has episode number 5
      const initialData = {
        id: 'draft-ep-5', // Different ID but same episode number
        title: 'Draft Episode 5',
        season_number: '1',
        episode_number: '5', // Duplicate number!
        status: 'draft' as const
      };

      await act(async () => {
        render(<EpisodeFormClient {...defaultProps} initialData={initialData} />);
      });

      fireEvent.change(screen.getByLabelText(/audio url/i), {
        target: { value: 'https://example.com/audio.mp3' }
      });

      // Try to publish the draft - should fail because episode 5 already exists
      fireEvent.click(screen.getByRole('button', { name: /publish episode/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('This episode number already exists in the selected season. Pick an unused episode number.');
      });
    });
  });
});
