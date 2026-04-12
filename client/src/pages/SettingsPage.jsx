import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../lib/api";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";

export default function SettingsPage() {
  const qc = useQueryClient();
  const [branchModal, setBranchModal] = useState(false);
  const [branchForm, setBranchForm] = useState({ name: "", address: "" });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => api.get("/branches").then((r) => r.data),
  });

  const createBranch = useMutation({
    mutationFn: (data) => api.post("/branches", data),
    onSuccess: () => { toast.success("Branch created"); qc.invalidateQueries(["branches"]); setBranchModal(false); setBranchForm({ name: "", address: "" }); },
    onError: (e) => toast.error(e.response?.data?.message || "Error"),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold">Settings</h1>

      {/* Branches */}
      <div className="bg-white rounded-xl shadow p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold">Branches</h2>
          <Button onClick={() => setBranchModal(true)}>+ Add Branch</Button>
        </div>
        <table className="w-full text-sm">
          <thead className="text-gray-500 text-xs uppercase border-b">
            <tr>{["Name", "Address"].map((h) => <th key={h} className="py-2 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {branches.map((b) => (
              <tr key={b.id}>
                <td className="py-2 font-medium">{b.name}</td>
                <td className="py-2 text-gray-500">{b.address ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* About */}
      <div className="bg-white rounded-xl shadow p-5 space-y-2">
        <h2 className="font-semibold">About</h2>
        <p className="text-sm text-gray-500">Soroban POS v1.0.0</p>
        <p className="text-sm text-gray-500">Powered by Stellar / Soroban blockchain</p>
      </div>

      {branchModal && (
        <Modal title="Add Branch" onClose={() => setBranchModal(false)}>
          <div className="space-y-3">
            <Input label="Branch Name" value={branchForm.name} onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })} />
            <Input label="Address" value={branchForm.address} onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })} />
          </div>
          <div className="flex gap-3 mt-5">
            <Button variant="outline" className="flex-1" onClick={() => setBranchModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={createBranch.isPending} onClick={() => createBranch.mutate(branchForm)}>Save</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
