"use client";

import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { TimeSeriesData } from "@/types/api";
import { Skeleton } from "./ui/Skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function DashboardChart() {
  const { data: timeSeriesData, isLoading, error } = useQuery({
    queryKey: ["time-series-data"],
    queryFn: () => apiService.getTimeSeriesData(),
    refetchInterval: 30000, // Poll every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="card h-80">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (error || !timeSeriesData || !timeSeriesData.data) {
    return (
      <div className="card h-80 border-red-500/20">
        <p className="text-red-400 text-sm">Failed to load chart data</p>
      </div>
    );
  }

  const chartData = timeSeriesData.data.map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    successRate: (item.success_rate * 100).toFixed(1),
    failureRate: (item.failure_rate * 100).toFixed(1),
    timeoutRate: (item.timeout_rate * 100).toFixed(1),
  }));

  return (
    <div className="card h-80">
      <h3 className="text-lg font-semibold text-white mb-4">Payment Metrics (24h)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="time" 
            stroke="#94a3b8"
            fontSize={12}
          />
          <YAxis 
            stroke="#94a3b8"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
            }}
            itemStyle={{ color: '#e2e8f0' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="successRate" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Success Rate %"
          />
          <Line 
            type="monotone" 
            dataKey="failureRate" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="Failure Rate %"
          />
          <Line 
            type="monotone" 
            dataKey="timeoutRate" 
            stroke="#f59e0b" 
            strokeWidth={2}
            name="Timeout Rate %"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
