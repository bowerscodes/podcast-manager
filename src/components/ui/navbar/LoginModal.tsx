import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import LoginForm from "@/components/auth/LoginForm";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LoginModal({ isOpen, onClose }: Props) {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      placement="center"
      backdrop="blur"
      size="md"
    >
      <ModalContent>
        <ModalHeader className="justify-center">
          <h2>{isSignUp ? "Sign up" : "Login"}</h2>
        </ModalHeader>
        <ModalBody className="p-6">
          <LoginForm
            isSignUp={isSignUp}
            onToggleMode={() => setIsSignUp(!isSignUp)}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
