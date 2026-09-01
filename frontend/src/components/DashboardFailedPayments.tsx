"use client";

import { Skeleton } from "./ui/Skeleton";
import { ErrorCodeBadge } from "./ui/ErrorCodeBadge";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

interface FailedPayment {
  payment_id: string;
  amount: number;
  issuer: string;
  error_code: string;
  timestamp: string;
}

// Mock data for failed payments
const mockFailedPayments: FailedPayment[] = [
  {
    payment_id: "PAY_12345",
    amount: 1917.69,
    issuer: "ICICI",
    error_code: "E4015",
    timestamp: "2026-08-31T10:05:35.229486",
  },
  {
    payment_id: "PAY_12346",
    amount: 845.32,
    issuer: "HDFC",
    error_code: "E2012",
    timestamp: "2026-08-31T09:45:12.123456",
  },
  {
    payment_id: "PAY_12347",
    amount: 2341.00,
    issuer: "Axis",
    error_code: "E5003",
    timestamp: "2026-08-31T09:30:45.789012",
  },
];

export function DashboardFailedPayments() {
  const isLoading = false; // Using mock data for now

  if (isLoading) {
    return (
      <div className="card">
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recent Failed Payments</h3>
        <Link href="/investigate" className="text-sm text-purple-400 hover:text-purple-300">
          View all →
        </Link>
      </div>
      <div className="space-y-3">
        {mockFailedPayments.map((payment) => (
          <div
            key={payment.payment_id}
            className="flex items-center justify-between p-3 bg-background-950 rounded border border-background-800 hover:border-background-700 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono-ids text-gray-400">{payment.payment_id}</span>
                <ErrorCodeBadge code={payment.error_code} />
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>{payment.issuer}</span>
                <span>{formatCurrency(payment.amount)}</span>
                <span>{formatRelativeTime(payment.timestamp)}</span>
              </div>
            </div>
            <Link
              href={`/investigate/${payment.payment_id}`}
              className="btn-secondary text-xs"
            >
              Investigate
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
