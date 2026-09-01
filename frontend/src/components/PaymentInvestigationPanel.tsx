"use client";

import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { InvestigationState } from "@/types/api";
import { Skeleton } from "./ui/Skeleton";
import { formatCurrency, formatTimestamp } from "@/lib/utils";
import { ErrorCodeBadge } from "./ui/ErrorCodeBadge";
import { AgentTraceStep } from "./ui/AgentTraceStep";
import { EvidenceCard } from "./ui/EvidenceCard";
import { RootCauseResultCard } from "./ui/RootCauseResultCard";

interface PaymentInvestigationPanelProps {
  paymentId: string;
}

export function PaymentInvestigationPanel({ paymentId }: PaymentInvestigationPanelProps) {
  const { data: investigation, isLoading, error } = useQuery({
    queryKey: ["payment-investigation", paymentId],
    queryFn: () => apiService.investigatePayment(paymentId),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card">
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="card">
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="card">
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
        <div className="card">
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !investigation || !investigation.data) {
    return (
      <div className="card border-red-500/20">
        <p className="text-red-400">Failed to load investigation data</p>
      </div>
    );
  }

  const data = investigation.data;

  return (
    <div className="space-y-6">
      {/* 3-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Left Panel: Transaction Summary */}
        <div className="card">
          <h3 className="text-base lg:text-lg font-semibold text-white mb-4">Transaction Summary</h3>
          {data.transaction ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Payment ID</p>
                <p className="font-mono-ids text-gray-300 text-xs">{data.transaction.payment_id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Amount</p>
                <p className="text-white font-semibold">{formatCurrency(data.transaction.amount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Issuer</p>
                <p className="text-gray-300 text-sm">{data.transaction.issuer}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                <p className="text-gray-300 text-sm">{data.transaction.payment_method}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <p className="text-gray-300 text-sm">{data.transaction.status}</p>
              </div>
              {data.transaction.error_code && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Error Code</p>
                  <ErrorCodeBadge code={data.transaction.error_code} />
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 mb-1">Timestamp</p>
                <p className="text-gray-300 text-xs">{formatTimestamp(data.transaction.timestamp)}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No transaction data available</p>
          )}
        </div>

        {/* Center Panel: Agent Trace */}
        <div className="card">
          <h3 className="text-base lg:text-lg font-semibold text-white mb-4">Agent Trace</h3>
          <div className="space-y-4">
            <AgentTraceStep
              status="done"
              title="Triage"
              details="Payment investigation initiated"
              timestamp={data.created_at}
            />
            <AgentTraceStep
              status="done"
              title="Evidence Collection"
              details={`Collected ${data.logs.length} logs, ${data.metrics.length} metrics, ${data.incidents.length} incidents`}
            />
            <AgentTraceStep
              status="done"
              title="Root Cause Analysis"
              details={data.root_cause?.description}
            />
            <AgentTraceStep
              status="done"
              title="Resolution"
              details={data.recommendation?.action}
            />
            <AgentTraceStep
              status="done"
              title="Explanation"
              details="Generated customer and internal explanations"
            />
          </div>
        </div>

        {/* Right Panel: Evidence */}
        <div className="card">
          <h3 className="text-base lg:text-lg font-semibold text-white mb-4">Evidence</h3>
          <div className="space-y-3 max-h-64 lg:max-h-96 overflow-y-auto">
            {data.logs.length > 0 && (
              <EvidenceCard
                source="Log"
                description={`${data.logs.length} log entries found`}
                rawRef={data.logs[0]}
              />
            )}
            {data.metrics.length > 0 && (
              <EvidenceCard
                source="Metric"
                description={`${data.metrics.length} metric data points`}
                rawRef={data.metrics[0]}
              />
            )}
            {data.incidents.length > 0 && (
              <EvidenceCard
                source="Incident"
                description={`${data.incidents.length} related incidents`}
                rawRef={data.incidents[0]}
              />
            )}
            {data.runbook_matches.length > 0 && (
              <EvidenceCard
                source="Runbook"
                description={`${data.runbook_matches.length} relevant runbooks`}
                rawRef={data.runbook_matches[0]}
              />
            )}
            {data.logs.length === 0 && data.metrics.length === 0 && data.incidents.length === 0 && (
              <p className="text-gray-400 text-sm">No evidence collected</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Root Cause Result */}
      {data.root_cause && (
        <RootCauseResultCard
          rootCause={data.root_cause}
          recommendation={data.recommendation}
          requiresHumanReview={data.requires_human_review}
        />
      )}
    </div>
  );
}
