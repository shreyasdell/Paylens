import { Layout } from "@/components/Layout";
import { PaymentInvestigationSearch } from "@/components/PaymentInvestigationSearch";
import { PaymentInvestigationPanel } from "@/components/PaymentInvestigationPanel";

export default function InvestigatePage() {
  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Payment Investigation</h1>
          <p className="mt-2 text-gray-400">Investigate payment failures and root causes</p>
        </div>
        
        <PaymentInvestigationSearch />
        
        {/* Default view - show recent or instructions */}
        <div className="card">
          <p className="text-gray-400">Enter a payment ID above to start investigation</p>
        </div>
      </div>
    </Layout>
  );
}
