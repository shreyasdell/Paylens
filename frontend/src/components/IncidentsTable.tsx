"use client";

import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { Incident } from "@/types/api";
import { Skeleton } from "./ui/Skeleton";
import { SeverityBadge } from "./ui/SeverityBadge";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

export function IncidentsTable() {
  const { data: incidents, isLoading, error } = useQuery({
    queryKey: ["incidents"],
    queryFn: () => apiService.getIncidents(),
  });

  if (isLoading) {
    return (
      <div className="card">
        <Skeleton className="h-64 w-full" />
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
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Issuer</th>
            <th>Issue</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Created</th>
            <th>Updated</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {incidents.data.map((incident: Incident) => (
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
              <td className="text-gray-400">{formatRelativeTime(incident.updated_at)}</td>
              <td>
                <Link
                  href={`/incidents/${incident.incident_id}`}
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
