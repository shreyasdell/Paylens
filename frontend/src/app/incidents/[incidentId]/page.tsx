import { Layout } from "@/components/Layout";
import { IncidentDetailPanel } from "@/components/IncidentDetailPanel";

interface IncidentDetailPageProps {
  params: Promise<{
    incidentId: string;
  }>;
}

export default async function IncidentDetailPage({ params }: IncidentDetailPageProps) {
  const { incidentId } = await params;
  
  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Incident Details</h1>
          <p className="mt-2 text-gray-400">Investigating incident: <span className="font-mono-ids">{incidentId}</span></p>
        </div>
        
        <IncidentDetailPanel incidentId={incidentId} />
      </div>
    </Layout>
  );
}
