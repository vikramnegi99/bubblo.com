import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

const CartContext = createContext(null);
const KEY = 'bubblo.cart.v1';

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(read);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, [items]);

  // BUBBLO orders are single-product (the backend order holds one product_slug),
  // so the cart is a single line: adding a different product replaces it.
  const add = useCallback((product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === product.slug);
      const line = {
        slug: product.slug,
        name: product.name,
        price: product.price,
        mrp: product.mrp,
        discount: product.discount,
        showDiscount: product.showDiscount,
        image: product.hero?.thumb || product.hero?.url || '',
        quantity: Math.max(1, Math.min(20, (existing ? existing.quantity : 0) + quantity)),
      };
      return [line];
    });
    setDrawerOpen(true);
  }, []);

  const updateQty = useCallback((slug, quantity) => {
    setItems((prev) => prev
      .map((i) => (i.slug === slug ? { ...i, quantity: Math.max(0, Math.min(20, quantity)) } : i))
      .filter((i) => i.quantity > 0));
  }, []);

  const remove = useCallback((slug) => setItems((prev) => prev.filter((i) => i.slug !== slug)), []);
  const clear = useCallback(() => setItems([]), []);

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + (i.mrp || i.price) * i.quantity, 0);
    const discount = items.reduce((s, i) => s + Math.max(0, (i.mrp || i.price) - i.price) * i.quantity, 0);
    const payTotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const count = items.reduce((s, i) => s + i.quantity, 0);
    return { subtotal, discount, payTotal, count };
  }, [items]);

  const value = useMemo(
    () => ({ items, add, updateQty, remove, clear, totals, drawerOpen, setDrawerOpen, count: totals.count }),
    [items, add, updateQty, remove, clear, totals, drawerOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
