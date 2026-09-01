"use client";

import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { KPIMetrics } from "@/types/api";
import { Skeleton } from "./ui/Skeleton";
import { TrendingUp, TrendingDown, AlertTriangle, Activity } from "lucide-react";

export function DashboardKPICards() {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ["kpi-metrics"],
    queryFn: () => apiService.getKPIMetrics(),
    refetchInterval: 30000, // Poll every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card">
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !metrics || !metrics.data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card border-red-500/20">
            <p className="text-red-400 text-sm">Failed to load metrics</p>
          </div>
        ))}
      </div>
    );
  }

  const kpiCards = [
    {
      title: "Success Rate",
      value: `${metrics.data.success_rate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Failure Rate",
      value: `${metrics.data.failure_rate.toFixed(1)}%`,
      icon: TrendingDown,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Avg Latency",
      value: `${metrics.data.avg_latency.toFixed(0)}ms`,
      icon: Activity,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Open Incidents",
      value: metrics.data.open_incidents.toString(),
      icon: AlertTriangle,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {kpiCards.map((card, index) => (
        <div key={index} className="card">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs lg:text-sm text-gray-400 mb-1">{card.title}</p>
              <p className="text-lg lg:text-2xl font-bold text-white">{card.value}</p>
            </div>
            <div className={`p-2 lg:p-3 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 lg:h-6 lg:w-6 ${card.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
