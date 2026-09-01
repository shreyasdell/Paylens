import { Layout } from "@/components/Layout";
import { DashboardKPICards } from "@/components/DashboardKPICards";
import { DashboardChart } from "@/components/DashboardChart";
import { DashboardIncidentsTable } from "@/components/DashboardIncidentsTable";
import { DashboardFailedPayments } from "@/components/DashboardFailedPayments";

export default function DashboardPage() {
  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="mt-2 text-gray-400">Overview of payment operations and system health</p>
        </div>
        
        <div className="space-y-6">
          {/* KPI Cards */}
          <DashboardKPICards />
          
          {/* Chart and Incidents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardChart />
            <DashboardIncidentsTable />
          </div>
          
          {/* Failed Payments */}
          <DashboardFailedPayments />
        </div>
      </div>
    </Layout>
  );
}
