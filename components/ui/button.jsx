import React from "react";
import { cn } from "@/lib/utils";

export const Button = React.forwardRef(
  (
    {
      children,
      className,
      variant = "default",
      size = "md",
      disabled = false,
      loading = false,
      type = "button",
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variants = {
      default: "bg-neutral-900 text-white hover:bg-neutral-800 shadow-sm",
      secondary:
        "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-200",
      outline:
        "bg-white text-neutral-800 border border-neutral-300 hover:bg-neutral-50 shadow-xs",
      ghost: "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900",
      destructive:
        "bg-rose-600 text-white hover:bg-rose-700 shadow-sm focus:ring-rose-600",
      success:
        "bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm focus:ring-emerald-700",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9.5 px-4 text-sm gap-2",
      lg: "h-11 px-5 text-base gap-2.5",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
