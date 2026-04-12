export default function StatCard({ label, value, sub, color = "blue" }) {
  const accent = {
    blue:   "border-blue-500",
    green:  "border-green-500",
    purple: "border-purple-500",
    orange: "border-orange-400",
  }[color] ?? "border-blue-500";

  return (
    <div className={`bg-white rounded-xl shadow p-5 border-l-4 ${accent}`}>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1 text-gray-800">{value ?? "—"}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
