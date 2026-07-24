import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { checkout } from "../api/orders";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { extractApiError } from "../utils/errors";

export function ConfirmOrderPage() {
  const { items, total, fetchCart, reset, loading } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const [confirming, setConfirming] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart().catch((error) => toast.error(extractApiError(error)));
  }, [fetchCart]);

  const onConfirm = async () => {
    setConfirming(true);
    try {
      const order = await checkout();
      reset();
      toast.success("Order confirmed — a notification email has been sent.");
      navigate(`/orders/${order.order_id}`, { replace: true });
    } catch (error) {
      toast.error(extractApiError(error, "Could not confirm order"));
    } finally {
      setConfirming(false);
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Step 2 of 2</p>
          <h1>Confirm order</h1>
          <p className="hint">
            Review your items below. Confirming places the order and notifies the store by email.
          </p>
        </div>
        <Link to="/cart" className="ghost-btn">
          Back to cart
        </Link>
      </header>

      <div className="confirm-grid">
        <section className="summary-card">
          <h2>Delivery account</h2>
          <dl className="confirm-dl">
            <div>
              <dt>Name</dt>
              <dd>{user?.name ?? "—"}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user?.email ?? "—"}</dd>
            </div>
            <div>
              <dt>City</dt>
              <dd>{user?.address?.city ?? "—"}</dd>
            </div>
            <div>
              <dt>Postal code</dt>
              <dd>{user?.address?.postal_Code ?? "—"}</dd>
            </div>
          </dl>
          <p className="hint">
            After confirmation, stock is updated, your cart is cleared, and an order email is
            sent for customer placements.
          </p>
        </section>

        <section className="confirm-items">
          <h2>Items to order</h2>
          <ul className="cart-table">
            {items.map((item) => (
              <li key={item.product_id}>
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="cart-thumb"
                    loading="lazy"
                  />
                ) : (
                  <div className="cart-thumb placeholder" aria-hidden="true" />
                )}
                <div>
                  <h3>{item.name}</h3>
                  <p>
                    {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                </div>
                <p className="line-total">${(item.price * item.quantity).toFixed(2)}</p>
              </li>
            ))}
          </ul>

          <aside className="summary-card confirm-total">
            <div className="total-row">
              <span>Order total</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
            <button
              type="button"
              className="primary-btn wide"
              onClick={onConfirm}
              disabled={confirming || items.length === 0}
            >
              {confirming ? "Confirming…" : "Confirm order"}
            </button>
            <Link to="/cart" className="ghost-btn wide">
              Edit cart
            </Link>
          </aside>
        </section>
      </div>
    </div>
  );
}
