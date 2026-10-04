// Thin API client. Uses VITE_API_URL when set, otherwise relies on the Vite
// dev proxy (relative /api paths).

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload || {};
    this.fields = (payload && payload.fields) || {};
  }
}

async function request(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let payload = null;
  const text = await res.text();
  if (text) {
    try { payload = JSON.parse(text); } catch { payload = { message: text }; }
  }

  if (!res.ok) {
    throw new ApiError(
      (payload && payload.message) || 'Something went wrong. Please try again.',
      res.status,
      payload
    );
  }
  return payload;
}

export const api = {
  get: (p, token) => request(p, { token }),
  post: (p, body, token) => request(p, { method: 'POST', body, token }),
  put: (p, body, token) => request(p, { method: 'PUT', body, token }),
  patch: (p, body, token) => request(p, { method: 'PATCH', body, token }),
  del: (p, token) => request(p, { method: 'DELETE', token }),
};

export { ApiError };

// ── Storefront endpoints ──────────────────────────────────────
export const storeApi = {
  products: () => api.get('/api/products'),
  product: (slug) => api.get(`/api/products/${slug}`),
  campaign: () => api.get('/api/campaign'),
  settings: () => api.get('/api/settings'),
  createOrder: (payload) => api.post('/api/orders', payload),
  track: (payload) => api.post('/api/orders/track', payload),
  submitReview: (payload) => api.post('/api/reviews', payload),
};

// ── Admin endpoints ───────────────────────────────────────────
export const adminApi = {
  login: (email, password) => api.post('/api/admin/login', { email, password }),
  me: (token) => api.get('/api/admin/me', token),
  products: (token) => api.get('/api/admin/products', token),
  productAssets: (token) => api.get('/api/admin/products/assets', token),
  updateProduct: (slug, patch, token) => api.patch(`/api/admin/products/${slug}`, patch, token),
  orders: (params, token) => {
    const qs = new URLSearchParams(
      Object.entries(params || {}).filter(([, v]) => v !== '' && v !== undefined && v !== null)
    ).toString();
    return api.get(`/api/admin/orders${qs ? `?${qs}` : ''}`, token);
  },
  order: (orderId, token) => api.get(`/api/admin/orders/${orderId}`, token),
  setOrderStatus: (orderId, status, note, token) =>
    api.patch(`/api/admin/orders/${orderId}/status`, { status, note }, token),
  settings: (token) => api.get('/api/admin/settings', token),
  updateSettings: (patch, token) => api.put('/api/admin/settings', patch, token),
  campaign: (token) => api.get('/api/admin/campaign', token),
  updateCampaign: (patch, token) => api.put('/api/admin/campaign', patch, token),
  reviews: (params, token) => {
    const qs = new URLSearchParams(params || {}).toString();
    return api.get(`/api/admin/reviews${qs ? `?${qs}` : ''}`, token);
  },
  approveReview: (id, approved, token) => api.patch(`/api/admin/reviews/${id}`, { approved }, token),
  deleteReview: (id, token) => api.del(`/api/admin/reviews/${id}`, token),
  summary: (token) => api.get('/api/admin/summary', token),
};
