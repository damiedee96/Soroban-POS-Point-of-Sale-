import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

const nav = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/pos",       label: "POS" },
  { to: "/products",  label: "Products" },
  { to: "/inventory", label: "Inventory" },
  { to: "/customers", label: "Customers" },
  { to: "/sales",     label: "Sales" },
  { to: "/reports",   label: "Reports" },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="px-6 py-5 text-xl font-bold tracking-wide border-b border-gray-700">
          Soroban POS
        </div>
        <nav className="flex-1 py-4 space-y-1 px-3">
          {nav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? "bg-primary text-white" : "text-gray-300 hover:bg-gray-700"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-700 text-sm">
          <p className="text-gray-400 truncate">{user?.name}</p>
          <p className="text-gray-500 text-xs">{user?.role}</p>
          <button
            onClick={handleLogout}
            className="mt-2 text-red-400 hover:text-red-300 text-xs"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
