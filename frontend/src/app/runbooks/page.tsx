import { Layout } from "@/components/Layout";
import { RunbooksList } from "@/components/RunbooksList";

export default function RunbooksPage() {
  return (
    <Layout>
      <div className="p-4 lg:p-8">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-xl lg:text-2xl font-semibold text-white">Runbooks</h1>
          <p className="mt-2 text-gray-400 text-sm lg:text-base">Operational procedures and incident response documentation</p>
        </div>
        
        <RunbooksList />
      </div>
    </Layout>
  );
}
