import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuthGuard from '../AuthGuard';

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

// Mock auth provider
const mockUser = { id: 'user-123', email: 'test@example.com' };
const mockSetUser = jest.fn();

jest.mock('@/providers/Providers', () => ({
  useAuth: jest.fn()
}));

describe('AuthGuard', () => {
  const TestComponent = () => <div>Protected Content</div>;
  
  // Get the mocked useAuth function
  const mockUseAuth = jest.requireMock('@/providers/Providers').useAuth;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      setUser: mockSetUser,
      loading: false
    });

    render(
      <AuthGuard>
        <TestComponent />
      </AuthGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should show loading state when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      setUser: mockSetUser,
      loading: true
    });

    render(
      <AuthGuard>
        <TestComponent />
      </AuthGuard>
    );

    expect(screen.getByText(/checking authentication/i)).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      setUser: mockSetUser,
      loading: false
    });

    render(
      <AuthGuard>
        <TestComponent />
      </AuthGuard>
    );

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('should not render children when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      setUser: mockSetUser,
      loading: false
    });

    render(
      <AuthGuard>
        <TestComponent />
      </AuthGuard>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should handle auth state changes', async () => {
    // Start with no user
    mockUseAuth.mockReturnValue({
      user: null,
      setUser: mockSetUser,
      loading: false
    });

    const { rerender } = render(
      <AuthGuard>
        <TestComponent />
      </AuthGuard>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(mockPush).toHaveBeenCalledWith('/login');

    // User logs in
    mockUseAuth.mockReturnValue({
      user: mockUser,
      setUser: mockSetUser,
      loading: false
    });

    rerender(
      <AuthGuard>
        <TestComponent />
      </AuthGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
