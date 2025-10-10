import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from '../LoginForm';

// Mock MagicLinkForm component
jest.mock('../MagicLinkForm', () => {
  return function MockMagicLinkForm({ onSuccess }: { onSuccess: () => void }) {
    return (
      <div data-testid="magic-link-form">
        <button onClick={onSuccess}>Send Magic Link</button>
      </div>
    );
  };
});

describe('LoginForm', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render MagicLinkForm', () => {
    render(<LoginForm />);

    expect(screen.getByTestId('magic-link-form')).toBeInTheDocument();
  });

  it('should pass onSuccess callback to MagicLinkForm', () => {
    render(<LoginForm onClose={mockOnClose} />);

    const successButton = screen.getByText('Send Magic Link');
    fireEvent.click(successButton);

    // Should call onClose after 3 second timeout
    expect(mockOnClose).not.toHaveBeenCalled();
    
    jest.advanceTimersByTime(3000);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should not call onClose if not provided', () => {
    render(<LoginForm />);

    const successButton = screen.getByText('Send Magic Link');
    fireEvent.click(successButton);

    jest.advanceTimersByTime(3000);

    // Should not throw error
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should apply correct CSS structure', () => {
    const { container } = render(<LoginForm />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('space-y-4');
  });

  it('should render MagicLinkForm as child', () => {
    const { container } = render(<LoginForm />);

    const wrapper = container.firstChild as HTMLElement;
    const magicLinkForm = wrapper.querySelector('[data-testid="magic-link-form"]');
    expect(magicLinkForm).toBeInTheDocument();
  });
});
