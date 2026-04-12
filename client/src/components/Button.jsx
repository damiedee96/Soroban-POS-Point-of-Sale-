const variants = {
  primary:   "bg-primary text-white hover:bg-primary-dark",
  danger:    "bg-red-500 text-white hover:bg-red-600",
  outline:   "border border-gray-300 text-gray-700 hover:bg-gray-50",
  ghost:     "text-primary hover:underline",
};

export default function Button({ children, variant = "primary", loading, className = "", ...props }) {
  return (
    <button
      disabled={loading || props.disabled}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? "Loading…" : children}
    </button>
  );
}
