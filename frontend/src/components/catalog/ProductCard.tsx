import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import type { Product } from "../../types";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { extractApiError } from "../../utils/errors";

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const { token } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const inStock = product.quantity > 0;
  const imageSrc = !imgFailed ? product.image_url : null;

  const handleAdd = async () => {
    if (!token) {
      toast.error("Please sign in to add items to your cart.");
      return;
    }
    setBusy(true);
    try {
      await addItem(product.id, qty, product.name);
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      toast.error(extractApiError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="product-card">
      <div className="product-media" data-category={product.category}>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={product.name}
            loading="lazy"
            className="product-image"
            onError={() => setImgFailed(true)}
          />
        ) : null}
        <span className="category-chip">{product.category}</span>
      </div>
      <div className="product-body">
        <h3>{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-meta">
          <span className="price">${product.price.toFixed(2)}</span>
          <span className={inStock ? "stock ok" : "stock out"}>
            {inStock ? `${product.quantity} in stock` : "Out of stock"}
          </span>
        </div>
        <div className="product-actions">
          <label className="qty-field">
            Qty
            <input
              type="number"
              min={1}
              max={Math.max(product.quantity, 1)}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              disabled={!inStock}
            />
          </label>
          <button
            type="button"
            className="primary-btn"
            disabled={!inStock || busy}
            onClick={handleAdd}
          >
            <ShoppingCart size={16} />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
