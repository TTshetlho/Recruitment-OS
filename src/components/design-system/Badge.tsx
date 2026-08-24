import React from "react";

export type BadgeVariant =
  | "applied"
  | "shortlisted"
  | "pending"
  | "in_review"
  | "rejected"
  | "urgent"
  | "draft"
  | "info"
  | "primary"
  | "secondary"
  | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "info",
  size = "md",
  dot = true,
  children,
  className = "",
}) => {
  // Pill structure with single-line whitespace nowrap, 8px/full rounded border
  const sizeStyles = {
    sm: "text-[11px] font-semibold py-0.5 px-2.5 gap-1.5",
    md: "text-xs font-semibold py-1 px-3 gap-2",
  };

  const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
    // Green (Applied / Shortlisted)
    applied: {
      container: "bg-emerald-50 text-emerald-800 border-emerald-200",
      dot: "bg-emerald-500",
    },
    shortlisted: {
      container: "bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400/30",
      dot: "bg-emerald-600",
    },
    // Yellow/Orange (Pending / In Review)
    pending: {
      container: "bg-amber-50 text-amber-800 border-amber-200",
      dot: "bg-amber-500",
    },
    in_review: {
      container: "bg-amber-50 text-amber-900 border-amber-300",
      dot: "bg-amber-600",
    },
    // Red (Rejected / Urgent)
    rejected: {
      container: "bg-rose-50 text-rose-800 border-rose-200",
      dot: "bg-rose-500",
    },
    urgent: {
      container: "bg-rose-50 text-rose-900 border-rose-300 font-bold",
      dot: "bg-rose-600 animate-pulse",
    },
    // Blue (Draft / Info)
    draft: {
      container: "bg-slate-100 text-slate-700 border-slate-200",
      dot: "bg-slate-400",
    },
    info: {
      container: "bg-sky-50 text-sky-800 border-sky-200",
      dot: "bg-sky-500",
    },
    // Brand Tokens
    primary: {
      container: "bg-[#003366]/10 text-[#003366] border-[#003366]/20 font-semibold",
      dot: "bg-[#003366]",
    },
    secondary: {
      container: "bg-[#00A8B5]/10 text-[#008080] border-[#00A8B5]/30 font-semibold",
      dot: "bg-[#00A8B5]",
    },
    neutral: {
      container: "bg-slate-100 text-slate-700 border-slate-200",
      dot: "bg-slate-500",
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.info;

  return (
    <span
      className={`inline-flex items-center rounded-full border whitespace-nowrap transition-colors select-none ${sizeStyles[size]} ${currentVariant.container} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${currentVariant.dot}`} />}
      <span>{children}</span>
    </span>
  );
};
