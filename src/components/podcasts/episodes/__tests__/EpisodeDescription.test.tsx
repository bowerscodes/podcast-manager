import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import EpisodeDescription from '../EpisodeDescription';

// Mock react-icons
jest.mock('react-icons/md', () => ({
  MdExpandMore: ({ size, className }: { size: number; className?: string }) => (
    <span data-testid="expand-more-icon" className={className} style={{ fontSize: size }}>
      ▼
    </span>
  ),
  MdExpandLess: ({ size, className }: { size: number; className?: string }) => (
    <span data-testid="expand-less-icon" className={className} style={{ fontSize: size }}>
      ▲
    </span>
  ),
}));

// Mock HeroUI Button
jest.mock('@heroui/button', () => ({
  Button: ({ children, onPress, className, ...props }: { 
    children: React.ReactNode; 
    onPress?: () => void; 
    className?: string;
    [key: string]: unknown;
  }) => (
    <button onClick={onPress} className={className} {...props}>
      {children}
    </button>
  ),
}));

describe('EpisodeDescription', () => {
  // Mock DOM element properties at a global level
  let originalScrollHeight: PropertyDescriptor | undefined;
  let originalClientHeight: PropertyDescriptor | undefined;

  beforeAll(() => {
    // Store original descriptors
    originalScrollHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight');
    originalClientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');
  });

  afterAll(() => {
    // Restore original descriptors
    if (originalScrollHeight) {
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', originalScrollHeight);
    }
    if (originalClientHeight) {
      Object.defineProperty(HTMLElement.prototype, 'clientHeight', originalClientHeight);
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const mockElementDimensions = (scrollHeight: number, clientHeight: number) => {
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get() {
        return scrollHeight;
      }
    });

    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      get() {
        return clientHeight;
      }
    });
  };

  it('should render short description without show more button', async () => {
    const shortDescription = 'This is a short description.';
    
    // Mock dimensions for short text (no truncation needed)
    mockElementDimensions(25, 25);

    render(<EpisodeDescription description={shortDescription} />);

    // Fast-forward the timer
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(screen.getByText(shortDescription)).toBeInTheDocument();
    expect(screen.queryByText('Show more')).not.toBeInTheDocument();
  });

  it('should render long description with show more button', async () => {
    const longDescription = 'This is a very long description that should be truncated.';
    
    // Mock dimensions for long text (truncation needed)
    mockElementDimensions(100, 25);

    render(<EpisodeDescription description={longDescription} />);

    // Fast-forward the timer to trigger useEffect
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(screen.getByText(longDescription)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Show more')).toBeInTheDocument();
    });
  });

  it('should expand description when show more is clicked', async () => {
    const longDescription = 'This is a very long description that should be truncated.';
    
    mockElementDimensions(100, 25);

    render(<EpisodeDescription description={longDescription} />);

    act(() => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(screen.getByText('Show more')).toBeInTheDocument();
    });

    const showMoreButton = screen.getByText('Show more');
    fireEvent.click(showMoreButton);

    await waitFor(() => {
      expect(screen.getByText('Show less')).toBeInTheDocument();
    });
  });

  it('should collapse description when show less is clicked', async () => {
    const longDescription = 'This is a very long description that should be truncated.';
    
    mockElementDimensions(100, 25);

    render(<EpisodeDescription description={longDescription} />);

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Wait for show more button and click it
    await waitFor(() => {
      expect(screen.getByText('Show more')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Show more'));

    await waitFor(() => {
      expect(screen.getByText('Show less')).toBeInTheDocument();
    });

    // Click show less
    fireEvent.click(screen.getByText('Show less'));

    await waitFor(() => {
      expect(screen.getByText('Show more')).toBeInTheDocument();
    });
  });

  it('should display correct icons for expand/collapse states', async () => {
    const longDescription = 'This is a very long description that should be truncated.';
    
    mockElementDimensions(100, 25);

    render(<EpisodeDescription description={longDescription} />);

    act(() => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(screen.getByTestId('expand-more-icon')).toBeInTheDocument();
    });

    // Click to expand
    fireEvent.click(screen.getByText('Show more'));

    await waitFor(() => {
      expect(screen.getByTestId('expand-less-icon')).toBeInTheDocument();
    });
  });

  it('should handle window resize events', async () => {
    const longDescription = 'This is a very long description.';
    
    mockElementDimensions(50, 50);

    render(<EpisodeDescription description={longDescription} />);

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Simulate window resize
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });

  it('should apply correct CSS classes for animations', async () => {
    const description = 'Test description';
    
    mockElementDimensions(25, 25);

    render(<EpisodeDescription description={description} />);

    const container = screen.getByText(description).parentElement;
    expect(container).toHaveClass('overflow-hidden', 'transition-all', 'duration-300', 'ease-in-out');

    const textElement = screen.getByText(description);
    expect(textElement).toHaveClass('text-sm', 'text-gray-600', 'leading-relaxed', 'transition-all', 'duration-300', 'ease-in-out');
  });

  it('should handle empty description gracefully', async () => {
    const emptyDescription = '';
    
    mockElementDimensions(0, 0);

    render(<EpisodeDescription description={emptyDescription} />);

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(screen.queryByText('Show more')).not.toBeInTheDocument();
  });

  it('should set correct maxHeight styles for animation', async () => {
    const longDescription = 'This is a very long description.';
    
    mockElementDimensions(100, 25);

    render(<EpisodeDescription description={longDescription} />);

    act(() => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      const container = screen.getByText(longDescription).parentElement;
      expect(container).toHaveStyle('max-height: 30px'); // collapsedHeight (25) + 5
    });

    // Expand the description
    await waitFor(() => {
      expect(screen.getByText('Show more')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Show more'));

    await waitFor(() => {
      const container = screen.getByText(longDescription).parentElement;
      expect(container).toHaveStyle('max-height: 110px'); // fullHeight (100) + 10
    });
  });
});
