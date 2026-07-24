import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { extractApiError } from "../../utils/errors";

export function CartDrawer() {
  const { open, setOpen, items, total, updateQty, removeItem, clear, loading } = useCartStore();
  const { token } = useAuthStore();

  if (!open) return null;

  const onUpdate = async (productId: number, quantity: number) => {
    try {
      await updateQty(productId, quantity);
    } catch (error) {
      toast.error(extractApiError(error));
    }
  };

  const onRemove = async (productId: number) => {
    try {
      await removeItem(productId);
      toast.success("Item removed");
    } catch (error) {
      toast.error(extractApiError(error));
    }
  };

  const onClear = async () => {
    try {
      await clear();
      toast.success("Cart cleared");
    } catch (error) {
      toast.error(extractApiError(error));
    }
  };

  return (
    <div className="drawer-root" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button type="button" className="drawer-backdrop" onClick={() => setOpen(false)} aria-label="Close cart" />
      <aside className="drawer-panel">
        <div className="drawer-head">
          <h2>Your cart</h2>
          <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {!token ? (
          <div className="drawer-empty">
            <p>Sign in to manage your cart.</p>
            <Link to="/login" className="primary-btn" onClick={() => setOpen(false)}>
              Sign in
            </Link>
          </div>
        ) : loading ? (
          <div className="page-center compact">
            <div className="spinner" />
          </div>
        ) : items.length === 0 ? (
          <div className="drawer-empty">
            <p>Your cart is empty.</p>
            <Link to="/" className="primary-btn" onClick={() => setOpen(false)}>
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <ul className="cart-list">
              {items.map((item) => (
                <li key={item.product_id} className="cart-row">
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
                    <p className="cart-name">{item.name}</p>
                    <p className="cart-meta">${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="qty-controls">
                    <button
                      type="button"
                      onClick={() => onUpdate(item.product_id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onUpdate(item.product_id, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      type="button"
                      className="danger-icon"
                      onClick={() => onRemove(item.product_id)}
                      aria-label="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="drawer-foot">
              <div className="total-row">
                <span>Total</span>
                <strong>${total.toFixed(2)}</strong>
              </div>
              <div className="drawer-actions">
                <button type="button" className="ghost-btn" onClick={onClear}>
                  Clear cart
                </button>
                <Link
                  to="/checkout/confirm"
                  className="primary-btn"
                  onClick={() => setOpen(false)}
                >
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
