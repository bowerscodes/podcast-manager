import { render, screen } from '@testing-library/react';
import EpisodeRow from '../EpisodeRow';

// Mock the episode data
const mockEpisode = {
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
};

describe('EpisodeRow', () => {
  it('should render episode information', () => {
    render(<EpisodeRow episode={mockEpisode} />);

    expect(screen.getAllByText((content, element) => {
      return element?.textContent === '1. Test Episode';
    })[0]).toBeTruthy();
    expect(screen.getByText('Test Description')).toBeTruthy();
  });
});
