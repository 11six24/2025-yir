-- D1 Database Schema for Ambassador Year in Review

-- Main ambassadors table
CREATE TABLE IF NOT EXISTS ambassadors (
  uuid TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  program TEXT,
  revenue INTEGER DEFAULT 0,
  orders INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  commission INTEGER DEFAULT 0,
  ranking_overall INTEGER,
  ranking_revenue INTEGER,
  ranking_orders INTEGER,
  ranking_clicks INTEGER,
  archetype_title TEXT,
  archetype_description TEXT,
  first_order TEXT,
  best_month TEXT,
  total_logins INTEGER,
  last_active TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Top models table (one-to-many relationship)
CREATE TABLE IF NOT EXISTS top_models (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ambassador_uuid TEXT NOT NULL,
  rank INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  product_image_url TEXT,
  count INTEGER NOT NULL,
  FOREIGN KEY (ambassador_uuid) REFERENCES ambassadors(uuid)
);

-- Referrals table (imported from Excel)
CREATE TABLE IF NOT EXISTS referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  order_name TEXT,
  affiliate_email TEXT NOT NULL,
  date TEXT,
  total_sales REAL,
  commission REAL,
  quantity_product INTEGER,
  customer_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Processing queue/status
CREATE TABLE IF NOT EXISTS processing_status (
  ambassador_uuid TEXT PRIMARY KEY,
  status TEXT NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
  started_at DATETIME,
  completed_at DATETIME,
  error_message TEXT,
  FOREIGN KEY (ambassador_uuid) REFERENCES ambassadors(uuid)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ambassadors_email ON ambassadors(email);
CREATE INDEX IF NOT EXISTS idx_top_models_uuid ON top_models(ambassador_uuid);
CREATE INDEX IF NOT EXISTS idx_referrals_email ON referrals(affiliate_email);
CREATE INDEX IF NOT EXISTS idx_referrals_order ON referrals(order_id);
CREATE INDEX IF NOT EXISTS idx_processing_status ON processing_status(status);
