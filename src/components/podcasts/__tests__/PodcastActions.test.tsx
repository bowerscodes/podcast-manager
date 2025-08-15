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
    description: 'Test Description',
    user_id: 'user-123',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
    image_url: 'https://example.com/image.jpg',
    artwork: 'https://example.com/artwork.jpg',
    language: 'en',
    categories: ['Technology'],
    author: 'Test Author',
    email: 'test@example.com'
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
      
      expect(screen.getByText('← Back to Podcasts')).toBeInTheDocument();
    });

    it('should use router.back() when history exists', () => {
      // Set history length > 1 to simulate existing history
      Object.defineProperty(window, 'history', {
        value: { length: 3 },
        writable: true,
      });

      render(<PodcastActions podcast={mockPodcast} />);
      
      fireEvent.click(screen.getByText('← Back to Podcasts'));
      
      expect(mockBack).toHaveBeenCalledTimes(1);
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should use router.push() when no history exists', () => {
      // Set history length to 1 to simulate no history
      Object.defineProperty(window, 'history', {
        value: { length: 1 },
        writable: true,
      });

      render(<PodcastActions podcast={mockPodcast} />);
      
      // Wait for useEffect to set canGoBack state
      waitFor(() => {
        fireEvent.click(screen.getByText('← Back to Podcasts'));
        
        expect(mockPush).toHaveBeenCalledWith('/podcasts');
        expect(mockBack).not.toHaveBeenCalled();
      });
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

    it('should call handleBack when delete is successful', () => {
      Object.defineProperty(window, 'history', {
        value: { length: 3 },
        writable: true,
      });

      render(<PodcastActions podcast={mockPodcast} />);
      
      // Open modal
      fireEvent.click(screen.getByText('Delete Podcast'));
      
      // Confirm delete (this should trigger onSuccess which calls handleBack)
      fireEvent.click(screen.getByText('Confirm Delete'));
      
      // Should use router.back() since we have history
      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('should navigate to /podcasts when delete is successful and no history', () => {
      Object.defineProperty(window, 'history', {
        value: { length: 1 },
        writable: true,
      });

      render(<PodcastActions podcast={mockPodcast} />);
      
      // Open modal
      fireEvent.click(screen.getByText('Delete Podcast'));
      
      // Confirm delete
      fireEvent.click(screen.getByText('Confirm Delete'));
      
      // Should use router.push() since we have no history
      expect(mockPush).toHaveBeenCalledWith('/podcasts');
    });
  });

  describe('Layout and Styling', () => {
    it('should render buttons with correct layout classes', () => {
      render(<PodcastActions podcast={mockPodcast} />);
      
      const container = screen.getByText('← Back to Podcasts').closest('div');
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
      
      fireEvent.click(screen.getByText('← Back to Podcasts'));
      
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
        fireEvent.click(screen.getByText('← Back to Podcasts'));
        expect(mockBack).toHaveBeenCalledTimes(1);
      });
    });
  });
});
