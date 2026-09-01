"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

type EvidenceSource = "Log" | "Metric" | "Incident" | "Runbook";

interface EvidenceCardProps {
  source: EvidenceSource;
  description: string;
  rawRef?: any;
  className?: string;
}

export function EvidenceCard({ source, description, rawRef, className }: EvidenceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const getSourceColor = () => {
    switch (source) {
      case "Log":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Metric":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "Incident":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "Runbook":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const handleCopy = async () => {
    if (rawRef) {
      await navigator.clipboard.writeText(JSON.stringify(rawRef, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={cn("card", className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
            getSourceColor()
          )}>
            {source}
          </span>
        </div>
        {rawRef && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        )}
      </div>
      
      <p className="text-sm text-gray-300 mb-2">{description}</p>
      
      {isExpanded && rawRef && (
        <div className="mt-3 pt-3 border-t border-background-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-mono">Raw Data</span>
            <button
              onClick={handleCopy}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </button>
          </div>
          <pre className="text-xs text-gray-400 font-mono bg-background-950 p-3 rounded overflow-x-auto">
            {JSON.stringify(rawRef, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
