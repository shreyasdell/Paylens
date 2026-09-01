import { cn } from "@/lib/utils";

interface ErrorCodeBadgeProps {
  code: string;
  className?: string;
}

export function ErrorCodeBadge({ code, className }: ErrorCodeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20",
        className
      )}
    >
      {code}
    </span>
  );
}
