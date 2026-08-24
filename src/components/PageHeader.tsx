import React from "react";
import { ChevronRight, Home } from "lucide-react";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; onClick?: () => void }[];
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: "primary" | "secondary";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  tag?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  primaryAction,
  secondaryAction,
  tag,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 py-6 px-4 sm:px-6 lg:px-8 mb-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs if provided */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-1 text-xs text-slate-500 mb-2.5 font-medium">
            <span className="flex items-center gap-1 text-slate-400">
              <Home className="w-3.5 h-3.5" />
              <span>Portal</span>
            </span>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {crumb.onClick ? (
                  <button
                    onClick={crumb.onClick}
                    className="hover:text-[#003366] hover:underline cursor-pointer transition-colors"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-slate-800 font-semibold">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Title, Subtitle, and Primary Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-[#003366] sm:text-3xl">
                {title}
              </h2>
              {tag}
            </div>
            {subtitle && (
              <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          {(primaryAction || secondaryAction) && (
            <div className="flex items-center gap-3 shrink-0">
              {secondaryAction && (
                <button
                  type="button"
                  onClick={secondaryAction.onClick}
                  className="inline-flex items-center justify-center text-sm font-medium rounded-[8px] border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 py-2 px-4 gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  {secondaryAction.icon}
                  <span>{secondaryAction.label}</span>
                </button>
              )}

              {primaryAction && (
                <button
                  type="button"
                  onClick={primaryAction.onClick}
                  className={`inline-flex items-center justify-center text-sm font-medium rounded-[8px] py-2 px-4 gap-2 transition-colors cursor-pointer shadow-xs ${
                    primaryAction.variant === "secondary"
                      ? "border border-[#00A8B5] text-[#008080] bg-white hover:bg-[#00A8B5]/10"
                      : "bg-[#003366] hover:bg-[#0A4B83] text-white"
                  }`}
                >
                  {primaryAction.icon}
                  <span>{primaryAction.label}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
