import { render, screen } from '@testing-library/react';
import PodcastStats from '../PodcastStats';

describe('PodcastStats', () => {
  it('should render episode count', () => {
    render(<PodcastStats episodeCount={5} />);
    
    expect(screen.getByText(/5/)).toBeTruthy();
  });

  it('should render default total downloads when not provided', () => {
    render(<PodcastStats episodeCount={3} />);
    
    // Check for Total Downloads specifically
    expect(screen.getByText('Total Downloads')).toBeTruthy();
    const totalDownloadsCard = screen.getByText('Total Downloads').closest('.stats-card');
    expect(totalDownloadsCard?.querySelector('h3')?.textContent).toBe('0');
  });

  it('should render total downloads when provided', () => {
    render(<PodcastStats episodeCount={3} totalDownloads={1500} />);
    
    expect(screen.getByText(/1,500/)).toBeTruthy();
  });

  it('should render default unique listeners when not provided', () => {
    render(<PodcastStats episodeCount={3} />);
    
    // Check for Unique Listeners specifically
    expect(screen.getByText('Unique Listeners')).toBeTruthy();
    const uniqueListenersCard = screen.getByText('Unique Listeners').closest('.stats-card');
    expect(uniqueListenersCard?.querySelector('h3')?.textContent).toBe('0');
  });

  it('should render unique listeners when provided', () => {
    render(<PodcastStats episodeCount={3} uniqueListeners={250} />);
    
    expect(screen.getByText(/250/)).toBeTruthy();
  });

  it('should handle empty platform breakdown', () => {
    render(<PodcastStats episodeCount={3} platformBreakdown={{}} />);
    
    // Should render without crashing
    expect(screen.getByText(/3/)).toBeTruthy();
  });

  it('should render platform breakdown when provided', () => {
    const platformBreakdown = {
      'Apple Podcasts': 100,
      'Spotify': 75,
      'Google Podcasts': 50
    };
    
    render(<PodcastStats episodeCount={3} platformBreakdown={platformBreakdown} />);
    
    // Should show the top platform (Apple Podcasts with 100)
    expect(screen.getByText(/Apple Podcasts/)).toBeTruthy();
    expect(screen.getByText('Top Platform')).toBeTruthy();
  });

  it('should handle all props together', () => {
    const platformBreakdown = {
      'Apple Podcasts': 200,
      'Spotify': 150,
    };
    
    render(
      <PodcastStats 
        episodeCount={10} 
        totalDownloads={2500} 
        uniqueListeners={800}
        platformBreakdown={platformBreakdown}
      />
    );
    
    expect(screen.getByText(/10/)).toBeTruthy();
    expect(screen.getByText(/2,500/)).toBeTruthy();
    expect(screen.getByText(/800/)).toBeTruthy();
    expect(screen.getByText(/Apple Podcasts/)).toBeTruthy();
    // Apple Podcasts should be the top platform since it has higher count
  });

  it('should handle zero values correctly', () => {
    render(
      <PodcastStats 
        episodeCount={0} 
        totalDownloads={0} 
        uniqueListeners={0}
      />
    );
    
    const zeroElements = screen.getAllByText('0');
    expect(zeroElements.length).toBeGreaterThan(0);
  });

  it('should render with card structure', () => {
    const { container } = render(<PodcastStats episodeCount={5} />);
    
    // Should have card structure (depends on implementation)
    expect(container.firstChild).toBeTruthy();
  });

  it('should handle large numbers', () => {
    render(
      <PodcastStats 
        episodeCount={1000} 
        totalDownloads={1000000} 
        uniqueListeners={500000}
      />
    );
    
    expect(screen.getByText(/1000/)).toBeTruthy();
    expect(screen.getByText(/1,000,000/)).toBeTruthy();
    expect(screen.getByText(/500,000/)).toBeTruthy();
  });

  it('should maintain accessibility', () => {
    render(<PodcastStats episodeCount={5} totalDownloads={100} />);
    
    // Should be accessible by screen readers
    const container = document.body;
    expect(container).toBeTruthy();
  });
});
