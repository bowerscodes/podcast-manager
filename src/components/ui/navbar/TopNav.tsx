'use client';

import { Button } from "@heroui/button";
import { useDisclosure } from '@heroui/modal';
import { useRouter } from "next/navigation";
import { useAuth } from '@/providers/Providers';
import UserMenu from './UserMenu';
import LoginModal from './LoginModal';

export default function TopNav() {
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  const handleLogoClick = () => {
    router.push("/");
  };

  return (
    <>
      <nav className={"relative"}>
        <div className="absolute inset-0"></div>
        <div className="relative flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <h1 
              className="text-2xl font-bold text-stone-800 cursor-pointer hover:text-stone-600 transition-colors duration-150"
              style={{
                textShadow: "1px 1px 6px rgba(0, 0, 0, 0.5)"
              }} 
              onClick={handleLogoClick}
            >
              🎙️ podly
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {user 
            ? <UserMenu user={user} /> 
            : <Button onPress={onOpen} className="btn-primary">Login</Button>
            }
          </div>
        </div>
      </nav>
      <LoginModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};
