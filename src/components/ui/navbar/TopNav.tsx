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
      <nav className="relative bg-gradient-to-r from-purple-600 via-purple-700 to-cyan-600 shadow-lg">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <h1 
              className="text-2xl font-bold text-white cursor-pointer hover:text-purple-200 transition-colors" 
              onClick={handleLogoClick}
            >
              🎙️ Podcast Manager
            </h1>
            {user && (
              <div className="hidden md:flex space-x-4">
                <Button 
                  variant="light" 
                  className="text-white hover:text-purple-200" 
                  as="a" 
                  href="/podcasts/new"
                >
                  Publish
                </Button>
                <Button 
                  variant="light" 
                  className="text-white hover:text-purple-200" 
                  as="a" 
                  href="/podcasts"
                >
                  Analytics
                </Button>
              </div>
            )}
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
