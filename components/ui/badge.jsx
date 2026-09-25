import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, ShieldCheck, Clock, AlertCircle } from "lucide-react";

export function Badge({ children, variant = "default", className, ...props }) {
  const variants = {
    default: "bg-neutral-100 text-neutral-800 border-neutral-200",
    outline: "bg-transparent text-neutral-700 border-neutral-300",
    verified: "bg-emerald-50 text-emerald-800 border-emerald-300 font-medium",
    unverified: "bg-neutral-100 text-neutral-600 border-neutral-200",
    pending: "bg-amber-50 text-amber-800 border-amber-300",
    rejected: "bg-rose-50 text-rose-800 border-rose-300",
    elite: "bg-indigo-50 text-indigo-900 border-indigo-200 font-semibold",
    pro: "bg-sky-50 text-sky-900 border-sky-200 font-medium",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border tracking-tight",
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function VerifiedBadge({ label = "Verified by Employer", className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300",
        className
      )}
    >
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
      <span>{label}</span>
    </span>
  );
}

export function UnverifiedBadge({ label = "Self-Reported", className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-normal bg-neutral-100 text-neutral-600 border border-neutral-300",
        className
      )}
    >
      <Clock className="w-3 h-3 text-neutral-400" />
      <span>{label}</span>
    </span>
  );
}
