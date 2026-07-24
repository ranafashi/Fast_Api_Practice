import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, Package, Users } from "lucide-react";

const links = [
  { to: "/admin", end: true, label: "Overview", icon: BarChart3 },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-nav">
        <p className="eyebrow">Admin</p>
        <h1>Dashboard</h1>
        <nav>
          {links.map(({ to, end, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={end}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}
