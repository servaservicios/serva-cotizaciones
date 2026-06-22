"use client";
import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={3}
          className={cn(
            "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 resize-none",
            "focus:outline-none focus:ring-2 focus:ring-serva-green/30 focus:border-serva-green transition-all",
            error ? "border-red-300" : "",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
