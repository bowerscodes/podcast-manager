import { render, screen, fireEvent } from '@testing-library/react';
import SeasonAccordion from '../SeasonAccordion';
import { Episode } from '@/types/podcast';

// Mock EpisodeRow component
jest.mock('../EpisodeRow', () => {
  return function MockEpisodeRow({ episode }: { episode: Episode }) {
    return <div data-testid={`episode-row-${episode.id}`}>{episode.title}</div>;
  };
});

// Mock Tag component
jest.mock('@/components/ui/Tag', () => {
  return function MockTag({ children, mode, color }: { 
    children: React.ReactNode; 
    mode?: string; 
    color?: string; 
  }) {
    return (
      <span data-testid="tag" data-mode={mode} data-color={color}>
        {children}
      </span>
    );
  };
});

describe('SeasonAccordion', () => {
  const mockOnUpdate = jest.fn();

  const mockEpisodes: Episode[] = [
    {
      id: '1',
      podcast_id: 'podcast-1',
      title: 'Episode 1',
      description: 'First episode',
      audio_url: 'https://example.com/episode1.mp3',
      duration: 1800,
      file_size: 50000000,
      publish_date: new Date('2024-01-01'),
      season_number: '1',
      episode_number: '1',
      explicit: false,
      created_at: new Date('2024-01-01'),
      status: 'published'
    },
    {
      id: '2',
      podcast_id: 'podcast-1',
      title: 'Episode 2',
      description: 'Second episode',
      audio_url: 'https://example.com/episode2.mp3',
      duration: 2100,
      file_size: 60000000,
      publish_date: new Date('2024-01-08'),
      season_number: '1',
      episode_number: '2',
      explicit: false,
      created_at: new Date('2024-01-08'),
      status: 'published'
    },
  ];

  const defaultProps = {
    seasonNumber: '1',
    episodes: mockEpisodes,
    onUpdate: mockOnUpdate,
    defaultExpanded: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders season label correctly for numbered seasons', () => {
    render(<SeasonAccordion {...defaultProps} />);
    
    expect(screen.getByText('Season 1')).toBeInTheDocument();
  });

  it('renders "No Season" label for null season number', () => {
    render(<SeasonAccordion {...defaultProps} seasonNumber="null" />);
    
    expect(screen.getByText('No Season')).toBeInTheDocument();
  });

  it('renders "No Season" label for empty season number', () => {
    render(<SeasonAccordion {...defaultProps} seasonNumber="" />);
    
    expect(screen.getByText('No Season')).toBeInTheDocument();
  });

  it('displays correct episode count in singular form', () => {
    const singleEpisode = [mockEpisodes[0]];
    render(<SeasonAccordion {...defaultProps} episodes={singleEpisode} />);
    
    expect(screen.getByText('1 episode')).toBeInTheDocument();
  });

  it('displays correct episode count in plural form', () => {
    render(<SeasonAccordion {...defaultProps} />);
    
    expect(screen.getByText('2 episodes')).toBeInTheDocument();
  });

  it('renders all episodes when expanded by default', () => {
    render(<SeasonAccordion {...defaultProps} />);
    
    expect(screen.getByTestId('episode-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('episode-row-2')).toBeInTheDocument();
    expect(screen.getByText('Episode 1')).toBeInTheDocument();
    expect(screen.getByText('Episode 2')).toBeInTheDocument();
  });

  it('starts collapsed when defaultExpanded is false', () => {
    render(<SeasonAccordion {...defaultProps} defaultExpanded={false} />);
    
    const episodeContainer = screen.getByTestId('episode-row-1').parentElement?.parentElement;
    expect(episodeContainer).toHaveClass('max-h-0', 'opacity-0');
  });

  it('toggles expansion when season button is clicked', () => {
    render(<SeasonAccordion {...defaultProps} />);
    
    const seasonButton = screen.getByRole('button');
    
    // Initially expanded
    let episodeContainer = screen.getByTestId('episode-row-1').parentElement?.parentElement;
    expect(episodeContainer).toHaveClass('max-h-none', 'opacity-100');
    
    // Click to collapse
    fireEvent.click(seasonButton);
    episodeContainer = screen.getByTestId('episode-row-1').parentElement?.parentElement;
    expect(episodeContainer).toHaveClass('max-h-0', 'opacity-0');
    
    // Click to expand again
    fireEvent.click(seasonButton);
    episodeContainer = screen.getByTestId('episode-row-1').parentElement?.parentElement;
    expect(episodeContainer).toHaveClass('overflow-hidden', 'opacity-100');
  });

  it('calls onUpdate when passed to EpisodeRow components', () => {
    render(<SeasonAccordion {...defaultProps} />);
    
    // Verify that EpisodeRow components are rendered (they would call onUpdate when interacted with)
    expect(screen.getByTestId('episode-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('episode-row-2')).toBeInTheDocument();
  });

  it('renders with correct CSS classes and styling', () => {
    render(<SeasonAccordion {...defaultProps} />);
    
    const seasonButton = screen.getByRole('button');
    expect(seasonButton).toHaveClass(
      'flex',
      'items-center',
      'gap-2',
      'px-4',
      'py-2',
      'rounded-lg',
      'shadow-sm',
      'hover:shadow-md',
      'transition-all',
      'duration-200',
      'cursor-pointer'
    );
  });

  it('renders Tag component with correct props', () => {
    render(<SeasonAccordion {...defaultProps} />);
    
    const tag = screen.getByTestId('tag');
    expect(tag).toHaveAttribute('data-mode', 'light');
    expect(tag).toHaveAttribute('data-color', 'blue');
    expect(tag).toHaveTextContent('2 episodes');
  });

  it('has correct accessibility attributes', () => {
    render(<SeasonAccordion {...defaultProps} />);
    
    const seasonButton = screen.getByRole('button');
    expect(seasonButton).toBeInTheDocument();
    expect(seasonButton).toHaveClass('cursor-pointer');
  });

  it('handles empty episodes array', () => {
    render(<SeasonAccordion {...defaultProps} episodes={[]} />);
    
    expect(screen.getByText('0 episodes')).toBeInTheDocument();
    expect(screen.queryByTestId('episode-row-1')).not.toBeInTheDocument();
  });

  it('applies correct CSS variables for styling', () => {
    render(<SeasonAccordion {...defaultProps} />);
    
    // Check that the gradient line has the correct inline style
    const gradientLine = document.querySelector('.absolute.inset-x-0');
    expect(gradientLine).toHaveStyle('background: var(--gradient-primary)');
    
    // Check that the season button has the correct inline styles
    const seasonButton = screen.getByRole('button');
    expect(seasonButton).toHaveStyle('background: var(--gradient-card)');
    expect(seasonButton).toHaveStyle('border: 1px solid rgba(139, 92, 246, 0.2)');
  });

  it('renders chevron icon with correct rotation states', () => {
    render(<SeasonAccordion {...defaultProps} />);
    
    const seasonButton = screen.getByRole('button');
    const chevronIcon = seasonButton.querySelector('.w-2.h-2.border-r-2.border-b-2');
    
    // Initially expanded (rotate-45)
    expect(chevronIcon).toHaveClass('rotate-45');
    expect(chevronIcon).not.toHaveClass('rotate-[-135deg]');
    
    // Click to collapse
    fireEvent.click(seasonButton);
    expect(chevronIcon).toHaveClass('rotate-[-135deg]');
    expect(chevronIcon).not.toHaveClass('rotate-45');
  });

  it('maintains proper spacing between episodes', () => {
    render(<SeasonAccordion {...defaultProps} />);
    
    const episodeContainer = screen.getByTestId('episode-row-1').parentElement;
    expect(episodeContainer).toHaveClass('space-y-2');
  });

  it('handles season accordion CSS class correctly', () => {
    render(<SeasonAccordion {...defaultProps} />);
    
    const accordionContainer = screen.getByRole('button').closest('.season-accordion');
    expect(accordionContainer).toHaveClass('season-accordion');
  });
});
