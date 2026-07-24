import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getOrder } from "../api/orders";
import type { Order } from "../types";
import { extractApiError } from "../utils/errors";

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    (async () => {
      try {
        const data = await getOrder(orderId);
        setOrder(data);
      } catch (error) {
        toast.error(extractApiError(error, "Order not found"));
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="empty-state">
        <h2>Order not found</h2>
        <Link to="/orders" className="primary-btn">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Order detail</p>
          <h1>#{order.order_id.slice(0, 8)}</h1>
          <p className="hint">{formatDate(order.created_at)}</p>
        </div>
        <Link to="/orders" className="ghost-btn">
          All orders
        </Link>
      </header>

      <div className="order-detail-grid">
        <section className="summary-card">
          <h2>Status</h2>
          <span className="status-pill">{order.status}</span>
          <div className="total-row" style={{ marginTop: "1rem" }}>
            <span>Total paid snapshot</span>
            <strong>${order.total.toFixed(2)}</strong>
          </div>
          <p className="hint">Order ID: {order.order_id}</p>
        </section>

        <section className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Line</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={`${item.product_id}-${item.name}`}>
                  <td>
                    <div className="order-item-cell">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="table-thumb"
                        />
                      ) : null}
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td>{item.quantity}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
