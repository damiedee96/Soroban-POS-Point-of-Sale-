import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "../lib/api";

export default function ReportsPage() {
  const { data: topProducts = [] } = useQuery({
    queryKey: ["top-products"],
    queryFn: () => api.get("/reports/top-products").then((r) => r.data),
  });

  const { data: staff = [] } = useQuery({
    queryKey: ["staff-performance"],
    queryFn: () => api.get("/reports/staff-performance").then((r) => r.data),
  });

  const productChart = topProducts.map((p) => ({
    name: p.product?.name || "Unknown",
    revenue: p._sum?.subtotal || 0,
    qty: p._sum?.quantity || 0,
  }));

  const staffChart = staff.map((s) => ({
    name: s.user?.name || "Unknown",
    revenue: s._sum?.total || 0,
    sales: s._count || 0,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Reports</h1>

      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="font-semibold text-sm text-gray-600 mb-4">Top 10 Products by Revenue</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={productChart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="font-semibold text-sm text-gray-600 mb-4">Staff Performance</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={staffChart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="revenue" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>{["Staff","Total Sales","Revenue"].map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {staffChart.map((s, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3">{s.sales}</td>
                <td className="px-4 py-3">₦{s.revenue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
