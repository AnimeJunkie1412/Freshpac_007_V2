import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-freshpac-orange text-freshpac-charcoal shadow-panel hover:bg-orange-400",
  secondary: "border border-freshpac-panel bg-white text-freshpac-charcoal hover:border-freshpac-orange hover:bg-orange-50",
  ghost: "text-freshpac-charcoal hover:bg-freshpac-panel/70",
  danger: "bg-red-600 text-white hover:bg-red-700"
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base"
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button
      className={cn(
        "fp-focus-ring inline-flex items-center justify-center rounded-xl font-semibold transition",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  children,
  className,
  variant = "primary",
  size = "md"
}: {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "fp-focus-ring inline-flex items-center justify-center rounded-xl font-semibold transition",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </Link>
  );
}
