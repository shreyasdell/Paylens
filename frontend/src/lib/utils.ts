import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Severity } from "@/types/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString();
}

export function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return "text-green-400";
  if (confidence >= 0.7) return "text-yellow-400";
  return "text-red-400";
}

export function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case Severity.HIGH:
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case Severity.MEDIUM:
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case Severity.LOW:
      return "bg-green-500/10 text-green-400 border-green-500/20";
    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "completed":
    case "resolved":
      return "text-green-400";
    case "failed":
    case "error":
      return "text-red-400";
    case "investigating":
    case "pending":
      return "text-yellow-400";
    default:
      return "text-gray-400";
  }
}
