"use client";

import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { InvestigationState } from "@/types/api";
import { Skeleton } from "./ui/Skeleton";
import { formatTimestamp, formatRelativeTime } from "@/lib/utils";
import { SeverityBadge } from "./ui/SeverityBadge";
import { RootCauseResultCard } from "./ui/RootCauseResultCard";
import Link from "next/link";

interface IncidentDetailPageProps {
  incidentId: string;
}

export function IncidentDetailPanel({ incidentId }: IncidentDetailPageProps) {
  const { data: investigation, isLoading, error } = useQuery({
    queryKey: ["incident-investigation", incidentId],
    queryFn: () => apiService.investigateIncident(incidentId),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="card">
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="card">
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error || !investigation || !investigation.data) {
    return (
      <div className="card border-red-500/20">
        <p className="text-red-400">Failed to load incident details</p>
      </div>
    );
  }

  const data = investigation.data;
  const incident = data.incidents[0];

  return (
    <div className="space-y-6">
      {/* Incident Details */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Incident Details</h3>
        {incident ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Incident ID</p>
              <p className="font-mono-ids text-gray-300">{incident.incident_id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Issuer</p>
              <p className="text-gray-300">{incident.issuer}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Issue</p>
              <p className="text-gray-300">{incident.issue}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Severity</p>
              <SeverityBadge severity={incident.severity} />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <p className="text-gray-300">{incident.status}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Created</p>
              <p className="text-gray-300">{formatTimestamp(incident.created_at)}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-gray-300">{incident.description}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-400">No incident data available</p>
        )}
      </div>

      {/* Root Cause Analysis */}
      {data.root_cause && (
        <RootCauseResultCard
          rootCause={data.root_cause}
          recommendation={data.recommendation}
          requiresHumanReview={data.requires_human_review}
        />
      )}

      {/* Affected Payments */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Affected Payments</h3>
        <div className="space-y-2">
          <div className="p-3 bg-background-950 rounded border border-background-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono-ids text-gray-400">PAY_12345</p>
                <p className="text-sm text-gray-500">ICICI - $1,917.69</p>
              </div>
              <Link href="/investigate/PAY_12345" className="btn-secondary text-xs">
                Investigate
              </Link>
            </div>
          </div>
          <div className="p-3 bg-background-950 rounded border border-background-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono-ids text-gray-400">PAY_12346</p>
                <p className="text-sm text-gray-500">HDFC - $845.32</p>
              </div>
              <Link href="/investigate/PAY_12346" className="btn-secondary text-xs">
                Investigate
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
