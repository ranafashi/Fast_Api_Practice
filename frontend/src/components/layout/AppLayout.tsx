import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { CartDrawer } from "../cart/CartDrawer";

export function AppLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <p>BRANDIAYA — curated commerce</p>
      </footer>
      <CartDrawer />
    </div>
  );
}
