import { Avatar } from '@heroui/avatar';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/dropdown';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

type Props = {
  user: User;
};

export default function UserMenu({ user }: Props) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Avatar
          size="sm"
          src={user.user_metadata?.avatar_url}
          name={user.email || "User"}
          className="cursor-pointer"
        />
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem key="profile">
          <div className="flex flex-col">
            <span className="text-sm">{user.email}</span>
            <span className="text-xs text-gray-500">Profile</span>
          </div>
        </DropdownItem>
        <DropdownItem key="podcasts" href="/podcasts">
          My podcasts
        </DropdownItem>
        <DropdownItem key="settings">Settings</DropdownItem>
        <DropdownItem key="logout" color="danger" onPress={handleSignOut}>
          Sign out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
