import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "../store/cartStore";
import { extractApiError } from "../utils/errors";

export function CartPage() {
  const { items, total, fetchCart, updateQty, removeItem, clear, loading } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart().catch((error) => toast.error(extractApiError(error)));
  }, [fetchCart]);

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

  if (loading && items.length === 0) {
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
          <p className="eyebrow">Step 1 of 2</p>
          <h1>Shopping cart</h1>
        </div>
        {items.length > 0 && (
          <button type="button" className="ghost-btn" onClick={onClear}>
            Clear all
          </button>
        )}
      </header>

      {items.length === 0 ? (
        <div className="empty-state">
          <h2>Cart is empty</h2>
          <p>Add products from the catalog, then confirm your order.</p>
          <div className="drawer-actions">
            <Link to="/#catalog" className="primary-btn">
              Browse catalog
            </Link>
            <Link to="/orders" className="ghost-btn">
              View orders
            </Link>
          </div>
        </div>
      ) : (
        <div className="cart-page-grid">
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
                  <p>Product ID #{item.product_id}</p>
                </div>
                <p>${item.price.toFixed(2)}</p>
                <div className="qty-controls">
                  <button
                    type="button"
                    onClick={() => onUpdate(item.product_id, item.quantity - 1)}
                  >
                    <Minus size={14} />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => onUpdate(item.product_id, item.quantity + 1)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <p className="line-total">${(item.price * item.quantity).toFixed(2)}</p>
                <button
                  type="button"
                  className="danger-icon"
                  onClick={() => onRemove(item.product_id)}
                  aria-label="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>

          <aside className="summary-card">
            <h2>Order summary</h2>
            <div className="total-row">
              <span>Total</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
            <p className="hint">
              Next you will review and confirm the order. Email notification is sent after
              confirmation.
            </p>
            <button
              type="button"
              className="primary-btn wide"
              onClick={() => navigate("/checkout/confirm")}
            >
              Proceed to confirm
            </button>
            <Link to="/orders" className="ghost-btn wide">
              View past orders
            </Link>
            <Link to="/#catalog" className="ghost-btn wide">
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
