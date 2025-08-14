import { render, screen } from '@testing-library/react';
import EpisodeRow from '../../podcasts/episodes/EpisodeRow';
import { Episode } from '@/types/podcast';

// Mock the modals
jest.mock('@/components/modals/EpisodeModal', () => {
  return function MockEpisodeModal() {
    return <div data-testid="episode-modal">Episode Modal</div>;
  };
});

jest.mock('@/components/modals/DeleteModal', () => {
  return function MockDeleteModal() {
    return <div data-testid="delete-modal">Delete Modal</div>;
  };
});

// Mock HeroUI components
jest.mock('@heroui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
  CardBody: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
}));

jest.mock('@heroui/button', () => ({
  Button: ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => (
    <button onClick={onPress}>{children}</button>
  ),
}));

// Mock react-icons
jest.mock('react-icons/ai', () => ({
  AiOutlineEdit: () => <span data-testid="edit-icon">✏️</span>,
}));

jest.mock('react-icons/md', () => ({
  MdDeleteForever: () => <span data-testid="delete-icon">🗑️</span>,
}));

describe('EpisodeRow', () => {
  const mockOnUpdate = jest.fn();

  const mockEpisode: Episode = {
    id: '1',
    title: 'Test Episode',
    description: 'Test Description',
    audio_url: 'https://example.com/audio.mp3',
    duration: 125, // 2m 5s
    file_size: 1073741824, // 1GB
    episode_number: '5',
    season_number: '1',
    created_at: new Date('2023-01-01T00:00:00.000Z'),
    podcast_id: 'podcast-1',
    publish_date: new Date('2023-01-01T00:00:00.000Z'),
    explicit: false
  };

  const defaultProps = {
    episode: mockEpisode,
    onUpdate: mockOnUpdate,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render episode with correct data', () => {
    render(<EpisodeRow {...defaultProps} />);

    expect(screen.getByText('5. Test Episode')).toBeTruthy();
    expect(screen.getByText('Test Description')).toBeTruthy();
  });

  it('should render episode number and title', () => {
    render(<EpisodeRow {...defaultProps} />);

    const heading = screen.getByRole('heading');
    expect(heading).toHaveTextContent('5. Test Episode');
  });

  it('should render episode description', () => {
    render(<EpisodeRow {...defaultProps} />);

    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should handle different episode numbers', () => {
    const episodeWithDifferentNumber = {
      ...mockEpisode,
      episode_number: '10',
      title: 'Episode Ten'
    };

    render(<EpisodeRow episode={episodeWithDifferentNumber} onUpdate={mockOnUpdate} />);

    expect(screen.getByText('10. Episode Ten')).toBeTruthy();
  });

  it('should handle long descriptions', () => {
    const episodeWithLongDescription = {
      ...mockEpisode,
      description: 'This is a very long description that should still be displayed properly in the episode row component'
    };

    render(<EpisodeRow episode={episodeWithLongDescription} onUpdate={mockOnUpdate} />);

    expect(screen.getByText('This is a very long description that should still be displayed properly in the episode row component')).toBeTruthy();
  });

  it('should have proper card structure', () => {
    const { container } = render(<EpisodeRow {...defaultProps} />);

    // Look for the actual classes used in the component
    const card = container.querySelector('.flex.flex-col.mb-3');
    expect(card).toBeTruthy();
  });
});
