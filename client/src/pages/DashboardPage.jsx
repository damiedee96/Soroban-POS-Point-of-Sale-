import { useQuery } from "@tanstack/react-query";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";
import api from "../lib/api";
import StatCard from "../components/StatCard";
import Badge from "../components/Badge";

const PIE_COLORS = ["#2563eb", "#7c3aed", "#10b981", "#f59e0b"];

const STATUS_COLOR = { COMPLETED: "green", PENDING: "yellow", REFUNDED: "red", CANCELLED: "gray" };

export default function DashboardPage() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ["report-summary"],
    queryFn: () => api.get("/reports/summary").then((r) => r.data),
  });

  const { data: salesData = [] } = useQuery({
    queryKey: ["sales-period"],
    queryFn: () => {
      const to = new Date().toISOString();
      const from = new Date(Date.now() - 7 * 86400000).toISOString();
      return api.get(`/reports/sales-by-period?from=${from}&to=${to}`).then((r) => r.data);
    },
  });

  const { data: recentSales = [] } = useQuery({
    queryKey: ["sales"],
    queryFn: () => api.get("/sales").then((r) => r.data.slice(0, 8)),
  });

  const { data: topProducts = [] } = useQuery({
    queryKey: ["top-products"],
    queryFn: () => api.get("/reports/top-products").then((r) => r.data.slice(0, 5)),
  });

  // Aggregate line chart by date
  const lineData = salesData.reduce((acc, s) => {
    const date = new Date(s.createdAt).toLocaleDateString();
    const existing = acc.find((d) => d.date === date);
    if (existing) existing.total += s.total;
    else acc.push({ date, total: s.total });
    return acc;
  }, []);

  const pieData = topProducts.map((p) => ({
    name: p.product?.name ?? "Unknown",
    value: p._sum?.subtotal ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <span className="text-sm text-gray-400">{new Date().toDateString()}</span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Revenue"       value={summary ? `₦${summary.totalRevenue.toLocaleString()}` : "…"} color="blue" />
        <StatCard label="Transactions"        value={summary?.totalTransactions ?? "…"} color="purple" />
        <StatCard label="Today Revenue"       value={summary ? `₦${summary.todayRevenue.toLocaleString()}` : "…"} color="green" />
        <StatCard label="Today Transactions"  value={summary?.todayTransactions ?? "…"} color="orange" />
        <StatCard label="Customers"           value={summary?.totalCustomers ?? "…"} color="blue" />
        <StatCard label="Products"            value={summary?.totalProducts ?? "…"} color="purple" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-5">
          <h2 className="text-sm font-semibold text-gray-600 mb-4">Sales — Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => `₦${v.toLocaleString()}`} />
              <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-sm font-semibold text-gray-600 mb-4">Top Products</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={false}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `₦${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="text-sm font-semibold text-gray-600">Recent Sales</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              {["Reference", "Cashier", "Customer", "Total", "Payment", "Status", "Date"].map((h) => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {recentSales.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400">No sales yet</td></tr>
            )}
            {recentSales.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.reference?.slice(0, 8)}…</td>
                <td className="px-4 py-3">{s.user?.name}</td>
                <td className="px-4 py-3">{s.customer?.name ?? "—"}</td>
                <td className="px-4 py-3 font-medium">₦{s.total?.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-500">{s.paymentMethod}</td>
                <td className="px-4 py-3">
                  <Badge label={s.status} color={STATUS_COLOR[s.status] ?? "gray"} />
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
