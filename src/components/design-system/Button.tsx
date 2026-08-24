import React from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = "",
  disabled,
  ...props
}) => {
  // Base: 8px border-radius (rounded-[8px]), medium font weight, inline-flex, transition
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-[8px] transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none focus:outline-none focus:ring-2 focus:ring-offset-2";

  // Size specifications with exact 2x horizontal padding rule
  const sizeStyles = {
    sm: "text-xs py-1.5 px-3 gap-1.5 min-h-[32px]",
    md: "text-sm py-2 px-4 gap-2 min-h-[40px]",
    lg: "text-base py-2.5 px-5 gap-2.5 min-h-[46px]",
  };

  // Variants conforming to tokens:
  // Primary: Deep Navy (#003366) with white text
  // Secondary: Teal (#00A8B5 / #008080) outlined / subtle background
  // Ghost: Text-only for low-priority actions (e.g., "Cancel", "Back")
  // Danger: Rose red (#E11D48)
  const variantStyles = {
    primary:
      "bg-[#003366] hover:bg-[#0A4B83] active:bg-[#002244] text-white shadow-xs focus:ring-[#003366]/40 border border-transparent",
    secondary:
      "bg-white hover:bg-[#00A8B5]/10 text-[#008080] border border-[#00A8B5] hover:border-[#008080] active:bg-[#00A8B5]/20 focus:ring-[#00A8B5]/30",
    ghost:
      "bg-transparent hover:bg-slate-100 text-slate-700 hover:text-[#1A1A1A] active:bg-slate-200 focus:ring-slate-300 border border-transparent",
    danger:
      "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs focus:ring-rose-500/30 border border-transparent",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 text-current shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span className="truncate">{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
