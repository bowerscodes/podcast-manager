import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { supabase } from '@/lib/supabase';
import SocialLoginButtons from '../SocialLoginButtons';
import toast from 'react-hot-toast';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: jest.fn(),
    }
  }
}));

// Mock toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
  }
}));

// Mock HeroUI components
jest.mock('@heroui/button', () => ({
  Button: ({ children, onPress, ...props }: { 
    children: React.ReactNode; 
    onPress?: () => void; 
    [key: string]: unknown 
  }) => (
    <button onClick={onPress} {...props}>
      {children}
    </button>
  ),
}));

describe('SocialLoginButtons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render available social login buttons', () => {
    render(<SocialLoginButtons />);

    expect(screen.getByText('Continue with GitHub')).toBeTruthy();
    expect(screen.getByText('Continue with Google')).toBeTruthy();
    // Apple and Facebook are disabled in component
    expect(screen.queryByText('Continue with Apple')).toBeNull();
    expect(screen.queryByText('Continue with Facebook')).toBeNull();
  });

  it('should handle GitHub login', async () => {
    (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValueOnce({
      error: null
    });

    render(<SocialLoginButtons />);

    fireEvent.click(screen.getByText('Continue with GitHub'));

    await waitFor(() => {
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'github',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
          queryParams: {
            access_type: "offline",
            prompt: "consent"
          }
        },
      });
    });
  });

  it('should handle Google login', async () => {
    (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValueOnce({
      error: null
    });

    render(<SocialLoginButtons />);

    fireEvent.click(screen.getByText('Continue with Google'));

    await waitFor(() => {
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
          queryParams: {
            access_type: "offline",
            prompt: "consent"
          }
        },
      });
    });
  });

  it('should handle OAuth errors', async () => {
    (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValueOnce({
      error: new Error('OAuth provider not available')
    });

    render(<SocialLoginButtons />);

    fireEvent.click(screen.getByText('Continue with Google'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('OAuth provider not available');
    });
  });

  it('should handle network errors', async () => {
    (supabase.auth.signInWithOAuth as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(<SocialLoginButtons />);

    fireEvent.click(screen.getByText('Continue with GitHub'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error');
    });
  });

  it('should handle unknown errors', async () => {
    (supabase.auth.signInWithOAuth as jest.Mock).mockRejectedValueOnce(
      'Unknown error string'
    );

    render(<SocialLoginButtons />);

    fireEvent.click(screen.getByText('Continue with Google'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('An unexpected error occurred');
    });
  });

  it('should apply correct CSS classes', () => {
    render(<SocialLoginButtons />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2); // Only GitHub and Google
    
    buttons.forEach(button => {
      expect(button.className).toContain('w-full');
    });
  });

  it('should render buttons in correct order', () => {
    render(<SocialLoginButtons />);

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveTextContent('Continue with GitHub');
    expect(buttons[1]).toHaveTextContent('Continue with Google');
  });
});
