const variants = {
  green:  "bg-green-100 text-green-700",
  red:    "bg-red-100 text-red-600",
  yellow: "bg-yellow-100 text-yellow-700",
  blue:   "bg-blue-100 text-blue-700",
  gray:   "bg-gray-100 text-gray-500",
};

export default function Badge({ label, color = "gray" }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${variants[color] ?? variants.gray}`}>
      {label}
    </span>
  );
}
