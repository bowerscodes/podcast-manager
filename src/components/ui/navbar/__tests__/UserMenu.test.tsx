import { render, screen, fireEvent } from '@testing-library/react';
import { useAuth } from '@/providers/Providers';
import UserMenu from '../UserMenu';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

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

  it('should pass user name to icon when available', () => {
    const userWithName = {
      id: '1',
      email: 'test@example.com',
      user_metadata: {
        full_name: 'John Doe'
      },
      app_metadata: {},
      aud: 'authenticated',
      created_at: '2023-01-01T00:00:00Z'
    } as User;

    render(<UserMenu user={userWithName} />);
    expect(screen.getByTestId('account-circle-icon')).toHaveAttribute('data-name', 'John Doe');
  });

  it('should pass email to icon when name is not available', () => {
    const userWithoutName = {
      id: '1', 
      email: 'test@example.com',
      user_metadata: {},
      app_metadata: {},
      aud: 'authenticated',
      created_at: '2023-01-01T00:00:00Z'
    } as User;

    render(<UserMenu user={userWithoutName} />);
    expect(screen.getByTestId('account-circle-icon')).toHaveAttribute('data-name', 'test@example.com');
  });

  it('should handle sign out action', () => {
    render(<UserMenu user={mockUser} />);

    const signOutButton = screen.getByText('Sign out');
    fireEvent.click(signOutButton);

    expect(mockSignOut).toHaveBeenCalled();
  });
});
