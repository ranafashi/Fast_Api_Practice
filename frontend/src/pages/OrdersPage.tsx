import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getMyOrders } from "../api/orders";
import type { Order } from "../types";
import { extractApiError } from "../utils/errors";

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (error) {
        toast.error(extractApiError(error, "Could not load orders"));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Your purchases</p>
          <h1>Orders</h1>
        </div>
        <Link to="/cart" className="ghost-btn">
          Go to cart
        </Link>
      </header>

      {orders.length === 0 ? (
        <div className="empty-state">
          <h2>No orders yet</h2>
          <p>When you checkout, your orders will appear here.</p>
          <Link to="/#catalog" className="primary-btn">
            Browse catalog
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <Link
              key={order.order_id}
              to={`/orders/${order.order_id}`}
              className="order-card"
            >
              <div>
                <p className="order-id">#{order.order_id.slice(0, 8)}</p>
                <p className="hint">{formatDate(order.created_at)}</p>
              </div>
              <div className="order-card-meta">
                <span className="status-pill">{order.status}</span>
                <strong>${order.total.toFixed(2)}</strong>
                <span className="hint">
                  {order.items.length} item{order.items.length === 1 ? "" : "s"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
