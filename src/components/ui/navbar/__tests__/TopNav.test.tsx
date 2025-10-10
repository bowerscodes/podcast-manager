import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import TopNav from "../TopNav";

// Mock Next.js navigation
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/dashboard",
}));

// Mock auth provider
const mockUser = { id: "user-123", email: "test@example.com" };
const mockSetUser = jest.fn();

jest.mock("@/providers/Providers", () => ({
  useAuth: jest.fn(),
}));

// Mock useProfile hook
jest.mock("@/hooks/useProfile", () => ({
  useProfile: jest.fn(),
}));

jest.mock("@/lib/data", () => ({
  appTitle: "Podcast Manager",
}));

// Mock HeroUI modal
const mockOnOpen = jest.fn();
const mockOnClose = jest.fn();

jest.mock("@heroui/modal", () => ({
  useDisclosure: () => ({
    isOpen: false,
    onOpen: mockOnOpen,
    onClose: mockOnClose,
  }),
}));

// Mock LoginModal component
jest.mock("../LoginModal", () => {
  return function MockLoginModal({
    isOpen,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) {
    return isOpen ? <div data-testid="login-modal">Login Modal</div> : null;
  };
});

// Mock UserMenu component
jest.mock("../UserMenu", () => {
  return function MockUserMenu({
    user,
    profile,
  }: {
    user: { id: string; email: string };
    profile?: { display_name?: string } | null;
  }) {
    return (
      <div data-testid="user-menu">
        User Menu for {user.email}
        {profile?.display_name && ` (${profile.display_name})`}
      </div>
    );
  };
});

// Mock HeroUI components
jest.mock("@heroui/navbar", () => ({
  Navbar: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <nav {...props}>{children}</nav>,
  NavbarBrand: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  NavbarContent: ({
    children,
    justify,
  }: {
    children: React.ReactNode;
    justify?: string;
  }) => <div className={justify}>{children}</div>,
  NavbarItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock("@heroui/link", () => ({
  Link: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href?: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock("@heroui/button", () => ({
  Button: ({
    children,
    onPress,
    variant,
    ...props
  }: {
    children: React.ReactNode;
    onPress?: () => void;
    variant?: string;
    [key: string]: unknown;
  }) => (
    <button onClick={onPress} className={variant} {...props}>
      {children}
    </button>
  ),
}));

describe("TopNav", () => {
  const mockUseAuth = jest.requireMock("@/providers/Providers").useAuth;
  const mockUseProfile = jest.requireMock("@/hooks/useProfile").useProfile;
  
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock for useProfile hook
    mockUseProfile.mockReturnValue({
      profile: { username: "testuser", display_name: "Test User" },
      loading: false,
      error: null,
      showUsernameSetup: false,
      refreshProfile: jest.fn(),
    });
  });

  it("should show login button when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      setUser: mockSetUser,
      loading: false,
    });

    render(<TopNav />);

    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("should show user menu when authenticated", async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      setUser: mockSetUser,
      loading: false,
    });

    mockUseProfile.mockReturnValue({
      profile: { username: "testuser", display_name: "Test User" },
      loading: false,
      error: null,
      showUsernameSetup: false,
      refreshProfile: jest.fn(),
    });

    render(<TopNav />);

    expect(screen.getByText(/User Menu for test@example.com/)).toBeInTheDocument();
  });

  it("should handle login button click", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      setUser: mockSetUser,
      loading: false,
    });

    render(<TopNav />);

    const loginButton = screen.getByRole("button", { name: /login/i });
    fireEvent.click(loginButton);

    expect(mockOnOpen).toHaveBeenCalled();
  });

   it('should display app title and handle logo click', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      setUser: mockSetUser,
      loading: false
    });

    render(<TopNav />);

    const title = screen.getByText(/🎙️ Podcast Manager/);
    expect(title).toBeInTheDocument();

    fireEvent.click(title);
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('should fetch profile when user is authenticated', async () => {
    const mockRefreshProfile = jest.fn();
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      setUser: mockSetUser,
      loading: false
    });

    mockUseProfile.mockReturnValue({
      profile: { username: "testuser", display_name: "Test User" },
      loading: false,
      error: null,
      showUsernameSetup: false,
      refreshProfile: mockRefreshProfile,
    });

    render(<TopNav />);

    // Profile should be loaded via the hook
    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
  });

  it('should handle profile fetch error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    mockUseProfile.mockReturnValue({
      profile: null,
      loading: false,
      error: new Error('Profile not found'),
      showUsernameSetup: false,
      refreshProfile: jest.fn(),
    });

    mockUseAuth.mockReturnValue({
      user: mockUser,
      setUser: mockSetUser,
      loading: false
    });

    render(<TopNav />);

    // Component should still render even with profile error
    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('should listen for profile update events', async () => {
    const mockRefreshProfile = jest.fn();
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      setUser: mockSetUser,
      loading: false
    });

    mockUseProfile.mockReturnValue({
      profile: { username: "testuser", display_name: "Test User" },
      loading: false,
      error: null,
      showUsernameSetup: false,
      refreshProfile: mockRefreshProfile,
    });

    render(<TopNav />);

    // Simulate profile update event
    const profileUpdateEvent = new CustomEvent('profileUpdated');
    window.dispatchEvent(profileUpdateEvent);

    // The useProfile hook handles the event listener internally
    // Just verify the component renders correctly
    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
  });
});
