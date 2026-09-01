"use client";

import { ReactNode } from "react";
import { Skeleton } from "./ui/Skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";

interface LoadingStateProps {
  isLoading: boolean;
  error?: string | null;
  children: ReactNode;
  skeleton?: ReactNode;
  onRetry?: () => void;
}

export function LoadingState({ isLoading, error, children, skeleton, onRetry }: LoadingStateProps) {
  if (isLoading) {
    return skeleton || (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-red-500/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-red-400 font-medium mb-2">Error</h3>
            <p className="text-gray-300 text-sm mb-4">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="btn-secondary text-xs flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}