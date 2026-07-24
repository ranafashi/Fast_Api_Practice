import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import toast from "react-hot-toast";
import {
  createProduct,
  deleteProducts,
  getProducts,
  updateProduct,
} from "../../api/products";
import type { Product } from "../../types";
import { extractApiError } from "../../utils/errors";

const emptyForm: Product = {
  id: 0,
  name: "",
  description: "",
  category: "",
  price: 0,
  quantity: 0,
  image_url: "",
};

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Product>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      setProducts([]);
      toast.error(extractApiError(error, "No products found"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setField = <K extends keyof Product>(key: K, value: Product[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload: Product = {
      ...form,
      image_url: form.image_url?.trim() ? form.image_url.trim() : null,
    };
    try {
      if (editingId !== null) {
        await updateProduct(editingId, payload);
        toast.success("Product updated");
      } else {
        await createProduct(payload);
        toast.success("Product created");
      }
      resetForm();
      await load();
    } catch (error) {
      toast.error(extractApiError(error));
    }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({ ...product });
  };

  const onDeleteOne = async (id: number) => {
    try {
      await deleteProducts([id]);
      toast.success("Product deleted");
      await load();
    } catch (error) {
      toast.error(extractApiError(error));
    }
  };

  const onDeleteSelected = async () => {
    if (selected.length === 0) return;
    try {
      await deleteProducts(selected);
      toast.success("Selected products deleted");
      setSelected([]);
      await load();
    } catch (error) {
      toast.error(extractApiError(error));
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Inventory</p>
          <h1>Product management</h1>
        </div>
        {selected.length > 0 && (
          <button type="button" className="danger-btn" onClick={onDeleteSelected}>
            Delete selected ({selected.length})
          </button>
        )}
      </header>

      <div className="admin-split">
        <form className="admin-form" onSubmit={onSubmit}>
          <h2>{editingId !== null ? `Edit #${editingId}` : "Add product"}</h2>
          <label>
            ID
            <input
              type="number"
              required
              disabled={editingId !== null}
              value={form.id || ""}
              onChange={(e) => setField("id", Number(e.target.value))}
            />
          </label>
          <label>
            Name
            <input
              required
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
            />
          </label>
          <label>
            Category
            <input
              required
              value={form.category}
              onChange={(e) => setField("category", e.target.value)}
            />
          </label>
          <label>
            Description
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
            />
          </label>
          <div className="form-grid">
            <label>
              Price
              <input
                type="number"
                step="0.01"
                min={0}
                required
                value={form.price}
                onChange={(e) => setField("price", Number(e.target.value))}
              />
            </label>
            <label>
              Stock qty
              <input
                type="number"
                min={0}
                required
                value={form.quantity}
                onChange={(e) => setField("quantity", Number(e.target.value))}
              />
            </label>
          </div>
          <label>
            Image URL (optional)
            <input
              type="url"
              placeholder="Leave blank to auto-resolve a real photo"
              value={form.image_url ?? ""}
              onChange={(e) => setField("image_url", e.target.value || null)}
            />
          </label>
          {form.image_url ? (
            <img src={form.image_url} alt="Preview" className="admin-image-preview" />
          ) : null}
          <div className="drawer-actions">
            {editingId !== null && (
              <button type="button" className="ghost-btn" onClick={resetForm}>
                Cancel
              </button>
            )}
            <button type="submit" className="primary-btn">
              {editingId !== null ? "Update" : "Create"}
            </button>
          </div>
        </form>

        <div className="table-wrap">
          {loading ? (
            <div className="page-center compact">
              <div className="spinner" />
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th />
                  <th>Image</th>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                      />
                    </td>
                    <td>
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="table-thumb" />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>{p.quantity}</td>
                    <td className="row-actions">
                      <button type="button" className="ghost-btn" onClick={() => startEdit(p)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="danger-btn"
                        onClick={() => onDeleteOne(p.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
