import { Layout } from "@/components/Layout";

export default function DashboardPage() {
  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="mt-2 text-gray-400">Overview of payment operations</p>
      </div>
    </Layout>
  );
}
