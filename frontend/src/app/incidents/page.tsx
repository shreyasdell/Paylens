import { Layout } from "@/components/Layout";
import { IncidentsTable } from "@/components/IncidentsTable";

export default function IncidentsPage() {
  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Incidents</h1>
          <p className="mt-2 text-gray-400">View and manage payment incidents</p>
        </div>
        
        <IncidentsTable />
      </div>
    </Layout>
  );
}
