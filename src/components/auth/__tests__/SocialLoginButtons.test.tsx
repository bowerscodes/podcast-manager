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

// Mock window.location
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (window as any).location;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).location = {
  origin: 'http://localhost:3000',
};

describe('SocialLoginButtons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all social login buttons', () => {
    render(<SocialLoginButtons />);

    expect(screen.getByText('Continue with Apple')).toBeTruthy();
    expect(screen.getByText('Continue with Facebook')).toBeTruthy();
    expect(screen.getByText('Continue with GitHub')).toBeTruthy();
    expect(screen.getByText('Continue with Google')).toBeTruthy();
  });

  it('should handle Apple login', async () => {
    (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValueOnce({
      error: null
    });

    render(<SocialLoginButtons />);

    fireEvent.click(screen.getByText('Continue with Apple'));

    await waitFor(() => {
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'apple',
        options: {
          redirectTo: 'http://localhost/',
        },
      });
    });
  });

  it('should handle Facebook login', async () => {
    (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValueOnce({
      error: null
    });

    render(<SocialLoginButtons />);

    fireEvent.click(screen.getByText('Continue with Facebook'));

    await waitFor(() => {
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'facebook',
        options: {
          redirectTo: 'http://localhost/',
        },
      });
    });
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
          redirectTo: 'http://localhost/',
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
          redirectTo: 'http://localhost/',
        },
      });
    });
  });

  it('should handle OAuth errors', async () => {
    (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValueOnce({
      error: { message: 'OAuth provider not available' }
    });

    render(<SocialLoginButtons />);

    fireEvent.click(screen.getByText('Continue with Google'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('An unexpected error occurred');
    });
  });

  it('should handle network errors', async () => {
    (supabase.auth.signInWithOAuth as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(<SocialLoginButtons />);

    fireEvent.click(screen.getByText('Continue with Apple'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error');
    });
  });

  it('should handle unknown errors', async () => {
    (supabase.auth.signInWithOAuth as jest.Mock).mockRejectedValueOnce(
      'Unknown error string'
    );

    render(<SocialLoginButtons />);

    fireEvent.click(screen.getByText('Continue with Facebook'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('An unexpected error occurred');
    });
  });

  it('should apply correct CSS classes', () => {
    render(<SocialLoginButtons />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
    
    buttons.forEach(button => {
      expect(button.className).toContain('w-full');
    });
  });

  it('should render buttons in correct order', () => {
    render(<SocialLoginButtons />);

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveTextContent('Continue with Apple');
    expect(buttons[1]).toHaveTextContent('Continue with Facebook');
    expect(buttons[2]).toHaveTextContent('Continue with GitHub');
    expect(buttons[3]).toHaveTextContent('Continue with Google');
  });
});
