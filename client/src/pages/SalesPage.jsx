import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../lib/api";

const STATUS_COLORS = {
  COMPLETED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  REFUNDED: "bg-red-100 text-red-600",
  CANCELLED: "bg-gray-100 text-gray-500",
};

export default function SalesPage() {
  const qc = useQueryClient();

  const { data: sales = [] } = useQuery({
    queryKey: ["sales"],
    queryFn: () => api.get("/sales").then((r) => r.data),
  });

  const refund = useMutation({
    mutationFn: (id) => api.patch(`/sales/${id}/refund`),
    onSuccess: () => { toast.success("Refunded"); qc.invalidateQueries(["sales"]); },
    onError: () => toast.error("Refund failed"),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Sales</h1>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>{["Reference","Cashier","Customer","Total","Payment","Status","Date","Actions"].map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {sales.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{s.reference.slice(0, 8)}…</td>
                <td className="px-4 py-3">{s.user?.name}</td>
                <td className="px-4 py-3">{s.customer?.name || "—"}</td>
                <td className="px-4 py-3 font-medium">₦{s.total.toLocaleString()}</td>
                <td className="px-4 py-3">{s.paymentMethod}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[s.status]}`}>{s.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {s.status === "COMPLETED" && (
                    <button onClick={() => refund.mutate(s.id)} className="text-red-500 hover:underline text-xs">Refund</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
