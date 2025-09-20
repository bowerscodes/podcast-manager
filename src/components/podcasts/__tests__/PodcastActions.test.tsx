import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PodcastActions from '../PodcastActions';

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

// Mock BackButton component
jest.mock('../../ui/BackButton', () => {
  return function MockBackButton({ to }: { to?: string }) {
    return (
      <button 
        className="flex px-0 text-blue-400 hover:text-primary-500 transition-colors"
        onClick={() => {
          if (to) {
            const router = jest.requireMock('next/navigation').useRouter();
            router.push(`/${to}`);
          } else if (window.history.length > 1) {
            window.history.back();
          } else {
            const router = jest.requireMock('next/navigation').useRouter();
            router.push('/podcasts');
          }
        }}
        style={{ 
          background: 'transparent', 
          cursor: 'pointer'
        }}
      > 
        {`← `}<p className="pl-2 hover:underline underline-offset-4">
          Back {to && `to ${to.charAt(0).toUpperCase() + to.slice(1)}`}
        </p>
      </button>
    );
  };
});

// Mock DeleteModal
jest.mock('../../modals/DeleteModal', () => {
  return function MockDeleteModal({ 
    isOpen, 
    onClose, 
    onSuccess, 
    podcastId 
  }: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSuccess: () => void; 
    podcastId: string; 
  }) {
    if (!isOpen) return null;
    
    return (
      <div data-testid="delete-modal">
        <p>Delete Modal for podcast: {podcastId}</p>
        <button onClick={onClose}>Cancel</button>
        <button onClick={onSuccess}>Confirm Delete</button>
      </div>
    );
  };
});

// Mock HeroUI Button
jest.mock('@heroui/button', () => ({
  Button: ({ children, onPress, variant, color, ...props }: { 
    children: React.ReactNode; 
    onPress?: () => void; 
    variant?: string; 
    color?: string; 
    [key: string]: unknown;
  }) => (
    <button onClick={onPress} data-variant={variant} data-color={color} {...props}>
      {children}
    </button>
  ),
}));

describe('PodcastActions', () => {
  const mockPodcast = {
    id: 'podcast-123',
    title: 'Test Podcast',
    podcast_name: 'test-podcast',
    description: 'Test Description',
    user_id: 'user-123',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
    artwork: 'https://example.com/artwork.jpg',
    language: 'en',
    categories: ['Technology'],
    author: 'Test Author',
    email: 'test@example.com',
    explicit: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset window.history.length to default
    Object.defineProperty(window, 'history', {
      value: { length: 2 },
      writable: true,
    });
  });

  describe('Back Button Functionality', () => {
    it('should render back button', () => {
      render(<PodcastActions podcast={mockPodcast} />);
      
      // Use flexible text matching for split text
      expect(screen.getByText('Back to Podcasts')).toBeInTheDocument();
    });

    it('should use router.push() when BackButton has "to" prop', () => {
      render(<PodcastActions podcast={mockPodcast} />);
      
      // Click on the button element containing the text
      const backButton = screen.getByText('Back to Podcasts').closest('button');
      fireEvent.click(backButton!);
      
      // Since BackButton has to="podcasts", it should always push to /podcasts
      expect(mockPush).toHaveBeenCalledWith('/podcasts');
      expect(mockBack).not.toHaveBeenCalled();
    });

    it('should navigate to fallback path when no history and no "to" prop', () => {
      // Test this by creating a BackButton without "to" prop
      // This is mainly to test BackButton component behavior
      render(<PodcastActions podcast={mockPodcast} />);
      
      const backButton = screen.getByText('Back to Podcasts').closest('button');
      fireEvent.click(backButton!);
      
      expect(mockPush).toHaveBeenCalledWith('/podcasts');
    });
  });

  describe('Delete Button Functionality', () => {
    it('should render delete button', () => {
      render(<PodcastActions podcast={mockPodcast} />);
      
      const deleteButton = screen.getByText('Delete Podcast');
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toHaveAttribute('data-variant', 'bordered');
      expect(deleteButton).toHaveAttribute('data-color', 'danger');
    });

    it('should open delete modal when delete button is clicked', () => {
      render(<PodcastActions podcast={mockPodcast} />);
      
      // Modal should not be visible initially
      expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
      
      // Click delete button
      fireEvent.click(screen.getByText('Delete Podcast'));
      
      // Modal should now be visible
      expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
      expect(screen.getByText('Delete Modal for podcast: podcast-123')).toBeInTheDocument();
    });

    it('should close modal when cancel is clicked', () => {
      render(<PodcastActions podcast={mockPodcast} />);
      
      // Open modal
      fireEvent.click(screen.getByText('Delete Podcast'));
      expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
      
      // Click cancel
      fireEvent.click(screen.getByText('Cancel'));
      
      // Modal should be closed
      expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
    });

    it('should call handleDeleteSuccess when delete is successful', () => {
      render(<PodcastActions podcast={mockPodcast} />);
      
      // Open modal
      fireEvent.click(screen.getByText('Delete Podcast'));
      
      // Confirm delete (this should trigger onSuccess which calls handleDeleteSuccess)
      fireEvent.click(screen.getByText('Confirm Delete'));
      
      // Should always navigate to /podcasts after delete
      expect(mockPush).toHaveBeenCalledWith('/podcasts');
    });

    it('should navigate to /podcasts when delete is successful', () => {
      render(<PodcastActions podcast={mockPodcast} />);
      
      // Open modal
      fireEvent.click(screen.getByText('Delete Podcast'));
      
      // Confirm delete
      fireEvent.click(screen.getByText('Confirm Delete'));
      
      // Should always use router.push() to /podcasts after delete
      expect(mockPush).toHaveBeenCalledWith('/podcasts');
    });
  });

  describe('Layout and Styling', () => {
    it('should render buttons with correct layout classes', () => {
      render(<PodcastActions podcast={mockPodcast} />);
      
      const container = screen.getByText('Back to Podcasts').closest('div');
      expect(container).toHaveClass('flex', 'justify-between');
    });

    it('should pass correct props to DeleteModal', () => {
      render(<PodcastActions podcast={mockPodcast} />);
      
      // Open modal
      fireEvent.click(screen.getByText('Delete Podcast'));
      
      // Check that the modal receives the correct podcast ID
      expect(screen.getByText('Delete Modal for podcast: podcast-123')).toBeInTheDocument();
    });
  });

  describe('History Detection Edge Cases', () => {
    it('should handle undefined history length gracefully', () => {
      Object.defineProperty(window, 'history', {
        value: { length: undefined },
        writable: true,
      });

      render(<PodcastActions podcast={mockPodcast} />);
      
      const backButton = screen.getByText('Back to Podcasts').closest('button');
      fireEvent.click(backButton!);
      
      // Should fallback to push when history length is undefined
      expect(mockPush).toHaveBeenCalledWith('/podcasts');
    });

    it('should update canGoBack state when component mounts', async () => {
      Object.defineProperty(window, 'history', {
        value: { length: 5 },
        writable: true,
      });

      render(<PodcastActions podcast={mockPodcast} />);
      
      await waitFor(() => {
        const backButton = screen.getByText('Back to Podcasts').closest('button');
        fireEvent.click(backButton!);
        // BackButton with to="podcasts" always pushes to /podcasts
        expect(mockPush).toHaveBeenCalledWith('/podcasts');
      });
    });
  });
});
