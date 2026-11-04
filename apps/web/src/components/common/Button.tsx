import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

import {
  buttonStyles,
  type ButtonSize,
  type ButtonVariant,
} from "./buttonStyles";
import { Spinner } from "./Spinner";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
}

export function Button({
  variant,
  size,
  fullWidth,
  loading = false,
  leftIcon,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonStyles({ variant, size, fullWidth }), className)}
      {...props}
    >
      {loading ? <Spinner className="size-4" /> : leftIcon}
      {children}
    </button>
  );
}
