"use client";

import { useClickOutside } from "@/hooks/useClickOutside";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useKeyPress } from "@/hooks/useKeyPress";
import { usePortal } from "@/hooks/usePortal";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";


interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onOpenChange?: (isOpen: boolean) => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  placement?: "center" | "top" | "bottom";
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  onOpenChange,
  children,
  size = "md",
  placement = "center",
  closeOnOverlayClick = true,
  closeOnEsc = true,
  className = "",
}: ModalProps) {
  const portalElement = usePortal("modal-root");
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    // Call onClose if provided, otherwise fall back to onOpenChange
    if (onClose) {
      onClose();
    }
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  // Close on click outside
  useClickOutside(modalRef, handleClose, isOpen && closeOnOverlayClick);

  // Close on ESC key
  useKeyPress("Escape", handleClose, isOpen && closeOnEsc);

  // Trap focus inside modal
  useFocusTrap(modalRef, isOpen);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen && portalElement) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, portalElement]);

  if (!isOpen || !portalElement) return null;

  const sizeStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  const placementStyles = {
    center: "items-center",
    top: "items-start pt-16",
    bottom: "items-end pb-16",
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex ${placementStyles[placement]} justify-center p-4`}
      role="dialog"
      aria-modal="true"
    >
      { /* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      { /* Modal Content */}
      <div
        ref={modalRef}
        className={`
          relative bg-white rounded-lg p-4 shadow-xl w-full ${sizeStyles[size]} ${className}
        `}
        style={{ background: "var(--gradient-card-subtle)" }}
      >
        {children}
      </div>
    </div>,
    portalElement
  );
}

export function ModalContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col p-1 ${className}`}>
      {children}
    </div>
  );
}

export function ModalHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`pb-2 ${className}`}>
      {typeof children === "string" ? (
        <h2 className="heading-secondary">{children}</h2>
      ) : (
        children
      )}
    </div>
  );
}

export function ModalBody({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`py-2 pb-1 ${className}`}>
      {children}
    </div>
  );
}

export function ModalFooter({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-end pt-2 gap-2 ${className}`}
    >
      {children}
    </div>
  );
}
