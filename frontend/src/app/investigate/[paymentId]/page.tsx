import { Layout } from "@/components/Layout";
import { PaymentInvestigationPanel } from "@/components/PaymentInvestigationPanel";

interface PaymentInvestigationPageProps {
  params: Promise<{
    paymentId: string;
  }>;
}

export default async function PaymentInvestigationPage({ params }: PaymentInvestigationPageProps) {
  const { paymentId } = await params;
  
  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Payment Investigation</h1>
          <p className="mt-2 text-gray-400">Investigating payment: <span className="font-mono-ids">{paymentId}</span></p>
        </div>
        
        <PaymentInvestigationPanel paymentId={paymentId} />
      </div>
    </Layout>
  );
}
