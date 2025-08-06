'use client';

import { Button } from "@heroui/button";
import { useDisclosure } from '@heroui/modal';
import { useAuth } from '@/providers/Providers';
import UserMenu from './UserMenu';
import LoginModal from './LoginModal';

export default function TopNav() {
  const { user, loading } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (loading) {
    return (
      <nav className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold">Podcast Manager</h1>
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
      </nav>
    );
  }

  return (
    <>
      <nav className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Podcast Manager</h1>
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
