import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { storeApi } from '../lib/api';

const StoreContext = createContext(null);

const FALLBACK_SETTINGS = {
  brandName: 'BUBBLO',
  tagline: 'Make Moments Magical.',
  heroHeadline: 'Make Moments Magical.',
  heroSubheadline:
    'Bubble wands, bubble guns and glow — little things that turn ordinary moments into memories.',
  contact: { phone: '', email: '', address: '' },
  shippingCharge: 49,
  freeShippingThreshold: 999,
  codEnabled: true,
  currency: 'INR',
  policies: {},
  social: {},
};

export function StoreProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACK_SETTINGS);
  const [products, setProducts] = useState([]);
  const [campaign, setCampaign] = useState({ active: false, isActive: false, showCountdown: false, offers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, p, c] = await Promise.all([
        storeApi.settings().catch(() => ({ settings: FALLBACK_SETTINGS })),
        storeApi.products().catch(() => ({ products: [] })),
        storeApi.campaign().catch(() => ({ campaign: { active: false, isActive: false, showCountdown: false, offers: [] } })),
      ]);
      setSettings({ ...FALLBACK_SETTINGS, ...s.settings });
      setProducts(p.products || []);
      setCampaign(c.campaign || { active: false, isActive: false, showCountdown: false, offers: [] });
    } catch (e) {
      setError(e.message || 'Could not load the store.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const value = useMemo(
    () => ({ settings, products, campaign, loading, error, reload: load,
      productBySlug: (slug) => products.find((p) => p.slug === slug) || null }),
    [settings, products, campaign, loading, error, load]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
