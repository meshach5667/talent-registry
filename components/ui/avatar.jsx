"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { User as UserIcon } from "lucide-react";

export function Avatar({
  src,
  alt = "User",
  name = "",
  size = "md",
  className,
}) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-lg",
    xl: "w-24 h-24 text-2xl",
    "2xl": "w-32 h-32 text-3xl",
  };

  const getInitials = (n) => {
    if (!n) return "";
    const parts = n.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(name || alt);

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center font-medium text-neutral-700 select-none shrink-0",
        sizeClasses[size] || sizeClasses.md,
        className
      )}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : initials ? (
        <span>{initials}</span>
      ) : (
        <UserIcon className="w-1/2 h-1/2 text-neutral-400" />
      )}
    </div>
  );
}
