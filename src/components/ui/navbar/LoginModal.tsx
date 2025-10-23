import { useEffect } from "react";

import { useAuth } from "@/providers/Providers";
import LoginForm from "@/components/auth/LoginForm";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@/components/ui/Modal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LoginModal({ isOpen, onClose }: Props) {
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
      size="md"
    >
      <ModalContent>
        <ModalHeader className="justify-center pb-0">
          <h2 className="heading-secondary leading-relaxed">Enter your email address</h2>
        </ModalHeader>
        <ModalBody className="p-6 pt-3">
          <LoginForm
            onClose={onClose}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
