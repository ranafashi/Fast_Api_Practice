import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getProducts } from "../../api/products";
import { getAllUsers, getUserCountByCity } from "../../api/admin";
import { extractApiError } from "../../utils/errors";

export function AdminDashboardPage() {
  const [stats, setStats] = useState({ products: 0, users: 0, cities: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [products, users, counts] = await Promise.all([
          getProducts().catch(() => []),
          getAllUsers().catch(() => []),
          getUserCountByCity().catch(() => []),
        ]);
        setStats({
          products: products.length,
          users: users.length,
          cities: counts.length,
        });
      } catch (error) {
        toast.error(extractApiError(error));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Control center</p>
          <h1>Overview</h1>
        </div>
      </header>

      {loading ? (
        <div className="page-center compact">
          <div className="spinner" />
        </div>
      ) : (
        <div className="stat-grid">
          <Link to="/admin/products" className="stat-tile">
            <span>Products</span>
            <strong>{stats.products}</strong>
          </Link>
          <Link to="/admin/users" className="stat-tile">
            <span>Registered users</span>
            <strong>{stats.users}</strong>
          </Link>
          <Link to="/admin/analytics" className="stat-tile">
            <span>Cities tracked</span>
            <strong>{stats.cities}</strong>
          </Link>
        </div>
      )}
    </div>
  );
}
