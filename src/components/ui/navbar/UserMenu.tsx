import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection
} from '@heroui/dropdown';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { MdAccountCircle, MdPodcasts, MdSettings, MdHelp, MdLogout } from 'react-icons/md';

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
        <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/10 transition-colors">
          <MdAccountCircle 
            data-testid="account-circle-icon"
            data-name={displayName}
            color="white" 
            size={36}
            className="cursor-pointer"
          />
        </button>
      </DropdownTrigger>
      
      <DropdownMenu aria-label="User menu actions">
        {/* User Info Section */}
        <DropdownSection title="Account" showDivider>
          <DropdownItem 
            key="profile" 
            textValue="Profile"
            className="h-14"
            href="/account"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium">{displayName}</span>
              <span className="text-xs text-gray-500">{user.email}</span>
            </div>
          </DropdownItem>
        </DropdownSection>

        {/* Navigation Section */}
        <DropdownSection title="Navigation" showDivider>
          <DropdownItem 
            key="podcasts" 
            href="/podcasts" 
            textValue="My Podcasts"
            startContent={<MdPodcasts className="text-purple-600" size={18} />}
          >
            My Podcasts
          </DropdownItem>
          
          <DropdownItem 
            key="account" 
            href="/account" 
            textValue="Account Settings"
            startContent={<MdSettings className="text-gray-600" size={18} />}
          >
            Account Settings
          </DropdownItem>
          
          <DropdownItem 
            key="help" 
            href="/account/help" 
            textValue="Help & Support"
            startContent={<MdHelp className="text-blue-600" size={18} />}
          >
            Help & Support
          </DropdownItem>
        </DropdownSection>

        {/* Actions Section */}
        <DropdownSection title="Actions">
          <DropdownItem 
            key="logout" 
            textValue="Sign Out" 
            color="danger"
            onPress={handleSignOut}
            startContent={<MdLogout size={18} />}
          >
            Sign Out
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};
