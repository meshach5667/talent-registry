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
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-[0.98] select-none";

    const variants = {
      default:
        "bg-gradient-to-b from-neutral-900 to-neutral-950 text-white hover:from-neutral-800 hover:to-neutral-900 shadow-sm border border-neutral-800",
      secondary:
        "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-200 shadow-2xs",
      outline:
        "bg-white text-neutral-800 border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 shadow-2xs",
      ghost:
        "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950",
      destructive:
        "bg-gradient-to-b from-rose-600 to-rose-700 text-white hover:from-rose-500 hover:to-rose-600 shadow-sm border border-rose-700 focus:ring-rose-500/20",
      success:
        "bg-gradient-to-b from-emerald-600 to-emerald-700 text-white hover:from-emerald-500 hover:to-emerald-600 shadow-sm border border-emerald-700 focus:ring-emerald-500/20",
      gradient:
        "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-sm hover:opacity-95 border border-emerald-600/30",
    };

    const sizes = {
      xs: "h-7 px-2.5 text-[11px] gap-1 rounded-md",
      sm: "h-8.5 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-xs font-semibold gap-2",
      lg: "h-11 px-5 text-sm font-semibold gap-2.5",
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
            className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-current shrink-0"
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
