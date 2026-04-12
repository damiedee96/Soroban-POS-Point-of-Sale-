import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../lib/api";
import Modal from "../components/Modal";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Input from "../components/Input";

const ROLE_COLOR = { ADMIN: "blue", MANAGER: "purple", CASHIER: "green" };
const empty = { name: "", email: "", password: "", role: "CASHIER", branchId: "" };

export default function UsersPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.get("/auth/users").then((r) => r.data),
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => api.get("/branches").then((r) => r.data),
  });

  const create = useMutation({
    mutationFn: (data) => api.post("/auth/register", data),
    onSuccess: () => { toast.success("User created"); qc.invalidateQueries(["users"]); setModal(false); setForm(empty); },
    onError: (e) => toast.error(e.response?.data?.message || "Error"),
  });

  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Staff / Users</h1>
        <Button onClick={() => setModal(true)}>+ Add User</Button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>{["Name", "Email", "Role", "Branch"].map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {users.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No users found</td></tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3"><Badge label={u.role} color={ROLE_COLOR[u.role] ?? "gray"} /></td>
                <td className="px-4 py-3 text-gray-500">{u.branch?.name ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title="Add User" onClose={() => { setModal(false); setForm(empty); }}>
          <div className="space-y-3">
            <Input label="Full Name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
            <Input label="Email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
            <Input label="Password" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} required />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.role} onChange={(e) => set("role", e.target.value)}>
                <option value="CASHIER">Cashier</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Branch</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.branchId} onChange={(e) => set("branchId", e.target.value)}>
                <option value="">— Select Branch —</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <Button variant="outline" className="flex-1" onClick={() => { setModal(false); setForm(empty); }}>Cancel</Button>
            <Button className="flex-1" loading={create.isPending} onClick={() => create.mutate(form)}>Create</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
