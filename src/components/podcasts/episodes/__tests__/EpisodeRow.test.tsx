import { render, screen, fireEvent } from '@testing-library/react';
import EpisodeRow from '../EpisodeRow';
import { Episode } from '@/types/podcast';

// Mock the modals
jest.mock('@/components/modals/EpisodeModal', () => {
  return function MockEpisodeModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
    return isOpen ? (
      <div data-testid="episode-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={() => { onSuccess(); onClose(); }}>Save Episode</button>
      </div>
    ) : null;
  };
});

jest.mock('@/components/modals/DeleteModal', () => {
  return function MockDeleteModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
    return isOpen ? (
      <div data-testid="delete-modal">
        <button onClick={onClose}>Cancel</button>
        <button onClick={() => { onSuccess(); onClose(); }}>Confirm Delete</button>
      </div>
    ) : null;
  };
});

// Mock HeroUI components
jest.mock('@heroui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
  CardBody: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
}));

jest.mock('@heroui/button', () => ({
  Button: ({ children, onPress, className, color, size }: { 
    children: React.ReactNode; 
    onPress?: () => void; 
    className?: string; 
    color?: string; 
    size?: string;
  }) => (
    <button 
      onClick={onPress} 
      className={`${className} ${color} ${size}`}
      data-color={color}
      data-size={size}
    >
      {children}
    </button>
  ),
}));

// Mock react-icons
jest.mock('react-icons/ai', () => ({
  AiOutlineEdit: () => <span data-testid="edit-icon">✏️</span>,
}));

jest.mock('react-icons/md', () => ({
  MdDeleteForever: () => <span data-testid="delete-icon">🗑️</span>,
}));

// Mock ExpandableText component
jest.mock('@/components/ui/ExpandableText', () => {
  return function MockExpandableText({ text }: { text: string }) {
    return <div data-testid="expandable-text">{text}</div>;
  };
});

// Mock Tag component
jest.mock('@/components/ui/Tag', () => {
  return function MockTag({ children, explicit, className }: { children?: React.ReactNode; explicit?: boolean; className?: string }) {
    // If explicit prop is true, render explicit tag
    if (explicit) {
      return <span data-testid="explicit-tag">EXPLICIT</span>;
    }
    // Otherwise render children (for date tags)
    if (children) {
      return <span className={className}>{children}</span>;
    }
    return null;
  };
});

// Mock date formatting utility
jest.mock('@/lib/date-utils', () => ({
  formatDate: (date: Date) => date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }),
}));

// Mock the episode data
const mockEpisode: Episode = {
  id: '1',
  title: 'Test Episode',
  description: 'Test Description',
  audio_url: 'https://example.com/audio.mp3',
  duration: 1800,
  publish_date: new Date('2023-01-01'),
  season_number: '1',
  episode_number: '1',
  explicit: false,
  created_at: new Date('2023-01-01'),
  podcast_id: 'podcast-1',
  status: 'published'
};

