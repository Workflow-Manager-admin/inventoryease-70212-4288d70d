import {
  component$,
  useSignal,
  useVisibleTask$,
  $,
} from "@builder.io/qwik";
import styles from "./inventory.module.css";

// Helper: Set your backend API base here! (assume container runs docker-compose so backend is host.docker.internal or use real backend host in production)
const API_BASE = import.meta.env.PUBLIC_INVENTORY_API || "http://localhost:8000/api"; // fallback for development

// Inventory item interface
interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
}

// PUBLIC_INTERFACE
export default component$(() => {
  // Local UI state
  const items = useSignal<InventoryItem[]>([]);
  const loading = useSignal(false);
  const addName = useSignal("");
  const addQty = useSignal("");
  const errorMsg = useSignal("");
  const addError = useSignal("");
  const creating = useSignal(false);
  const deleting = useSignal<number | null>(null);

  // Load inventory from the backend REST API
  const fetchItems = $(async () => {
    loading.value = true;
    errorMsg.value = "";
    try {
      const res = await fetch(`${API_BASE}/inventory/`, { mode: "cors" });
      if (!res.ok) throw new Error(`Failed to fetch items: ${res.status}`);
      const data = await res.json();
      items.value = data;
    } catch (err: any) {
      errorMsg.value = err?.message || "Fetch failed";
    } finally {
      loading.value = false;
    }
  });

  // Load inventory list on mount
  useVisibleTask$(() => {
    fetchItems();
  });

  // Add new item handler
  const addItem = $(async (e: Event) => {
    e.preventDefault();
    addError.value = "";
    const name = addName.value.trim();
    const qty = Number(addQty.value);
    if (!name) {
      addError.value = "Name required";
      return;
    }
    if (!Number.isFinite(qty) || qty < 0) {
      addError.value = "Quantity must be non-negative number";
      return;
    }
    creating.value = true;
    try {
      const res = await fetch(`${API_BASE}/inventory/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, quantity: qty }),
      });
      if (!res.ok) {
        const errResp = await res.json().catch(() => ({}));
        throw new Error(
          errResp?.detail || errResp?.name?.join?.(",") || "Add failed"
        );
      }
      addName.value = "";
      addQty.value = "";
      await fetchItems();
    } catch (err: any) {
      addError.value = err?.message || "Add failed";
    } finally {
      creating.value = false;
    }
  });

  // Delete handler for item
  const deleteItem = $(async (itemId: number) => {
    if (!window.confirm("Delete this item?")) return;
    deleting.value = itemId;
    try {
      const res = await fetch(`${API_BASE}/inventory/${itemId}/`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      await fetchItems();
    } catch (err: any) {
      alert("Delete failed: " + (err?.message || ""));
    } finally {
      deleting.value = null;
    }
  });

  return (
    <div class={styles["inventory-bg"]}>
      <div class={styles["inventory-container"]}>
        <h2 class={styles["inventory-title"]}>Inventory</h2>

        <form
          class={styles["add-form"]}
          preventdefault:submit
          onSubmit$={addItem}
        >
          <input
            class={styles["input-field"]}
            type="text"
            placeholder="Item name"
            name="name"
            value={addName.value}
            onInput$={(e) =>
              (addName.value = (e.target as HTMLInputElement).value)
            }
            required
            disabled={creating.value}
          />
          <input
            class={styles["input-field"]}
            type="number"
            placeholder="Quantity"
            name="quantity"
            min={0}
            value={addQty.value}
            onInput$={(e) =>
              (addQty.value = (e.target as HTMLInputElement).value)
            }
            required
            disabled={creating.value}
          />
          <button
            class={styles["add-btn"]}
            type="submit"
            disabled={creating.value}
          >
            {creating.value ? "Adding..." : "Add Item"}
          </button>
        </form>
        {addError.value && (
          <div style={{ color: "#f44", margin: "0 0 10px 2px", fontSize: "0.96rem" }}>
            {addError.value}
          </div>
        )}

        <div style="margin-top:8px;" />
        {loading.value ? (
          <div>Loading inventory...</div>
        ) : errorMsg.value ? (
          <div style={{ color: "#d22", margin: "17px 0" }}>
            Error: {errorMsg.value}
          </div>
        ) : items.value.length === 0 ? (
          <div style={{ color: "#6c63ff", margin: "22px 0" }}>No items in inventory</div>
        ) : (
          <ul class={styles["inventory-list"]}>
            {items.value.map((item) => (
              <li key={item.id} class={styles["inventory-list-item"]}>
                <span class={styles["item-info"]}>
                  <span class={styles["item-name"]}>{item.name}</span>
                  <span class={styles["item-qty"]}>
                    Qty: {item.quantity}
                  </span>
                </span>
                <button
                  class={styles["delete-btn"]}
                  disabled={deleting.value === item.id}
                  onClick$={() => deleteItem(item.id)}
                  aria-label={"Delete " + item.name}
                >
                  {deleting.value === item.id ? "Deleting..." : "Delete"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
});
