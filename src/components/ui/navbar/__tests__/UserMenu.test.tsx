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

// Mock HeroUI components with simplified structure
jest.mock('@heroui/avatar', () => ({
  Avatar: ({ name }: { name?: string }) => (
    <div data-testid="avatar">{name}</div>
  ),
}));

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

  it('should render user avatar', () => {
    render(<UserMenu user={mockUser} />);
    expect(screen.getByTestId('avatar')).toBeTruthy();
  });

  it('should display user name in avatar when available', () => {
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
    expect(screen.getByTestId('avatar')).toHaveTextContent('John Doe');
  });

  it('should display email when name is not available', () => {
    const userWithoutName = {
      id: '1', 
      email: 'test@example.com',
      user_metadata: {},
      app_metadata: {},
      aud: 'authenticated',
      created_at: '2023-01-01T00:00:00Z'
    } as User;

    render(<UserMenu user={userWithoutName} />);
    expect(screen.getByTestId('avatar')).toHaveTextContent('test@example.com');
  });

  it('should handle sign out action', () => {
    render(<UserMenu user={mockUser} />);

    const signOutButton = screen.getByText('Sign out');
    fireEvent.click(signOutButton);

    expect(mockSignOut).toHaveBeenCalled();
  });
});
