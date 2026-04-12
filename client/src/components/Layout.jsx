import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

const nav = [
  { to: "/dashboard", label: "📊 Dashboard" },
  { to: "/pos",       label: "🛒 POS" },
  { to: "/products",  label: "📦 Products" },
  { to: "/inventory", label: "🗃️ Inventory" },
  { to: "/customers", label: "👥 Customers" },
  { to: "/sales",     label: "💳 Sales" },
  { to: "/reports",   label: "📈 Reports" },
  { to: "/users",     label: "👤 Users" },
  { to: "/settings",  label: "⚙️ Settings" },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="px-5 py-4 border-b border-gray-700">
          <p className="text-lg font-bold tracking-wide">Soroban POS</p>
          <p className="text-xs text-gray-400 mt-0.5">Point of Sale</p>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-white font-medium"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-700">
          <p className="text-sm font-medium text-white truncate">{user?.name}</p>
          <p className="text-xs text-gray-400">{user?.role}</p>
          <button
            onClick={handleLogout}
            className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
