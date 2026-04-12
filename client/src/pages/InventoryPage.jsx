import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../lib/api";

export default function InventoryPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [qty, setQty] = useState("");

  const { data: items = [] } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => api.get("/inventory").then((r) => r.data),
  });

  const adjust = useMutation({
    mutationFn: ({ productId, branchId, quantity }) =>
      api.put(`/inventory/${productId}/${branchId}`, { quantity: parseInt(quantity) }),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries(["inventory"]); setEditing(null); },
    onError: () => toast.error("Update failed"),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Inventory</h1>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>{["Product","SKU","Branch","Qty","Low Stock","Status","Actions"].map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{item.product.name}</td>
                <td className="px-4 py-3 text-gray-500">{item.product.sku}</td>
                <td className="px-4 py-3">{item.branch.name}</td>
                <td className="px-4 py-3">
                  {editing?.id === item.id
                    ? <input type="number" className="w-20 border rounded px-2 py-1" value={qty} onChange={(e) => setQty(e.target.value)} />
                    : item.quantity}
                </td>
                <td className="px-4 py-3">{item.lowStock}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.quantity <= item.lowStock ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                    {item.quantity <= item.lowStock ? "Low Stock" : "OK"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {editing?.id === item.id ? (
                    <div className="flex gap-2">
                      <button onClick={() => adjust.mutate({ productId: item.productId, branchId: item.branchId, quantity: qty })} className="text-primary hover:underline">Save</button>
                      <button onClick={() => setEditing(null)} className="text-gray-400 hover:underline">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditing(item); setQty(item.quantity); }} className="text-primary hover:underline">Adjust</button>
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
