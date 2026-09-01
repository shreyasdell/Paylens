"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ConfidenceGauge } from "./ConfidenceGauge";
import { ErrorCodeBadge } from "./ErrorCodeBadge";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { RootCause, Recommendation } from "@/types/api";

interface RootCauseResultCardProps {
  rootCause: RootCause;
  recommendation?: Recommendation;
  requiresHumanReview?: boolean;
  className?: string;
}

export function RootCauseResultCard({ 
  rootCause, 
  recommendation, 
  requiresHumanReview,
  className 
}: RootCauseResultCardProps) {
  const [copiedInternal, setCopiedInternal] = useState(false);
  const [copiedCustomer, setCopiedCustomer] = useState(false);

  const handleCopyInternal = async () => {
    const text = `Root Cause: ${rootCause.category} - ${rootCause.description}\nConfidence: ${(rootCause.confidence * 100).toFixed(1)}%\n\nEvidence:\n${rootCause.evidence_summary.join('\n')}`;
    await navigator.clipboard.writeText(text);
    setCopiedInternal(true);
    setTimeout(() => setCopiedInternal(false), 2000);
  };

  const handleCopyCustomer = async () => {
    const text = recommendation?.action || rootCause.description;
    await navigator.clipboard.writeText(text);
    setCopiedCustomer(true);
    setTimeout(() => setCopiedCustomer(false), 2000);
  };

  return (
    <div className={cn("card", className)}>
      {/* Human Review Banner */}
      {requiresHumanReview && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium text-yellow-400 mb-1">Human Review Required</h4>
            <p className="text-sm text-gray-300">
              This investigation requires manual review before taking action.
            </p>
            <button className="mt-2 text-sm text-yellow-400 hover:text-yellow-300 font-medium">
              Escalate to On-call →
            </button>
          </div>
        </div>
      )}

      {/* Root Cause Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">Root Cause Analysis</h3>
          <div className="flex items-center gap-3">
            <ErrorCodeBadge code={rootCause.category} />
            <span className="text-gray-300">{rootCause.description}</span>
          </div>
        </div>
        <ConfidenceGauge value={rootCause.confidence} size="lg" />
      </div>

      {/* Evidence Summary */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-400 mb-2">Evidence Summary</h4>
        <ul className="space-y-1">
          {rootCause.evidence_summary.map((evidence, index) => (
            <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
              <span className="text-gray-500">•</span>
              {evidence}
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendation */}
      {recommendation && (
        <div className="mb-4 p-4 bg-background-950 rounded-lg border border-background-800">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-400">Recommended Action</h4>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded",
              recommendation.priority === "CRITICAL" ? "bg-red-500/10 text-red-400" :
              recommendation.priority === "HIGH" ? "bg-orange-500/10 text-orange-400" :
              "bg-blue-500/10 text-blue-400"
            )}>
              {recommendation.priority}
            </span>
          </div>
          <p className="text-white font-medium mb-2">{recommendation.action}</p>
          <p className="text-sm text-gray-400 mb-3">{recommendation.estimated_impact}</p>
          
          {recommendation.steps && recommendation.steps.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-gray-500 mb-2">Steps:</h5>
              <ol className="space-y-1">
                {recommendation.steps.map((step, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-gray-500">{index + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Copy Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleCopyInternal}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-background-800 hover:bg-background-700 text-gray-300 rounded-lg text-sm font-medium transition-colors border border-background-700"
        >
          {copiedInternal ? (
            <>
              <Check className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Internal RCA
            </>
          )}
        </button>
        <button
          onClick={handleCopyCustomer}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent-purple hover:bg-accent-purple/90 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {copiedCustomer ? (
            <>
              <Check className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Customer Message
            </>
          )}
        </button>
      </div>
    </div>
  );
}