describe('EpisodeRow', () => {
  const mockOnUpdate = jest.fn();

  const defaultProps = {
    episode: mockEpisode,
    onUpdate: mockOnUpdate,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render episode information', () => {
    render(<EpisodeRow {...defaultProps} />);

    expect(screen.getByText('1. Test Episode')).toBeTruthy();
    expect(screen.getByText('Test Description')).toBeTruthy();
  });

  it('should render episode number and title in header', () => {
    render(<EpisodeRow {...defaultProps} />);

    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('1. Test Episode');
  });

  it('should render episode description in body', () => {
    render(<EpisodeRow {...defaultProps} />);

    expect(screen.getByText('Test Description')).toBeTruthy();
  });

  it('should render edit and delete buttons with icons', () => {
    render(<EpisodeRow {...defaultProps} />);

    const editIcon = screen.getByTestId('edit-icon');
    const deleteIcon = screen.getByTestId('delete-icon');
    const editButton = editIcon.closest('button');
    const deleteButton = deleteIcon.closest('button');

    expect(editButton).toBeTruthy();
    expect(deleteButton).toBeTruthy();
    expect(editButton).toHaveAttribute('data-color', 'primary');
    expect(deleteButton).toHaveAttribute('data-color', 'danger');
  });

  it('should open edit modal when edit button is clicked', () => {
    render(<EpisodeRow {...defaultProps} />);

    const editIcon = screen.getByTestId('edit-icon');
    const editButton = editIcon.closest('button');
    fireEvent.click(editButton!);

    expect(screen.getByTestId('episode-modal')).toBeTruthy();
  });

  it('should open delete modal when delete button is clicked', () => {
    render(<EpisodeRow {...defaultProps} />);

    const deleteIcon = screen.getByTestId('delete-icon');
    const deleteButton = deleteIcon.closest('button');
    fireEvent.click(deleteButton!);

    expect(screen.getByTestId('delete-modal')).toBeTruthy();
  });

  it('should close edit modal when close button is clicked', () => {
    render(<EpisodeRow {...defaultProps} />);

    // Open modal
    const editIcon = screen.getByTestId('edit-icon');
    const editButton = editIcon.closest('button');
    fireEvent.click(editButton!);
    expect(screen.getByTestId('episode-modal')).toBeTruthy();

    // Close modal
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('episode-modal')).toBeFalsy();
  });

  it('should close delete modal when cancel button is clicked', () => {
    render(<EpisodeRow {...defaultProps} />);

    // Open modal
    const deleteIcon = screen.getByTestId('delete-icon');
    const deleteButton = deleteIcon.closest('button');
    fireEvent.click(deleteButton!);
    expect(screen.getByTestId('delete-modal')).toBeTruthy();

    // Close modal
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByTestId('delete-modal')).toBeFalsy();
  });

  it('should call onUpdate when episode is saved', () => {
    render(<EpisodeRow {...defaultProps} />);

    // Open edit modal
    const editIcon = screen.getByTestId('edit-icon');
    const editButton = editIcon.closest('button');
    fireEvent.click(editButton!);

    // Save episode
    fireEvent.click(screen.getByText('Save Episode'));

    expect(mockOnUpdate).toHaveBeenCalled();
    expect(screen.queryByTestId('episode-modal')).toBeFalsy();
  });

  it('should call onUpdate when episode is deleted', () => {
    render(<EpisodeRow {...defaultProps} />);

    // Open delete modal
    const deleteIcon = screen.getByTestId('delete-icon');
    const deleteButton = deleteIcon.closest('button');
    fireEvent.click(deleteButton!);

    // Confirm delete
    fireEvent.click(screen.getByText('Confirm Delete'));

    expect(mockOnUpdate).toHaveBeenCalled();
    expect(screen.queryByTestId('delete-modal')).toBeFalsy();
  });

  it('should apply correct styling classes to buttons', () => {
    render(<EpisodeRow {...defaultProps} />);

    const editIcon = screen.getByTestId('edit-icon');
    const deleteIcon = screen.getByTestId('delete-icon');
    const editButton = editIcon.closest('button');
    const deleteButton = deleteIcon.closest('button');

    expect(editButton?.className).toContain('aspect-square');
    expect(deleteButton?.className).toContain('aspect-square');
    expect(editButton?.className).toContain('px-1');
    expect(deleteButton?.className).toContain('px-1');
  });

  it('should display formatted creation date', () => {
    render(<EpisodeRow {...defaultProps} />);

    const formattedDate = mockEpisode.created_at.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    
    expect(screen.getByText(formattedDate)).toBeTruthy();
  });

  it('should display "DRAFT" tag for draft episodes instead of date', () => {
    const draftEpisode = { ...mockEpisode, status: 'draft' as const };
    render(<EpisodeRow episode={draftEpisode} onUpdate={mockOnUpdate} />);

    expect(screen.getByText('DRAFT')).toBeTruthy();
    
    // Should not show the formatted date for draft episodes
    const formattedDate = mockEpisode.created_at.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    expect(screen.queryByText(formattedDate)).toBeFalsy();
  });

  it('should display formatted date for published episodes', () => {
    const publishedEpisode = { ...mockEpisode, status: 'published' as const };
    render(<EpisodeRow episode={publishedEpisode} onUpdate={mockOnUpdate} />);

    const formattedDate = mockEpisode.created_at.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    
    expect(screen.getByText(formattedDate)).toBeTruthy();
    expect(screen.queryByText('DRAFT')).toBeFalsy();
  });

  it('should show ExplicitTag when episode is explicit', () => {
    const explicitEpisode = { ...mockEpisode, explicit: true };
    render(<EpisodeRow episode={explicitEpisode} onUpdate={mockOnUpdate} />);

    expect(screen.getByTestId('explicit-tag')).toBeTruthy();
    expect(screen.getByText('EXPLICIT')).toBeTruthy();
  });

  it('should not show ExplicitTag when episode is not explicit', () => {
    const nonExplicitEpisode = { ...mockEpisode, explicit: false };
    render(<EpisodeRow episode={nonExplicitEpisode} onUpdate={mockOnUpdate} />);

    expect(screen.queryByTestId('explicit-tag')).toBeFalsy();
    expect(screen.queryByText('EXPLICIT')).toBeFalsy();
  });

  it('should render ExpandableText component for description', () => {
    render(<EpisodeRow {...defaultProps} />);

    expect(screen.getByTestId('expandable-text')).toBeTruthy();
    expect(screen.getByTestId('expandable-text')).toHaveTextContent('Test Description');
  });

  it('should display episode information in header layout', () => {
    render(<EpisodeRow {...defaultProps} />);

    // Check that title, date, and ExplicitTag are all in the header area
    const heading = screen.getByRole('heading', { level: 3 });
    const formattedDate = mockEpisode.created_at.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    
    expect(heading).toHaveTextContent('1. Test Episode');
    expect(screen.getByText(formattedDate)).toBeTruthy();
    
    // ExplicitTag should not be present for non-explicit content
    expect(screen.queryByTestId('explicit-tag')).toBeFalsy();
  });
});
