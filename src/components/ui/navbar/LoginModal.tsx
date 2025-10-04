import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";

import { useAuth } from "@/providers/Providers";
import LoginForm from "@/components/auth/LoginForm";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LoginModal({ isOpen, onClose }: Props) {
  const [isSignUp, setIsSignUp] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      placement="center"
      backdrop="blur"
      size="md"
    >
      <ModalContent>
        <ModalHeader className="justify-center pb-0">
          <h2 className="heading-primary leading-relaxed">{isSignUp ? "Sign up" : "Login"}</h2>
        </ModalHeader>
        <ModalBody className="p-6">
          <LoginForm
            isSignUp={isSignUp}
            onToggleMode={() => setIsSignUp(!isSignUp)}
            onSuccess={onClose}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
