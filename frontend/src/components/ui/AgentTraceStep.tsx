"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

type AgentStatus = "pending" | "running" | "done" | "error";

interface AgentTraceStepProps {
  status: AgentStatus;
  title: string;
  details?: string;
  className?: string;
  timestamp?: string;
}

export function AgentTraceStep({ status, title, details, className, timestamp }: AgentTraceStepProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-gray-500" />;
      case "running":
        return <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />;
      case "done":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "pending":
        return "border-gray-700";
      case "running":
        return "border-blue-500/50";
      case "done":
        return "border-green-500/50";
      case "error":
        return "border-red-500/50";
      default:
        return "border-gray-700";
    }
  };

  const getTextColor = () => {
    switch (status) {
      case "pending":
        return "text-gray-500";
      case "running":
        return "text-blue-400";
      case "done":
        return "text-green-400";
      case "error":
        return "text-red-400";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className={cn("relative pl-8 pb-6", className)}>
      {/* Timeline line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-background-800" />
      
      {/* Status icon */}
      <div className="absolute left-0 top-0 flex items-center justify-center w-8 h-8 rounded-full bg-background-900 border-2">
        {getStatusIcon()}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className={cn("font-medium", getTextColor())}>{title}</h4>
          {timestamp && (
            <span className="text-xs text-gray-500 font-mono">{timestamp}</span>
          )}
        </div>
        
        {details && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3" />
                Hide details
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                Show details
              </>
            )}
          </button>
        )}
        
        {isExpanded && details && (
          <div className="mt-2 p-3 bg-background-950 rounded border border-background-800">
            <p className="text-sm text-gray-300">{details}</p>
          </div>
        )}
      </div>
    </div>
  );
}
