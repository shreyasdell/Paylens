import { Layout } from "@/components/Layout";
import { SupportChat } from "@/components/SupportChat";

export default function SupportPage() {
  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Support Assistant</h1>
          <p className="mt-2 text-gray-400">AI-powered support for payment issues and customer queries</p>
        </div>
        
        <SupportChat />
      </div>
    </Layout>
  );
}
