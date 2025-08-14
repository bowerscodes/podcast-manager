import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeleteModal from '../DeleteModal';
import toast from 'react-hot-toast';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock Supabase
const mockEq = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      delete: jest.fn(() => ({
        eq: mockEq,
      })),
    })),
  },
}));

// Mock HeroUI components
jest.mock('@heroui/modal', () => ({
  Modal: ({ isOpen, onOpenChange, children }: { 
    isOpen: boolean; 
    onOpenChange: (open: boolean) => void; 
    children: React.ReactNode; 
  }) => 
    isOpen ? (
      <div data-testid="modal" onClick={() => onOpenChange(false)}>
        {children}
      </div>
    ) : null,
  ModalContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

jest.mock('@heroui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@heroui/button', () => ({
  Button: ({ children, onPress, color, isLoading, disabled }: { 
    children: React.ReactNode; 
    onPress?: () => void; 
    color?: string; 
    isLoading?: boolean;
    disabled?: boolean;
  }) => (
    <button 
      onClick={onPress} 
      data-color={color}
      disabled={disabled || isLoading}
      data-loading={isLoading}
    >
      {children}
    </button>
  ),
}));

describe('DeleteModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockEq.mockResolvedValue({ error: null });
  });

  describe('Episode deletion', () => {
    const episodeProps = {
      isOpen: true,
      onClose: mockOnClose,
      onSuccess: mockOnSuccess,
      episodeId: 'episode-123',
    };

    it('should render episode deletion modal', () => {
      render(<DeleteModal {...episodeProps} />);

      expect(screen.getByTestId('modal')).toBeTruthy();
      expect(screen.getByText('Delete Episode')).toBeTruthy();
      expect(screen.getByText(/Are you sure you want to delete this episode/)).toBeTruthy();
    });

    it('should show correct buttons for episode deletion', () => {
      render(<DeleteModal {...episodeProps} />);

      expect(screen.getByText('Cancel')).toBeTruthy();
      expect(screen.getByText('Delete')).toBeTruthy();
      
      const deleteButton = screen.getByText('Delete');
      expect(deleteButton).toHaveAttribute('data-color', 'danger');
    });

    it('should call onClose when cancel is clicked', () => {
      render(<DeleteModal {...episodeProps} />);

      fireEvent.click(screen.getByText('Cancel'));

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('should delete episode successfully', async () => {
      render(<DeleteModal {...episodeProps} />);

      fireEvent.click(screen.getByText('Delete'));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Episode deleted successfully');
        expect(mockOnSuccess).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should handle deletion error', async () => {
      mockEq.mockResolvedValueOnce({ error: { message: 'Database error' } });

      render(<DeleteModal {...episodeProps} />);

      fireEvent.click(screen.getByText('Delete'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to delete episode');
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });

    it('should show loading state during deletion', async () => {
      // Mock a delay
      mockEq.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ error: null }), 100)
      ));

      render(<DeleteModal {...episodeProps} />);

      fireEvent.click(screen.getByText('Delete'));

      // Check loading state
      await waitFor(() => {
        const deleteButton = screen.getByText('Deleting...');
        expect(deleteButton).toHaveAttribute('data-loading', 'true');
      });
    });
  });

  describe('Podcast deletion', () => {
    const podcastProps = {
      isOpen: true,
      onClose: mockOnClose,
      onSuccess: mockOnSuccess,
      podcastId: 'podcast-123',
    };

    it('should render podcast deletion modal', () => {
      render(<DeleteModal {...podcastProps} />);

      expect(screen.getByTestId('modal')).toBeTruthy();
      expect(screen.getByText('Delete Podcast')).toBeTruthy();
      expect(screen.getByText(/Are you sure you want to delete this podcast/)).toBeTruthy();
    });

    it('should delete podcast successfully', async () => {
      render(<DeleteModal {...podcastProps} />);

      fireEvent.click(screen.getByText('Delete'));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Podcast deleted successfully');
        expect(mockOnSuccess).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Modal visibility', () => {
    it('should not render when closed', () => {
      render(
        <DeleteModal 
          isOpen={false}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          episodeId="episode-123"
        />
      );

      expect(screen.queryByTestId('modal')).toBeFalsy();
    });

    it('should call onClose when modal background is clicked', () => {
      render(
        <DeleteModal 
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          episodeId="episode-123"
        />
      );

      fireEvent.click(screen.getByTestId('modal'));

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('TypeScript type safety', () => {
    it('should handle episode deletion props correctly', () => {
      // This test ensures the discriminated union works
      render(
        <DeleteModal 
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          episodeId="episode-123"
          // podcastId should not be allowed here
        />
      );

      expect(screen.getByText('Delete Episode')).toBeTruthy();
    });

    it('should handle podcast deletion props correctly', () => {
      // This test ensures the discriminated union works
      render(
        <DeleteModal 
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          podcastId="podcast-123"
          // episodeId should not be allowed here
        />
      );

      expect(screen.getByText('Delete Podcast')).toBeTruthy();
    });
  });
});
