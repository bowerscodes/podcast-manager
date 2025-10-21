import { ReactNode, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  isPressable?: boolean;
  onPress?: () => void;
}

export function Card({
  children,
  className = "",
  isPressable = false,
  onPress,
  ...props
}: CardProps) {
  const baseStyles = "rounded-lg bg-white shadow-sm border border-gray-100";
  const pressableStyles = isPressable
    ? "cursor-pointer hover:shadow-md transition-shadow duration-200"
    : "";

  const handleClick = () => {
    if (isPressable && onPress) {
      onPress();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isPressable && onPress && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onPress();
    }
  };

  return (
    <div
      className={`${baseStyles} ${pressableStyles} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isPressable ? "button" : undefined}
      tabIndex={isPressable ? 0 : undefined}
      data-pressable={isPressable}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
  ...props
}: { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className = "",
  ...props
}: { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = "",
  ...props
}: { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-4 border-t border-gray-100 ${className}`} {...props}>
      {children}
    </div>
  );
}
