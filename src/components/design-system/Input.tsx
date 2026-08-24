import React from "react";
import { AlertCircle, Check } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isRequired?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      success,
      leftIcon,
      rightIcon,
      isRequired,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

    // Subtle border outline, 8px border-radius, explicit hover/focus states
    let borderClass = "border-slate-300 hover:border-slate-400 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/15";
    if (error) {
      borderClass = "border-rose-500 hover:border-rose-600 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20";
    } else if (success) {
      borderClass = "border-emerald-500 hover:border-emerald-600 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20";
    }

    return (
      <div className="w-full flex flex-col text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-800 mb-1.5 tracking-tight"
          >
            {label}
            {isRequired && <span className="text-rose-500 ml-1 font-bold">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 pointer-events-none text-slate-400 flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full text-sm text-[#1A1A1A] placeholder:text-slate-400 bg-white rounded-[8px] border transition-colors duration-150 py-2.5 px-3.5 focus:outline-none min-h-[40px] ${
              leftIcon ? "pl-10" : ""
            } ${rightIcon || error || success ? "pr-10" : ""} ${borderClass} ${className}`}
            {...props}
          />
          <div className="absolute right-3 pointer-events-none flex items-center gap-1.5">
            {error && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
            {!error && success && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
            {!error && !success && rightIcon && (
              <span className="text-slate-400">{rightIcon}</span>
            )}
          </div>
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  isRequired?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      isRequired,
      className = "",
      id,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

    let borderClass = "border-slate-300 hover:border-slate-400 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/15";
    if (error) {
      borderClass = "border-rose-500 hover:border-rose-600 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20";
    }

    return (
      <div className="w-full flex flex-col text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-800 mb-1.5 tracking-tight"
          >
            {label}
            {isRequired && <span className="text-rose-500 ml-1 font-bold">*</span>}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          rows={rows}
          className={`w-full text-sm text-[#1A1A1A] placeholder:text-slate-400 bg-white rounded-[8px] border transition-colors duration-150 py-2.5 px-3.5 focus:outline-none ${borderClass} ${className}`}
          {...props}
        />
        {error ? (
          <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  isRequired?: boolean;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      isRequired,
      options,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

    let borderClass = "border-slate-300 hover:border-slate-400 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/15";
    if (error) {
      borderClass = "border-rose-500 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20";
    }

    return (
      <div className="w-full flex flex-col text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-800 mb-1.5 tracking-tight"
          >
            {label}
            {isRequired && <span className="text-rose-500 ml-1 font-bold">*</span>}
          </label>
        )}
        <select
          id={inputId}
          ref={ref}
          className={`w-full text-sm text-[#1A1A1A] bg-white rounded-[8px] border transition-colors duration-150 py-2.5 px-3.5 focus:outline-none min-h-[40px] ${borderClass} ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error ? (
          <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Select.displayName = "Select";
