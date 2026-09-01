import { cn } from "@/lib/utils";
import { Severity } from "@/types/api";

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const getSeverityStyles = () => {
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
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        getSeverityStyles(),
        className
      )}
    >
      {severity}
    </span>
  );
}
