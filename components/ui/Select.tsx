"use client";
import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900",
            "focus:outline-none focus:ring-2 focus:ring-serva-green/30 focus:border-serva-green transition-all appearance-none",
            "disabled:bg-gray-50 disabled:text-gray-500",
            error ? "border-red-300 focus:ring-red-200 focus:border-red-400" : "",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
