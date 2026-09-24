import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function calculateDuration(startDate, endDate, current) {
  if (!startDate) return "";
  const start = new Date(startDate);
  const end = current || !endDate ? new Date() : new Date(endDate);
  const diffMonths =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  const years = Math.floor(diffMonths / 12);
  const months = diffMonths % 12;

  let res = "";
  if (years > 0) res += `${years} yr${years > 1 ? "s" : ""} `;
  if (months > 0) res += `${months} mo${months > 1 ? "s" : ""}`;
  return res.trim() || "1 mo";
}
