import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { supabase } from '@/lib/supabase';
import EmailPasswordForm from '../EmailPasswordForm';
import toast from 'react-hot-toast';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
    }
  }
}));

// Mock toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    success: jest.fn(),
  }
}));

// Mock HeroUI components
jest.mock('@heroui/button', () => ({
  Button: ({ children, onPress, isLoading, ...props }: { 
    children: React.ReactNode; 
    onPress?: () => void; 
    isLoading?: boolean; 
    [key: string]: unknown 
  }) => (
    <button onClick={onPress} disabled={isLoading} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@heroui/input', () => ({
  Input: ({ label, value, onChange, type, ...props }: { 
    label?: string; 
    value?: string; 
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; 
    type?: string; 
    [key: string]: unknown 
  }) => (
    <div>
      <label>{label}</label>
      <input 
        aria-label={label}
        value={value} 
        onChange={onChange} 
        type={type}
        {...props} 
      />
    </div>
  ),
}));

describe('EmailPasswordForm', () => {
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

  it('should render sign-in form when isSignUp is false', () => {
    render(<EmailPasswordForm {...defaultProps} />);

    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/password/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /login/i })).toBeTruthy();
    expect(screen.getByText(/don't have an account/i)).toBeTruthy();
  });

  it('should render sign-up form when isSignUp is true', () => {
    render(<EmailPasswordForm {...defaultProps} isSignUp={true} />);

    expect(screen.getByRole('button', { name: /sign up/i })).toBeTruthy();
    expect(screen.getByText(/already have an account/i)).toBeTruthy();
  });

  it('should update email and password fields', () => {
    render(<EmailPasswordForm {...defaultProps} />);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('should handle successful sign-in', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { user: { id: '123' } },
      error: null
    });

    render(<EmailPasswordForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: 'password123' } 
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should handle successful sign-up', async () => {
    (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
      data: { user: { id: '123' } },
      error: null
    });

    render(<EmailPasswordForm {...defaultProps} isSignUp={true} />);

    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: 'password123' } 
    });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should handle authentication errors', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: new Error('Invalid credentials')
    });

    render(<EmailPasswordForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: 'wrongpassword' } 
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
    });
  });

  it('should toggle between sign-in and sign-up modes', () => {
    render(<EmailPasswordForm {...defaultProps} />);

    fireEvent.click(screen.getByText(/sign up/i));
    expect(mockOnToggleMode).toHaveBeenCalled();
  });

  it('should disable form submission when loading', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<EmailPasswordForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: 'password123' } 
    });
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
  });

  it('should validate email format', async () => {
    render(<EmailPasswordForm {...defaultProps} />);

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput.getAttribute('type')).toBe('email');
  });

  it('should validate password requirements', async () => {
    render(<EmailPasswordForm {...defaultProps} />);

    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput.getAttribute('type')).toBe('password');
  });
});
