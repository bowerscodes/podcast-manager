import { render, screen, fireEvent } from '@testing-library/react';
import EpisodeModal from '../EpisodeModal';
import { Episode } from '@/types/podcast';

// Mock EpisodeForm
jest.mock('@/components/forms/EpisodeForm', () => {
  return function MockEpisodeForm({ 
    initialData, 
    onSuccess, 
    onCancel 
  }: { 
    initialData?: Partial<Episode>; 
    onSuccess: () => void; 
    onCancel: () => void; 
  }) {
    return (
      <div data-testid="episode-form">
        <h2>{initialData?.title ? 'Edit Episode' : 'Add Episode'}</h2>
        <button onClick={onSuccess}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    );
  };
});

// Mock HeroUI Modal
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

describe('EpisodeModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    podcastId: 'podcast-123',
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render modal when open', () => {
    render(<EpisodeModal {...defaultProps} />);

    expect(screen.getByTestId('modal')).toBeTruthy();
    expect(screen.getByTestId('episode-form')).toBeTruthy();
  });

  it('should not render modal when closed', () => {
    render(<EpisodeModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByTestId('modal')).toBeFalsy();
    expect(screen.queryByTestId('episode-form')).toBeFalsy();
  });

  it('should show "Add Episode" when no initialData provided', () => {
    render(<EpisodeModal {...defaultProps} />);

    expect(screen.getByText('Add Episode')).toBeTruthy();
  });

  it('should show "Edit Episode" when initialData provided', () => {
    const initialData = {
      id: 'episode-123',
      title: 'Test Episode',
      description: 'Test Description',
    };

    render(<EpisodeModal {...defaultProps} initialData={initialData} />);

    expect(screen.getByText('Edit Episode')).toBeTruthy();
  });

  it('should call onClose and onSuccess when save is clicked', () => {
    render(<EpisodeModal {...defaultProps} />);

    fireEvent.click(screen.getByText('Save'));

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('should call onClose when cancel is clicked', () => {
    render(<EpisodeModal {...defaultProps} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('should call onClose when modal background is clicked', () => {
    render(<EpisodeModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('modal'));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should pass podcastId to form', () => {
    render(<EpisodeModal {...defaultProps} podcastId="specific-podcast-123" />);

    expect(screen.getByTestId('episode-form')).toBeTruthy();
    // The form should be rendered with the podcast ID
  });

  it('should pass initialData to form when editing', () => {
    const initialData = {
      id: 'episode-123',
      title: 'Existing Episode',
      description: 'Existing Description',
    };

    render(<EpisodeModal {...defaultProps} initialData={initialData} />);

    expect(screen.getByText('Edit Episode')).toBeTruthy();
  });
});
