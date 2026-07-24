import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBag, LayoutDashboard, LogOut, User, Package } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { BrandMark } from "../brand/BrandMark";

export function Navbar() {
  const { user, logout } = useAuthStore();
  const { items, toggle } = useCartStore();
  const navigate = useNavigate();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    useCartStore.getState().reset();
    navigate("/");
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand">
          <BrandMark size={36} className="brand-mark" />
          BRANDIAYA
        </Link>

        <nav className="nav-links" aria-label="Primary">
          <NavLink
            to="/#catalog"
            end
            onClick={(e) => {
              if (window.location.pathname === "/") {
                e.preventDefault();
                document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            Catalog
          </NavLink>
          {user && (
            <>
              <NavLink to="/orders">
                <Package size={16} />
                Orders
              </NavLink>
              <NavLink to="/profile">Account</NavLink>
            </>
          )}
          {user?.role === "admin" && (
            <NavLink to="/admin">
              <LayoutDashboard size={16} />
              Admin
            </NavLink>
          )}
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <button type="button" className="icon-btn" onClick={toggle} aria-label="Open cart">
                <ShoppingBag size={20} />
                {count > 0 && <span className="badge">{count}</span>}
              </button>
              <span className="nav-user">
                <User size={16} />
                {user.name}
              </span>
              <button type="button" className="ghost-btn" onClick={handleLogout}>
                <LogOut size={16} />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="ghost-btn">
                Sign in
              </Link>
              <Link to="/signup" className="primary-btn">
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
