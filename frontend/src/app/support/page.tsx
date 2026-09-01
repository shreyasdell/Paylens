import { Layout } from "@/components/Layout";
import { SupportChat } from "@/components/SupportChat";

export default function SupportPage() {
  return (
    <Layout>
      <div className="p-4 lg:p-8">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-xl lg:text-2xl font-semibold text-white">Support Assistant</h1>
          <p className="mt-2 text-gray-400 text-sm lg:text-base">AI-powered support for payment issues and customer queries</p>
        </div>
        
        <SupportChat />
      </div>
    </Layout>
  );
}
