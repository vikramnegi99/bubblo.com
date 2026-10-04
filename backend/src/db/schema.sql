-- ─────────────────────────────────────────────────────────────
-- BUBBLO database schema (SQLite)
--
-- NOTE: There is intentionally NO OTP / SMS / phone-verification
-- table, column, or provider config anywhere in this schema.
-- COD orders are created immediately and confirmed MANUALLY by
-- the store owner over a phone call.
-- ─────────────────────────────────────────────────────────────

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ── Admin users (bcrypt password hashes, JWT auth) ──────────────
CREATE TABLE IF NOT EXISTS admins (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT,
  role          TEXT NOT NULL DEFAULT 'owner',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Products (3 products) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  slug               TEXT NOT NULL UNIQUE,
  name               TEXT NOT NULL,
  tag                TEXT,
  short_description  TEXT,
  description        TEXT,
  price              INTEGER NOT NULL,             -- selling price, INR (whole rupees)
  mrp                INTEGER NOT NULL,             -- list price, INR
  discount           INTEGER NOT NULL DEFAULT 0,   -- percent, admin-configurable
  visible            INTEGER NOT NULL DEFAULT 1,   -- 0/1 visibility toggle
  hero_image         TEXT,                         -- Cloudinary public_id
  lifestyle_image    TEXT,                         -- Cloudinary public_id
  gallery            TEXT NOT NULL DEFAULT '[]',   -- JSON array of public_ids (order preserved)
  benefits           TEXT NOT NULL DEFAULT '[]',   -- JSON array of {title, text}
  whats_included     TEXT NOT NULL DEFAULT '[]',   -- JSON array of strings
  how_it_works       TEXT NOT NULL DEFAULT '[]',   -- JSON array of {step, text}
  faqs               TEXT NOT NULL DEFAULT '[]',   -- JSON array of {q, a}
  sort_order         INTEGER NOT NULL DEFAULT 0,
  created_at         TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Orders (COD only, created immediately — no OTP step) ────────
CREATE TABLE IF NOT EXISTS orders (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id       TEXT NOT NULL UNIQUE,            -- BB-XXXXXX
  customer_name  TEXT NOT NULL,
  phone          TEXT NOT NULL,                   -- normalized +91XXXXXXXXXX
  email          TEXT,
  house          TEXT NOT NULL,
  street         TEXT NOT NULL,
  landmark       TEXT,
  pincode        TEXT NOT NULL,
  city           TEXT NOT NULL,
  state          TEXT NOT NULL,
  address_type   TEXT NOT NULL DEFAULT 'Home',    -- Home | Work | Other
  product_slug   TEXT NOT NULL,
  product_name   TEXT NOT NULL,
  variant        TEXT,
  quantity       INTEGER NOT NULL DEFAULT 1,
  unit_price     INTEGER NOT NULL DEFAULT 0,
  subtotal       INTEGER NOT NULL DEFAULT 0,
  discount       INTEGER NOT NULL DEFAULT 0,
  shipping_charge INTEGER NOT NULL DEFAULT 0,
  total          INTEGER NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'COD',
  payment_status TEXT NOT NULL DEFAULT 'Pending', -- Pending | Paid
  order_status   TEXT NOT NULL DEFAULT 'New Order',
  notes          TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_phone    ON orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_status   ON orders(order_status);

-- ── Order status audit trail ────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id   TEXT NOT NULL,
  from_status TEXT,
  to_status  TEXT NOT NULL,
  note       TEXT,
  actor      TEXT NOT NULL DEFAULT 'admin',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- ── Settings (key/value JSON) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,                       -- JSON-encoded
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Campaign (single active row, id = 1) ────────────────────────
CREATE TABLE IF NOT EXISTS campaign (
  id          INTEGER PRIMARY KEY CHECK (id = 1),
  name        TEXT,
  headline    TEXT,
  description TEXT,
  accent      TEXT,
  start_date  TEXT,
  end_date    TEXT,                               -- NULL => no countdown ever shown
  active      INTEGER NOT NULL DEFAULT 0,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS campaign_products (
  campaign_id  INTEGER NOT NULL DEFAULT 1,
  product_slug TEXT NOT NULL,
  PRIMARY KEY (campaign_id, product_slug),
  FOREIGN KEY (campaign_id) REFERENCES campaign(id) ON DELETE CASCADE
);

-- ── Reviews (moderated; no fake/seeded reviews) ─────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  product_slug TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  rating      INTEGER NOT NULL DEFAULT 5,
  title       TEXT,
  body        TEXT NOT NULL,
  approved    INTEGER NOT NULL DEFAULT 0,         -- 0 pending, 1 approved
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_slug, approved);
