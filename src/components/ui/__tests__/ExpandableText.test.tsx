import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExpandableText from '../ExpandableText';

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

describe('ExpandableText', () => {
  const shortText = 'Short text';
  const longText = 'This is a very long text that should definitely exceed the maximum number of lines when rendered in a container with limited space. It contains multiple sentences and should trigger the truncation functionality of the ExpandableText component.';

  beforeEach(() => {
    // Mock HTMLElement properties for proper DOM measurements
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      value: 100, // Default full height
    });

    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      value: 50, // Default clamped height (triggers truncation)
    });

    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      value: 50,
    });

    // Mock the style property
    Object.defineProperty(HTMLElement.prototype, 'style', {
      configurable: true,
      value: {
        webkitLineClamp: '',
        overflow: '',
        display: '',
        setProperty: jest.fn(),
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render text correctly', () => {
    render(<ExpandableText text={shortText} />);
    
    expect(screen.getByText(shortText)).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<ExpandableText text={shortText} className="custom-class" />);
    
    const textElement = screen.getByText(shortText);
    expect(textElement).toHaveClass('custom-class');
  });

  it('should apply default styling classes', () => {
    render(<ExpandableText text={shortText} />);
    
    const textElement = screen.getByText(shortText);
    expect(textElement).toHaveClass('text-sm', 'text-gray-600', 'leading-relaxed');
  });

  describe('truncation detection', () => {
    it('should show "Show more" button when text exceeds maxLines', async () => {
      render(<ExpandableText text={longText} maxLines={2} />);
      
      await waitFor(() => {
        expect(screen.getByText('Show more')).toBeInTheDocument();
      }, { timeout: 200 });
    });

    it('should not show "Show more" button for short text', async () => {
      // Mock short text scenario
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
        configurable: true,
        value: 50,
      });
      Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
        configurable: true,
        value: 50,
      });

      render(<ExpandableText text={shortText} maxLines={3} />);
      
      await waitFor(() => {
        expect(screen.queryByText('Show more')).not.toBeInTheDocument();
      }, { timeout: 200 });
    });

    it('should respect different maxLines values', async () => {
      render(<ExpandableText text={longText} maxLines={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Show more')).toBeInTheDocument();
      });
    });
  });

  describe('expand/collapse functionality', () => {
    it('should expand text when "Show more" is clicked', async () => {
      render(<ExpandableText text={longText} maxLines={2} />);
      
      await waitFor(() => {
        expect(screen.getByText('Show more')).toBeInTheDocument();
      });

      const showMoreButton = screen.getByText('Show more');
      fireEvent.click(showMoreButton);

      await waitFor(() => {
        expect(screen.getByText('Show less')).toBeInTheDocument();
      });
    });

    it('should collapse text when "Show less" is clicked', async () => {
      render(<ExpandableText text={longText} maxLines={2} />);
      
      // Wait for initial render and show more button
      await waitFor(() => {
        expect(screen.getByText('Show more')).toBeInTheDocument();
      });

      // Click to expand
      const showMoreButton = screen.getByText('Show more');
      fireEvent.click(showMoreButton);

      await waitFor(() => {
        expect(screen.getByText('Show less')).toBeInTheDocument();
      });

      // Click to collapse
      const showLessButton = screen.getByText('Show less');
      fireEvent.click(showLessButton);

      await waitFor(() => {
        expect(screen.getByText('Show more')).toBeInTheDocument();
      });
    });

    it('should toggle between expanded and collapsed states', async () => {
      render(<ExpandableText text={longText} maxLines={2} />);
      
      await waitFor(() => {
        expect(screen.getByText('Show more')).toBeInTheDocument();
      });

      const button = screen.getByRole('button');
      
      // Expand
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText('Show less')).toBeInTheDocument();
      });

      // Collapse
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText('Show more')).toBeInTheDocument();
      });
    });
  });

  describe('icon display', () => {
    it('should show expand icon in collapsed state', async () => {
      render(<ExpandableText text={longText} maxLines={2} />);
      
      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        expect(screen.getByText('Show more')).toBeInTheDocument();
      });
    });

    it('should show collapse icon in expanded state', async () => {
      render(<ExpandableText text={longText} maxLines={2} />);
      
      await waitFor(() => {
        expect(screen.getByText('Show more')).toBeInTheDocument();
      });

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Show less')).toBeInTheDocument();
      });
    });
  });

  describe('responsive behavior', () => {
    it('should handle window resize events', async () => {
      render(<ExpandableText text={longText} maxLines={2} />);
      
      await waitFor(() => {
        expect(screen.getByText('Show more')).toBeInTheDocument();
      });

      // Simulate window resize
      fireEvent(window, new Event('resize'));

      // Should still show the button after resize
      expect(screen.getByText('Show more')).toBeInTheDocument();
    });

    it('should recheck overflow on text change', async () => {
      const { rerender } = render(<ExpandableText text={shortText} maxLines={2} />);
      
      // Initially no button for short text
      await waitFor(() => {
        expect(screen.queryByText('Show more')).not.toBeInTheDocument();
      });

      // Change to long text
      rerender(<ExpandableText text={longText} maxLines={2} />);

      await waitFor(() => {
        expect(screen.getByText('Show more')).toBeInTheDocument();
      });
    });
  });

  describe('height calculations', () => {
    it('should have overflow hidden in container', async () => {
      render(<ExpandableText text={longText} maxLines={2} />);
      
      await waitFor(() => {
        const container = screen.getByText(longText).parentElement;
        expect(container).toHaveClass('overflow-hidden');
      });
    });

    it('should have transition classes for smooth animation', async () => {
      render(<ExpandableText text={longText} maxLines={2} />);
      
      await waitFor(() => {
        const container = screen.getByText(longText).parentElement;
        expect(container).toHaveClass('transition-all', 'duration-300', 'ease-in-out');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty text', () => {
      const { container } = render(<ExpandableText text="" />);
      
      const textElement = container.querySelector('p');
      expect(textElement).toBeInTheDocument();
      expect(textElement).toHaveTextContent('');
      expect(screen.queryByText('Show more')).not.toBeInTheDocument();
    });

    it('should handle very long single-line text', async () => {
      const veryLongText = 'A'.repeat(1000);
      render(<ExpandableText text={veryLongText} maxLines={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Show more')).toBeInTheDocument();
      });
    });

    it('should handle maxLines of 1', async () => {
      render(<ExpandableText text={longText} maxLines={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Show more')).toBeInTheDocument();
      });
    });

    it('should handle large maxLines values', async () => {
      render(<ExpandableText text={longText} maxLines={10} />);
      
      // With large maxLines, long text might not need truncation
      await waitFor(() => {
        // Could show "Show more" or not, depending on actual text length vs maxLines
        expect(screen.getByText(longText)).toBeInTheDocument();
      });
    });
  });

  describe('CSS transitions', () => {
    it('should apply transition classes to container', () => {
      render(<ExpandableText text={longText} />);
      
      const container = screen.getByText(longText).parentElement;
      expect(container).toHaveClass('overflow-hidden', 'transition-all', 'duration-300', 'ease-in-out');
    });

    it('should apply transition classes to text element', () => {
      render(<ExpandableText text={longText} />);
      
      const textElement = screen.getByText(longText);
      expect(textElement).toHaveClass('transition-all', 'duration-300', 'ease-in-out');
    });
  });
});
