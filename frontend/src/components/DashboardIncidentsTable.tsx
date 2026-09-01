"use client";

import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { Incident } from "@/types/api";
import { Skeleton } from "./ui/Skeleton";
import { SeverityBadge } from "./ui/SeverityBadge";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

export function DashboardIncidentsTable() {
  const { data: incidents, isLoading, error } = useQuery({
    queryKey: ["incidents"],
    queryFn: () => apiService.getIncidents(),
    refetchInterval: 30000, // Poll every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="card">
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !incidents || !incidents.data) {
    return (
      <div className="card border-red-500/20">
        <p className="text-red-400 text-sm">Failed to load incidents</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recent Incidents</h3>
        <Link href="/incidents" className="text-sm text-purple-400 hover:text-purple-300">
          View all →
        </Link>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Issuer</th>
            <th>Issue</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {incidents.data.slice(0, 5).map((incident: Incident) => (
            <tr key={incident.incident_id}>
              <td className="font-mono-ids">{incident.incident_id}</td>
              <td>{incident.issuer}</td>
              <td>{incident.issue}</td>
              <td>
                <SeverityBadge severity={incident.severity} />
              </td>
              <td>
                <span className={`text-xs ${
                  incident.status === 'resolved' ? 'text-green-400' :
                  incident.status === 'investigating' ? 'text-yellow-400' :
                  'text-blue-400'
                }`}>
                  {incident.status}
                </span>
              </td>
              <td className="text-gray-400">{formatRelativeTime(incident.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
