"use client";

import { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes, ElementType, forwardRef } from "react";

type ButtonVariant = "solid" | "bordered" | "light" | "flat" | "ghost";
type ButtonColor =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "default";
type ButtonSize = "sm" | "md" | "lg";

interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  as?: ElementType;
  color?: ButtonColor;
  size?: ButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
  isIconOnly?: boolean;
  onPress?: () => void;
  startContent?: ReactNode;
  endContent?: ReactNode;
  fullWidth?: boolean;
  className?: string;
}

// When used as a button
interface ButtonAsButton extends BaseButtonProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> {
  as?: "button";
  href?: never;
}

// When used as an anchor/link
interface ButtonAsLink extends BaseButtonProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> {
  as: ElementType;
  href?: string;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      children,
      variant = "solid",
      color = "default",
      size = "md",
      isLoading = false,
      isDisabled = false,
      isIconOnly = false,
      onPress,
      onClick,
      startContent,
      endContent,
      fullWidth = false,
      className = "",
      as: Component = "button",
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed";

    // Size styles - icon-only buttons use square padding
    const sizeStyles = {
      sm: isIconOnly ? "p-1.5 min-w-[2rem] min-h-[2rem]" : "px-3 py-1.5 text-sm",
      md: isIconOnly ? "p-2 min-w-[2.5rem] min-h-[2.5rem]" : "px-4 py-2 text-base",
      lg: isIconOnly ? "p-3 min-w-[3rem] min-h-[3rem]" : "px-6 py-3 text-lg",
    };

    // Color & Variant combinations
    const variantStyles = {
      solid: {
        primary: "btn-primary text-white hover:brightness-110 focus:ring-blue-500",
        secondary: "bg-[var(--color-secondary)] text-white hover:brightness-110 focus:ring-[var(--color-secondary)]",
        success: "bg-[var(--color-success)] text-white hover:brightness-110 focus:ring-[var(--color-success)]",
        warning: "bg-[var(--color-warning)] text-white hover:brightness-110 focus:ring-[var(--color-warning)]",
        danger: "bg-[var(--color-error)] text-white hover:brightness-110 focus:ring-[var(--color-error)]",
        default: "bg-gray-200 text-black hover:bg-gray-300 focus:ring-gray-400",
      },
      bordered: {
        primary: "border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 focus:ring-blue-500",
        secondary: "border border-[var(--color-secondary)] text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10 focus:ring-[var(--color-secondary)]",
        success: "border border-[var(--color-success)] text-[var(--color-success)] hover:bg-[var(--color-success)]/10 focus:ring-[var(--color-success)]",
        warning: "border border-[var(--color-warning)] text-[var(--color-warning)] hover:bg-[var(--color-warning)]/10 focus:ring-[var(--color-warning)]",
        danger: "border border-[var(--color-error)] text-[var(--color-error)] hover:bg-[var(--color-error)]/10 focus:ring-[var(--color-error)]",
        default: "border border-gray-200 text-black hover:bg-gray-100 focus:ring-gray-400",
      },
      light: {
        primary: "bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 focus:ring-blue-500",
        secondary: "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/20 focus:ring-[var(--color-secondary)]",
        success: "bg-[var(--color-success)]/10 text-[var(--color-success)] hover:bg-[var(--color-success)]/20 focus:ring-[var(--color-success)]",
        warning: "bg-[var(--color-warning)]/10 text-[var(--color-warning)] hover:bg-[var(--color-warning)]/20 focus:ring-[var(--color-warning)]",
        danger: "bg-[var(--color-error)]/10 text-[var(--color-error)] hover:bg-[var(--color-error)]/20 focus:ring-[var(--color-error)]",
        default: "bg-gray-50 text-black hover:bg-gray-100 focus:ring-gray-400",
      },
      flat: {
        primary: "text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 focus:ring-blue-500",
        secondary: "text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10 focus:ring-[var(--color-secondary)]",
        success: "text-[var(--color-success)] hover:bg-[var(--color-success)]/10 focus:ring-[var(--color-success)]",
        warning: "text-[var(--color-warning)] hover:bg-[var(--color-warning)]/10 focus:ring-[var(--color-warning)]",
        danger: "text-[var(--color-error)] hover:bg-[var(--color-error)]/10 focus:ring-[var(--color-error)]",
        default: "text-black hover:bg-gray-100 focus:ring-gray-400",
      },
      ghost: {
        primary: "text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 focus:ring-blue-500",
        secondary: "text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/20 focus:ring-[var(--color-secondary)]",
        success: "text-[var(--color-success)] hover:bg-[var(--color-success)]/20 focus:ring-[var(--color-success)]",
        warning: "text-[var(--color-warning)] hover:bg-[var(--color-warning)]/20 focus:ring-[var(--color-warning)]",
        danger: "text-[var(--color-error)] hover:bg-[var(--color-error)]/20 focus:ring-[var(--color-error)]",
        default: "text-black hover:bg-gray-200 focus:ring-gray-400",
      },
    };

    const widthStyle = fullWidth ? "w-full" : "";

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled || isLoading) {
        e.preventDefault();
        return;
      }
      if (onPress) onPress();
      if (onClick) onClick(e);
    };

    const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant][color]} ${widthStyle} ${className}`;

     // If rendering as a button
    if (Component === "button") {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type={(props as ButtonAsButton).type || "button"}
          className={combinedClassName}
          onClick={handleClick as React.MouseEventHandler<HTMLButtonElement>}
          disabled={isDisabled || isLoading}
          aria-busy={isLoading}
          aria-disabled={isDisabled || isLoading}
          data-variant={variant}
          data-color={color}
          data-size={size}
          {...(props as ButtonAsButton)}
        >
          {isIconOnly ? (
            children
          ) : (
            <>
              {startContent && <span className="mr-2">{startContent}</span>}
              {children}
              {endContent && <span className="ml-2">{endContent}</span>}
            </>
          )}
        </button>
      );
    }

    // If rendering as a link or custom component
    return (
      <Component
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={combinedClassName}
        onClick={handleClick}
        aria-busy={isLoading}
        aria-disabled={isDisabled || isLoading}
        data-variant={variant}
        data-color={color}
        data-size={size}
        {...props}
      >
        {isIconOnly ? (
          children
        ) : (
          <>
            {startContent && <span className="mr-2">{startContent}</span>}
            {children}
            {endContent && <span className="ml-2">{endContent}</span>}
          </>
        )}
      </Component>
    );
  }
);

Button.displayName = "Button";

export default Button;
