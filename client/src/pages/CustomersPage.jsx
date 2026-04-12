import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../lib/api";

const empty = { name: "", email: "", phone: "" };

export default function CustomersPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  const { data: customers = [] } = useQuery({
    queryKey: ["customers", search],
    queryFn: () => api.get(`/customers?search=${search}`).then((r) => r.data),
  });

  const save = useMutation({
    mutationFn: (data) => editId ? api.put(`/customers/${editId}`, data) : api.post("/customers", data),
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries(["customers"]); closeModal(); },
    onError: (e) => toast.error(e.response?.data?.message || "Error"),
  });

  function openEdit(c) { setForm({ name: c.name, email: c.email || "", phone: c.phone || "" }); setEditId(c.id); setModal(true); }
  function closeModal() { setModal(false); setForm(empty); setEditId(null); }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Customers</h1>
        <button onClick={() => setModal(true)} className="bg-primary text-white px-4 py-2 rounded-lg text-sm">+ Add Customer</button>
      </div>
      <input className="border rounded-lg px-3 py-2 text-sm w-64" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>{["Name","Email","Phone","Loyalty Points","Actions"].map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-gray-500">{c.email || "—"}</td>
                <td className="px-4 py-3">{c.phone || "—"}</td>
                <td className="px-4 py-3">{c.loyaltyPoints}</td>
                <td className="px-4 py-3">
                  <button onClick={() => openEdit(c)} className="text-primary hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="font-bold text-lg mb-4">{editId ? "Edit" : "Add"} Customer</h2>
            <div className="space-y-3">
              {[["name","Name"],["email","Email"],["phone","Phone"]].map(([key, label]) => (
                <div key={key}>
                  <label className="text-sm font-medium">{label}</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={closeModal} className="flex-1 border rounded-lg py-2 text-sm">Cancel</button>
              <button onClick={() => save.mutate(form)} className="flex-1 bg-primary text-white rounded-lg py-2 text-sm">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
