import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/dropdown';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { MdAccountCircle } from 'react-icons/md';

type Props = {
  user: User;
};

export default function UserMenu({ user }: Props) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email;

  return (
    <Dropdown>
      <DropdownTrigger>
        <MdAccountCircle name={displayName} cursor="pointer" size={36} />
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem key="profile" textValue="Profile">
          <div className="flex flex-col">
            <span className="text-sm">{user.email}</span>
            <span className="text-xs text-gray-500">Profile</span>
          </div>
        </DropdownItem>
        <DropdownItem key="podcasts" href="/podcasts" textValue="My podcasts">
          My podcasts
        </DropdownItem>
        <DropdownItem key="settings">
          Settings
        </DropdownItem>
        <DropdownItem key="logout" textValue="Logout" color="danger" onPress={handleSignOut}>
          Sign out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
