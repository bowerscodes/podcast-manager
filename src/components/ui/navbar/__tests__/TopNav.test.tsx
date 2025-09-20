import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

// Mock profileUtils
jest.mock("@/lib/profileUtils", () => ({
  fetchUserProfile: jest.fn(),
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
  const mockFetchUserProfile = jest.requireMock("@/lib/profileUtils").fetchUserProfile;
  
  beforeEach(() => {
    jest.clearAllMocks();

    // Default successful profile fetch mock
    mockFetchUserProfile.mockResolvedValue({
      profile: { display_name: "Test User" },
      error: null,
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

    render(<TopNav />);

    // Wait for profile to load
    await waitFor(() => {
      expect(mockFetchUserProfile).toHaveBeenCalledWith('user-123');
    });

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
    mockUseAuth.mockReturnValue({
      user: mockUser,
      setUser: mockSetUser,
      loading: false
    });

    render(<TopNav />);

    await waitFor(() => {
      expect(mockFetchUserProfile).toHaveBeenCalledWith('user-123');
    });
  });

  it('should handle profile fetch error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    mockFetchUserProfile.mockResolvedValue({
      profile: null,
      error: 'Profile not found'
    });

    mockUseAuth.mockReturnValue({
      user: mockUser,
      setUser: mockSetUser,
      loading: false
    });

    render(<TopNav />);

    await waitFor(() => {
      expect(mockFetchUserProfile).toHaveBeenCalledWith('user-123');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error fetching profile:', 'Profile not found');
    
    consoleSpy.mockRestore();
  });

  it('should listen for profile update events', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      setUser: mockSetUser,
      loading: false
    });

    render(<TopNav />);

    // Wait for initial profile fetch
    await waitFor(() => {
      expect(mockFetchUserProfile).toHaveBeenCalledTimes(1);
    });

    // Simulate profile update event
    const profileUpdateEvent = new CustomEvent('profileUpdated');
    window.dispatchEvent(profileUpdateEvent);

    // Should fetch profile again
    await waitFor(() => {
      expect(mockFetchUserProfile).toHaveBeenCalledTimes(2);
    });
  });
});
