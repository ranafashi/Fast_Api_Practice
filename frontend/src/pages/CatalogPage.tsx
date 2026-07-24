import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getProducts, getProductsByCategory } from "../api/products";
import type { Product } from "../types";
import { ProductCard } from "../components/catalog/ProductCard";
import { BrandMark } from "../components/brand/BrandMark";
import { extractApiError } from "../utils/errors";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";

export function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const token = useAuthStore((s) => s.token);
  const fetchCart = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getProducts();
        if (!cancelled) setProducts(data);
      } catch (error) {
        if (!cancelled) {
          setProducts([]);
          toast.error(extractApiError(error, "No products found"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (token) {
      fetchCart().catch(() => undefined);
    }
  }, [token, fetchCart]);

  useEffect(() => {
    if (window.location.hash === "#catalog") {
      document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [loading]);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["all", ...Array.from(set).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = category === "all" || p.category === category;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, category, search]);

  const onCategoryClick = async (value: string) => {
    setCategory(value);
    if (value === "all") return;
    try {
      await getProductsByCategory(value);
    } catch {
      // Local filter still works; endpoint is optional enrichment
    }
  };

  return (
    <div className="catalog-page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">BRANDIAYA</p>
          <h1>Goods curated for everyday living</h1>
        </div>
        <div className="hero-visual">
          <BrandMark className="hero-logo" fill />
        </div>
      </section>

      <section id="catalog" className="catalog-section">
        <div className="catalog-intro">
          <p className="eyebrow">Catalog</p>
          <h2>Shop the collection</h2>
          <p className="hint">
            Sign in to place orders. Checkout creates an order from your cart and
            notifies the store.
          </p>
          <div className="catalog-info-grid">
            <article>
              <h3>Browse by category</h3>
              <p>
                Filter products by category or search by name to find what you need
                quickly.
              </p>
            </article>
            <article>
              <h3>Live stock & pricing</h3>
              <p>
                Each item shows current price and available quantity so you know what
                is in stock before you add it.
              </p>
            </article>
            <article>
              <h3>Cart, checkout & orders</h3>
              <p>
                Add items to your cart, place an order, then track it anytime under
                Orders.
              </p>
            </article>
          </div>
          <p className="catalog-meta">
            {loading
              ? "Loading products…"
              : `${filtered.length} product${filtered.length === 1 ? "" : "s"} shown${
                  category !== "all" ? ` in “${category}”` : ""
                }`}
          </p>
        </div>

        <div className="catalog-toolbar">
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
          <div className="category-row" role="tablist" aria-label="Categories">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={category === cat}
                className={category === cat ? "chip active" : "chip"}
                onClick={() => onCategoryClick(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="page-center">
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <h2>No products match</h2>
            <p>Try another category or clear your search.</p>
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
