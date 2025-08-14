import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from '../LoginForm';

// Mock child components
jest.mock('../SocialLoginButtons', () => {
  return function MockSocialLoginButtons() {
    return <div data-testid="social-login-buttons">Social Login Buttons</div>;
  };
});

jest.mock('../EmailPasswordForm', () => {
  return function MockEmailPasswordForm({ isSignUp, onToggleMode, onSuccess }: {
    isSignUp: boolean;
    onToggleMode: () => void;
    onSuccess: () => void;
  }) {
    return (
      <div data-testid="email-password-form">
        <div>isSignUp: {isSignUp.toString()}</div>
        <button onClick={onToggleMode}>Toggle Mode</button>
        <button onClick={onSuccess}>Success</button>
      </div>
    );
  };
});

describe('LoginForm', () => {
  const mockOnToggleMode = jest.fn();
  const mockOnSuccess = jest.fn();

  const defaultProps = {
    isSignUp: false,
    onToggleMode: mockOnToggleMode,
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render both social login buttons and email password form', () => {
    render(<LoginForm {...defaultProps} />);

    expect(screen.getByTestId('social-login-buttons')).toBeTruthy();
    expect(screen.getByTestId('email-password-form')).toBeTruthy();
  });

  it('should pass isSignUp prop to EmailPasswordForm', () => {
    render(<LoginForm {...defaultProps} isSignUp={true} />);

    expect(screen.getByText('isSignUp: true')).toBeTruthy();
  });

  it('should pass isSignUp false to EmailPasswordForm', () => {
    render(<LoginForm {...defaultProps} isSignUp={false} />);

    expect(screen.getByText('isSignUp: false')).toBeTruthy();
  });

  it('should pass onToggleMode callback to EmailPasswordForm', () => {
    render(<LoginForm {...defaultProps} />);

    fireEvent.click(screen.getByText('Toggle Mode'));
    expect(mockOnToggleMode).toHaveBeenCalled();
  });

  it('should pass onSuccess callback to EmailPasswordForm', () => {
    render(<LoginForm {...defaultProps} />);

    fireEvent.click(screen.getByText('Success'));
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('should apply correct CSS structure', () => {
    const { container } = render(<LoginForm {...defaultProps} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('space-y-4');
  });

  it('should render components in correct order', () => {
    const { container } = render(<LoginForm {...defaultProps} />);

    const children = Array.from(container.firstChild?.childNodes || []);
    expect(children[0]).toHaveAttribute('data-testid', 'social-login-buttons');
    expect(children[1]).toHaveAttribute('data-testid', 'email-password-form');
  });
});
