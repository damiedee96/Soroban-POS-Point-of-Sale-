import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "../lib/api";

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value ?? "—"}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { data: summary } = useQuery({
    queryKey: ["report-summary"],
    queryFn: () => api.get("/reports/summary").then((r) => r.data),
  });

  const { data: salesData } = useQuery({
    queryKey: ["sales-period"],
    queryFn: () => {
      const to = new Date().toISOString();
      const from = new Date(Date.now() - 7 * 86400000).toISOString();
      return api.get(`/reports/sales-by-period?from=${from}&to=${to}`).then((r) => r.data);
    },
  });

  const chartData = (salesData || []).map((s) => ({
    date: new Date(s.createdAt).toLocaleDateString(),
    total: s.total,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Revenue" value={summary ? `₦${summary.totalRevenue.toLocaleString()}` : null} />
        <StatCard label="Total Transactions" value={summary?.totalTransactions} />
        <StatCard label="Today Revenue" value={summary ? `₦${summary.todayRevenue.toLocaleString()}` : null} />
        <StatCard label="Today Transactions" value={summary?.todayTransactions} />
        <StatCard label="Customers" value={summary?.totalCustomers} />
        <StatCard label="Products" value={summary?.totalProducts} />
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-sm font-semibold mb-4 text-gray-600">Sales — Last 7 Days</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
