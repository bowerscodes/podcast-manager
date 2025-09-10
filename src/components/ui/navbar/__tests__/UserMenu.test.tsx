import { render, screen, fireEvent } from '@testing-library/react';
import { useAuth } from '@/providers/Providers';
import UserMenu from '../UserMenu';
import { supabase } from '@/lib/supabase';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: jest.fn(),
    }
  }
}));

// Get the mocked function
const mockSignOut = supabase.auth.signOut as jest.Mock;

// Mock auth provider
jest.mock('@/providers/Providers', () => ({
  useAuth: jest.fn(),
}));

// Mock react-icons
jest.mock('react-icons/md', () => ({
  MdAccountCircle: ({ name, size }: { name?: string; size?: number }) => (
    <div data-testid="account-circle-icon" data-name={name} data-size={size}>
      AccountCircle
    </div>
  ),
  MdPodcasts: () => <div data-testid="podcasts-icon">Podcasts</div>,
  MdSettings: () => <div data-testid="settings-icon">Settings</div>,
  MdHelp: () => <div data-testid="help-icon">Help</div>,
  MdLogout: () => <div data-testid="logout-icon">Logout</div>,
}));

// Mock HeroUI components with simplified structure
jest.mock('@heroui/dropdown', () => ({
  Dropdown: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown">{children}</div>
  ),
  DropdownTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownSection: ({ children, title }: { 
    children: React.ReactNode; 
    title?: string;
  }) => (
    <div data-testid="dropdown-section" data-title={title}>
      {children}
    </div>
  ),
  DropdownItem: ({ children, onPress, textValue }: { 
    children: React.ReactNode; 
    onPress?: () => void;
    textValue?: string;
  }) => (
    <div 
      data-testid="dropdown-item" 
      onClick={onPress}
      data-text={textValue}
    >
      {children}
    </div>
  ),
}));

describe('UserMenu', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {
      name: 'Test User'
    },
    aud: 'authenticated',
    created_at: '2023-01-01T00:00:00Z',
  } as const;

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
  });

  it('should render user account icon', () => {
    render(<UserMenu user={mockUser} />);
    expect(screen.getByTestId('account-circle-icon')).toBeTruthy();
  });

  it('renders all podcast-focused menu items correctly', () => {
    render(<UserMenu user={mockUser} />);
    
    expect(screen.getByText('My Podcasts')).toBeInTheDocument();
    expect(screen.getByText('Account Settings')).toBeInTheDocument();
    expect(screen.getByText('Help & Support')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('displays user email in account section', () => {
    render(<UserMenu user={mockUser} />);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should handle sign out action', () => {
    render(<UserMenu user={mockUser} />);

    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('renders dropdown sections correctly', () => {
    render(<UserMenu user={mockUser} />);
    
    const sections = screen.getAllByTestId('dropdown-section');
    expect(sections).toHaveLength(3); // Account, Navigation, Actions
  });
});
