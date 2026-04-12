import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../lib/api";

const empty = { name: "", sku: "", price: "", costPrice: "", categoryId: "" };

export default function ProductsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get("/products").then((r) => r.data),
  });

  const save = useMutation({
    mutationFn: (data) => editId ? api.put(`/products/${editId}`, data) : api.post("/products", data),
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries(["products"]); closeModal(); },
    onError: (e) => toast.error(e.response?.data?.message || "Error"),
  });

  const remove = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries(["products"]); },
  });

  function openEdit(p) { setForm({ name: p.name, sku: p.sku, price: p.price, costPrice: p.costPrice, categoryId: p.categoryId || "" }); setEditId(p.id); setModal(true); }
  function closeModal() { setModal(false); setForm(empty); setEditId(null); }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Products</h1>
        <button onClick={() => setModal(true)} className="bg-primary text-white px-4 py-2 rounded-lg text-sm">+ Add Product</button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>{["Name","SKU","Price","Cost","Actions"].map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-gray-500">{p.sku}</td>
                <td className="px-4 py-3">₦{p.price.toLocaleString()}</td>
                <td className="px-4 py-3">₦{p.costPrice.toLocaleString()}</td>
                <td className="px-4 py-3 space-x-2">
                  <button onClick={() => openEdit(p)} className="text-primary hover:underline">Edit</button>
                  <button onClick={() => remove.mutate(p.id)} className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="font-bold text-lg mb-4">{editId ? "Edit" : "Add"} Product</h2>
            <div className="space-y-3">
              {[["name","Name"],["sku","SKU"],["price","Price"],["costPrice","Cost Price"]].map(([key, label]) => (
                <div key={key}>
                  <label className="text-sm font-medium">{label}</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={closeModal} className="flex-1 border rounded-lg py-2 text-sm">Cancel</button>
              <button onClick={() => save.mutate({ ...form, price: parseFloat(form.price), costPrice: parseFloat(form.costPrice) })} className="flex-1 bg-primary text-white rounded-lg py-2 text-sm">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
