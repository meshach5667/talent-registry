import React from "react";
import { cn } from "@/lib/utils";
import { ShieldCheck, Clock } from "lucide-react";

export function Badge({ children, variant = "default", className, ...props }) {
  const variants = {
    default: "bg-neutral-100 text-neutral-800 border-neutral-200/80",
    outline: "bg-white text-neutral-700 border-neutral-300 shadow-2xs",
    verified: "bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold shadow-2xs",
    unverified: "bg-neutral-100 text-neutral-600 border-neutral-200",
    pending: "bg-amber-50 text-amber-900 border-amber-300 font-medium",
    rejected: "bg-rose-50 text-rose-800 border-rose-300 font-medium",
    elite: "bg-indigo-50 text-indigo-900 border-indigo-200 font-semibold",
    pro: "bg-emerald-950 text-emerald-400 border-emerald-800 font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border tracking-tight transition-colors",
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
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs",
        className
      )}
    >
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5] shrink-0" />
      <span>{label}</span>
    </span>
  );
}

export function UnverifiedBadge({ label = "Self-Reported", className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-300/80",
        className
      )}
    >
      <Clock className="w-3 h-3 text-neutral-400 shrink-0" />
      <span>{label}</span>
    </span>
  );
}

export function TrustScoreBadge({ score = 85, className }) {
  const isHigh = score >= 80;
  const isMedium = score >= 60 && score < 80;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono shadow-2xs",
        isHigh
          ? "bg-emerald-50 border-emerald-300 text-emerald-950"
          : isMedium
          ? "bg-amber-50 border-amber-300 text-amber-950"
          : "bg-neutral-100 border-neutral-300 text-neutral-900",
        className
      )}
    >
      <ShieldCheck
        className={cn(
          "w-3.5 h-3.5 stroke-[2.5]",
          isHigh ? "text-emerald-600" : isMedium ? "text-amber-600" : "text-neutral-500"
        )}
      />
      <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">
        Trust
      </span>
      <span className="text-xs font-extrabold">{score}</span>
      <span className="text-[10px] text-neutral-400 font-normal">/100</span>
    </div>
  );
}
