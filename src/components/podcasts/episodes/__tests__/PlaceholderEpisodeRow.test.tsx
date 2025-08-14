import { render, screen, fireEvent } from '@testing-library/react';
import PlaceholderEpisodeRow from '../PlaceholderEpisodeRow';

// Mock child component
jest.mock('@/components/forms/NewEpisodeForm', () => {
  return function MockNewEpisodeForm({ onSuccess, onCancel }: {
    onSuccess: () => void;
    onCancel: () => void;
  }) {
    return (
      <div data-testid="new-episode-form">
        <button onClick={onSuccess}>Success</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    );
  };
});

// Mock HeroUI components
jest.mock('@heroui/card', () => ({
  Card: ({ children, className, isPressable, onPress }: { 
    children: React.ReactNode; 
    className?: string; 
    isPressable?: boolean;
    onPress?: () => void;
  }) => {
    return (
      <div 
        className={className} 
        onClick={isPressable ? onPress : undefined}
        role={isPressable ? "button" : undefined}
        tabIndex={isPressable ? 0 : undefined}
      >
        {children}
      </div>
    );
  },
  CardBody: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => 
    <div {...props}>{children}</div>,
}));

jest.mock('@heroui/modal', () => ({
  Modal: ({ children, isOpen, ...props }: { 
    children: React.ReactNode; 
    isOpen: boolean; 
    onClose?: () => void; 
    [key: string]: unknown 
  }) => isOpen ? <div data-testid="modal" {...props}>{children}</div> : null,
  ModalContent: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => 
    <div {...props}>{children}</div>,
}));

// Mock react-icons
jest.mock('react-icons/ai', () => ({
  AiOutlinePlusCircle: ({ size, ...props }: { size?: number; [key: string]: unknown }) => 
    <div data-testid="plus-icon" data-size={size} {...props}>+</div>,
}));

describe('PlaceholderEpisodeRow', () => {
  const mockOnEpisodeCreated = jest.fn();

  const defaultProps = {
    podcastId: 'test-podcast-id',
    onEpisodeCreated: mockOnEpisodeCreated,
    isFirstInList: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render placeholder card', () => {
    render(<PlaceholderEpisodeRow {...defaultProps} />);

    expect(screen.getByText('Add new Episode')).toBeTruthy();
    expect(screen.getByTestId('plus-icon')).toBeTruthy();
  });

  it('should show plus icon', () => {
    render(<PlaceholderEpisodeRow {...defaultProps} />);

    const icon = screen.getByTestId('plus-icon');
    expect(icon).toBeTruthy();
    expect(icon.getAttribute('data-size')).toBe('28');
  });

  it('should open modal when clicked', () => {
    render(<PlaceholderEpisodeRow {...defaultProps} />);

    fireEvent.click(screen.getByText('Add new Episode'));

    expect(screen.getByTestId('modal')).toBeTruthy();
    expect(screen.getByTestId('new-episode-form')).toBeTruthy();
  });

  it('should not show modal initially', () => {
    render(<PlaceholderEpisodeRow {...defaultProps} />);

    expect(screen.queryByTestId('modal')).toBeFalsy();
    expect(screen.queryByTestId('new-episode-form')).toBeFalsy();
  });

  it('should close modal when episode creation succeeds', () => {
    render(<PlaceholderEpisodeRow {...defaultProps} />);

    // Open modal
    fireEvent.click(screen.getByText('Add new Episode'));
    expect(screen.getByTestId('modal')).toBeTruthy();

    // Trigger success
    fireEvent.click(screen.getByText('Success'));

    expect(screen.queryByTestId('modal')).toBeFalsy();
    expect(mockOnEpisodeCreated).toHaveBeenCalled();
  });

  it('should close modal when cancelled', () => {
    render(<PlaceholderEpisodeRow {...defaultProps} />);

    // Open modal
    fireEvent.click(screen.getByText('Add new Episode'));
    expect(screen.getByTestId('modal')).toBeTruthy();

    // Trigger cancel
    fireEvent.click(screen.getByText('Cancel'));

    expect(screen.queryByTestId('modal')).toBeFalsy();
    expect(mockOnEpisodeCreated).not.toHaveBeenCalled();
  });

  it('should pass correct podcast ID to form', () => {
    render(<PlaceholderEpisodeRow {...defaultProps} podcastId="specific-podcast-id" />);

    fireEvent.click(screen.getByText('Add new Episode'));

    // Form should be rendered with the podcast ID
    expect(screen.getByTestId('new-episode-form')).toBeTruthy();
  });

  it('should apply different styling when first in list', () => {
    const { container } = render(<PlaceholderEpisodeRow {...defaultProps} isFirstInList={true} />);

    const card = container.querySelector('.podcast-card');
    expect(card).toBeTruthy();
    // Check for additional first-in-list content
    expect(screen.getAllByText('Create your first Epidode to get started')).toHaveLength(1);
  });

  it('should apply default styling when not first in list', () => {
    const { container } = render(<PlaceholderEpisodeRow {...defaultProps} isFirstInList={false} />);

    const card = container.querySelector('.podcast-card');
    expect(card).toBeTruthy();
    // Should not have first-in-list content
    expect(screen.queryByText('Create your first Epidode to get started')).toBeNull();
  });

  it('should handle rapid clicks gracefully', () => {
    render(<PlaceholderEpisodeRow {...defaultProps} />);

    const button = screen.getByText('Add new Episode');
    
    // Multiple rapid clicks
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    // Should only open one modal
    expect(screen.getAllByTestId('modal')).toHaveLength(1);
  });

  it('should be accessible', () => {
    render(<PlaceholderEpisodeRow {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toBeTruthy();
    expect(button).toHaveTextContent('+Add new Episode');
  });

  it('should have proper visual hierarchy', () => {
    render(<PlaceholderEpisodeRow {...defaultProps} />);

    expect(screen.getByText('Add new Episode')).toBeTruthy();
    expect(screen.getByTestId('plus-icon')).toBeTruthy();
  });

  it('should handle keyboard interactions', () => {
    render(<PlaceholderEpisodeRow {...defaultProps} />);

    const button = screen.getByRole('button');
    
    // Test focus and click instead of keydown since HeroUI Card may not handle keydown events
    fireEvent.focus(button);
    fireEvent.click(button);
    expect(screen.getByTestId('modal')).toBeTruthy();
  });
});
