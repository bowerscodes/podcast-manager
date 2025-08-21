import { render, screen, fireEvent } from '@testing-library/react';
import ActionCard from '../ActionCard';

// Mock Next.js router
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock HeroUI components
jest.mock('@heroui/card', () => ({
  Card: ({ children, className, isPressable, onPress, ...props }: { 
    children: React.ReactNode; 
    className?: string; 
    isPressable?: boolean; 
    onPress?: () => void; 
    disableRipple?: boolean;
    [key: string]: unknown 
  }) => {
    // Filter out HeroUI-specific props
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { disableRipple, ...domProps } = props;
    return (
      <div 
        className={className} 
        onClick={isPressable ? onPress : undefined}
        role={isPressable ? "button" : undefined}
        tabIndex={isPressable ? 0 : undefined}
        {...domProps}
      >
        {children}
      </div>
    );
  },
  CardHeader: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
  CardBody: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
  CardFooter: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
}));

describe('ActionCard', () => {
  const defaultProps = {
    header: <h3>Test Header</h3>,
    body: <p>Test Body</p>,
    footer: <span>Test Footer</span>,
    href: '/test-path'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all content sections', () => {
    render(<ActionCard {...defaultProps} />);

    expect(screen.getByText('Test Header')).toBeTruthy();
    expect(screen.getByText('Test Body')).toBeTruthy();
    expect(screen.getByText('Test Footer')).toBeTruthy();
  });

  it('should navigate when clicked', () => {
    render(<ActionCard {...defaultProps} />);

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(mockPush).toHaveBeenCalledWith('/test-path');
  });

  it('should apply correct CSS classes', () => {
    render(<ActionCard {...defaultProps} />);

    const card = screen.getByRole('button');
    expect(card.className).toContain('action-card');
    expect(card.className).toContain('group');
  });

  it('should handle missing content gracefully', () => {
    render(<ActionCard href="/test" />);

    const card = screen.getByRole('button');
    expect(card).toBeTruthy();
  });

  it('should handle navigation with different hrefs', () => {
    const { rerender } = render(<ActionCard {...defaultProps} href="/first" />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockPush).toHaveBeenCalledWith('/first');

    rerender(<ActionCard {...defaultProps} href="/second" />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockPush).toHaveBeenCalledWith('/second');
  });
});
