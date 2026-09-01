import { cn } from "@/lib/utils";

interface ConfidenceGaugeProps {
  value: number; // 0 to 1
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ConfidenceGauge({ value, className, size = "md" }: ConfidenceGaugeProps) {
  const percentage = Math.round(value * 100);
  
  const getColor = () => {
    if (value >= 0.9) return "text-green-400";
    if (value >= 0.7) return "text-yellow-400";
    return "text-red-400";
  };

  const getStrokeColor = () => {
    if (value >= 0.9) return "#10b981"; // green
    if (value >= 0.7) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  const getSize = () => {
    switch (size) {
      case "sm": return 48;
      case "md": return 64;
      case "lg": return 80;
      default: return 64;
    }
  };

  const strokeWidth = 4;
  const radius = (getSize() - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value * circumference);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={getSize()}
        height={getSize()}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={getSize() / 2}
          cy={getSize() / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={getSize() / 2}
          cy={getSize() / 2}
          r={radius}
          stroke={getStrokeColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className={cn("absolute font-semibold", getColor())}>
        <span className="text-sm">{percentage}%</span>
      </div>
    </div>
  );
}
