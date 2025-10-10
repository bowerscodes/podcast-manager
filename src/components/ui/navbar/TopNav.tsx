"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { useDisclosure } from "@heroui/modal";

import { useAuth } from "@/providers/Providers";
import { useProfile } from "@/hooks/useProfile";
import UserMenu from "./UserMenu";
import LoginModal from "./LoginModal";
import UsernameSetupModal from "@/components/auth/UsernameSetupModal";
import { appTitle } from "@/lib/data";
import { useState } from "react";

export default function TopNav() {
  const { user } = useAuth();
  const { profile, loading, showUsernameSetup } = useProfile();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [forceHideModal, setForceHideModal] = useState(false);

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
              className="text-2xl font-bold cursor-pointer transition-colors duration-150"
              style={{
                color: "white",
                textShadow: "1px 1px 6px rgba(0, 0, 0, 0.5)",
              }}
              onClick={handleLogoClick}
            >
              🎙️ {appTitle}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <UserMenu 
                user={user} 
                profile={profile} 
                isLoading={loading}
              />
            ) : (
              <Button onPress={onOpen} className="btn-primary">
                Login
              </Button>
            )}
          </div>
        </div>
      </nav>
      
      <LoginModal isOpen={isOpen} onClose={onClose} />
      
      {showUsernameSetup && !forceHideModal && (
        <UsernameSetupModal 
          onComplete={() => {
            setForceHideModal(true);

            window.location.reload();
          }} 
        />
      )}
    </>
  );
}
