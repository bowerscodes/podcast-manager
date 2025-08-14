import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import toast from 'react-hot-toast';
import NewEpisodeFormClient from '../NewEpisodeFormClient';

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
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();

// Set up the chained mock behavior
mockInsert.mockReturnValue({
  select: jest.fn().mockReturnValue({
    single: mockSingle
  })
});

mockSelect.mockReturnValue({
  eq: mockEq
});

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: mockInsert,
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

describe('NewEpisodeFormClient', () => {
  const defaultProps = {
    podcastId: 'podcast-123',
    initialData: {},
    onSuccess: jest.fn(),
    onCancel: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all form fields', () => {
    render(<NewEpisodeFormClient {...defaultProps} />);

    expect(screen.getByLabelText(/episode title/i)).toBeTruthy();
    expect(screen.getAllByRole('textbox')[1]).toBeTruthy(); // Description textarea
    expect(screen.getByLabelText(/audio url/i)).toBeTruthy();
    expect(screen.getByLabelText(/season number/i)).toBeTruthy();
    expect(screen.getByLabelText(/episode number/i)).toBeTruthy();
    expect(screen.getByRole('checkbox')).toBeTruthy();
  });

  it('should populate form with initial data', () => {
    const initialData = {
      title: 'Test Episode',
      description: 'Test Description',
      audio_url: 'https://example.com/audio.mp3',
      season_number: '1',
      episode_number: '5',
      explicit: true
    };
    
    render(<NewEpisodeFormClient {...defaultProps} initialData={initialData} />);

    expect((screen.getByLabelText(/episode title/i) as HTMLInputElement).value).toBe('Test Episode');
    expect((screen.getAllByRole('textbox')[1] as HTMLTextAreaElement).value).toBe('Test Description');
    expect((screen.getByLabelText(/audio url/i) as HTMLInputElement).value).toBe('https://example.com/audio.mp3');
    expect((screen.getByLabelText(/season number/i) as HTMLInputElement).value).toBe('1');
    expect((screen.getByLabelText(/episode number/i) as HTMLInputElement).value).toBe('5');
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(true);
  });

  it('should validate audio URL format', async () => {
    render(<NewEpisodeFormClient {...defaultProps} />);

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
      const { unmount } = render(<NewEpisodeFormClient {...defaultProps} />);

      fireEvent.change(screen.getByLabelText(/episode title/i), {
        target: { value: 'Test Episode' }
      });
      fireEvent.change(screen.getByLabelText(/audio url/i), {
        target: { value: `https://example.com/audio${format}` }
      });

      fireEvent.click(screen.getByRole('button', { name: /create podcast/i }));

      await waitFor(() => {
        expect(toast.error).not.toHaveBeenCalledWith('Audio URL must point to a valid audio file (e.g. .mp3, .m4a, .wav)');
      });
      
      unmount();
    }
  });

  it('should submit form successfully', async () => {
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

    render(<NewEpisodeFormClient {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/episode title/i), {
      target: { value: 'Test Episode' }
    });
    fireEvent.change(screen.getAllByRole('textbox')[1], {
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

    fireEvent.click(screen.getByRole('button', { name: /create podcast/i }));

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith({
        title: 'Test Episode',
        description: 'Test Description',
        audio_url: 'https://example.com/audio.mp3',
        season_number: '1',
        episode_number: '1',
        explicit: false,
        podcast_id: 'podcast-123'
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Episode created successfully!');
    expect(defaultProps.onSuccess).toHaveBeenCalled();
  });

  it('should handle cancel button', () => {
    render(<NewEpisodeFormClient {...defaultProps} />);

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

    render(<NewEpisodeFormClient {...defaultProps} />);

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

    const form = document.querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to create episode');
    });
  });

  it('should handle explicit content checkbox', () => {
    render(<NewEpisodeFormClient {...defaultProps} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('should validate episode numbers for duplicates', async () => {
    // Mock existing episodes
    mockEq.mockResolvedValueOnce({
      data: [
        { season_number: 1, episode_number: '1' },
        { season_number: 1, episode_number: '2' }
      ],
      error: null
    });

    render(<NewEpisodeFormClient {...defaultProps} />);

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

    const form = document.querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('This episode number already exists in the selected season. Pick an unused episode number.');
    });
  });
});
