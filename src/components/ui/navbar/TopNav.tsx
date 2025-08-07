'use client';

import { Button } from "@heroui/button";
import { useDisclosure } from '@heroui/modal';
import { useRouter } from "next/navigation";
import { useAuth } from '@/providers/Providers';
import UserMenu from './UserMenu';
import LoginModal from './LoginModal';
import LoadingSpinner from "../LoadingSpinner";

export default function TopNav() {
  const { user, loading } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  const handleLogoClick = () => {
    router.push("/");
  };

  if (loading) {
    return (
      <nav className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold">Podcast Manager</h1>
        <LoadingSpinner />
      </nav>
    );
  }

  return (
    <>
      <nav className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold cursor-pointer" onClick={handleLogoClick}>Podcast Manager</h1>
          {user && (
            <div className="hidden md:flex space-x-4">
              <Button variant="light" as="a" href="/podcasts/new">Publish</Button>
              <Button variant="light" as="a" href="/podcasts">Analytics</Button>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {user 
          ? <UserMenu user={user} /> 
          : <Button onPress={onOpen} color="primary">Login</Button>
          }
        </div>
      </nav>
      <LoginModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};
