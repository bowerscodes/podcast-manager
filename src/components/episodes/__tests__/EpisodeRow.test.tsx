import { render, screen } from '@testing-library/react';
import EpisodeRow from '../../podcasts/episodes/EpisodeRow';
import { Episode } from '@/types/podcast';

describe('EpisodeRow', () => {
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
  };

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

    render(<EpisodeRow episode={episodeWithDifferentNumber} />);

    expect(screen.getByText('10. Episode Ten')).toBeTruthy();
  });

  it('should handle long descriptions', () => {
    const episodeWithLongDescription = {
      ...mockEpisode,
      description: 'This is a very long description that should still be displayed properly in the episode row component'
    };

    render(<EpisodeRow episode={episodeWithLongDescription} />);

    expect(screen.getByText('This is a very long description that should still be displayed properly in the episode row component')).toBeTruthy();
  });

  it('should have proper card structure', () => {
    const { container } = render(<EpisodeRow {...defaultProps} />);

    const card = container.querySelector('[class*="relative"][class*="overflow-hidden"]');
    expect(card).toBeTruthy();
  });
});
