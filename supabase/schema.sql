-- ============================================================
-- CHILL FILL Restaurant — Supabase Schema
-- ============================================================

-- ── 1. MENU ITEMS ─────────────────────────────────────────
CREATE TABLE menu_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('ข้าว', 'ก๋วยเตี๋ยว', 'ชา', 'กาแฟ')),
  description TEXT,
  image_url   TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 2. MENU SIZES ─────────────────────────────────────────
CREATE TABLE menu_sizes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  size         TEXT NOT NULL CHECK (size IN ('S', 'M', 'L')),
  price        NUMERIC(10,2) NOT NULL,
  UNIQUE (menu_item_id, size)
);

-- ── 3. ORDERS ─────────────────────────────────────────────
CREATE TABLE orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  customer_name TEXT NOT NULL DEFAULT '',
  address       TEXT NOT NULL,
  phone         TEXT NOT NULL,
  total         NUMERIC(10,2) NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'))
);

-- ── 4. ORDER ITEMS ────────────────────────────────────────
CREATE TABLE order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  size         TEXT NOT NULL CHECK (size IN ('S', 'M', 'L')),
  quantity     INT NOT NULL CHECK (quantity > 0),
  price        NUMERIC(10,2) NOT NULL,
  note         TEXT
);

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE menu_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_sizes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- menu_items: ทุกคนอ่านได้
CREATE POLICY "Public read menu_items"
  ON menu_items FOR SELECT USING (true);

-- menu_sizes: ทุกคนอ่านได้
CREATE POLICY "Public read menu_sizes"
  ON menu_sizes FOR SELECT USING (true);

-- orders: ทุกคน insert ได้, authenticated อ่าน/อัปเดตได้
CREATE POLICY "Public insert orders"
  ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Auth read orders"
  ON orders FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Auth update order status"
  ON orders FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- order_items: ทุกคน insert ได้, authenticated อ่านได้
CREATE POLICY "Public insert order_items"
  ON order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Auth read order_items"
  ON order_items FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- ── หมวด "ข้าว" ───────────────────────────────────────────
INSERT INTO menu_items (id, name, category, description, image_url) VALUES
  ('11111111-0000-0000-0000-000000000001', 'ข้าวผัดกุ้ง',   'ข้าว', 'ข้าวผัดกุ้งสด ไข่ไก่ ต้นหอม ราดซอสปรุงรส', null),
  ('11111111-0000-0000-0000-000000000002', 'ข้าวกะเพราหมูสับ','ข้าว', 'หมูสับผัดกะเพรา ไข่ดาว น้ำมันหอยหอม',         null),
  ('11111111-0000-0000-0000-000000000003', 'ข้าวมันไก่',      'ข้าว', 'ไก่ต้มนุ่ม ข้าวมัน น้ำซุปใส น้ำจิ้ม',         null),
  ('11111111-0000-0000-0000-000000000004', 'ข้าวผัดปู',       'ข้าว', 'ข้าวผัดเนื้อปูอัด ไข่ไก่ ซีอิ๊วขาว',            null);

-- ── หมวด "ก๋วยเตี๋ยว" ─────────────────────────────────────
INSERT INTO menu_items (id, name, category, description, image_url) VALUES
  ('22222222-0000-0000-0000-000000000001', 'ก๋วยเตี๋ยวหมูน้ำใส',  'ก๋วยเตี๋ยว', 'เส้นเล็ก/ใหญ่/มาม่า หมูสามชั้น ลูกชิ้น น้ำซุปใสหอม', null),
  ('22222222-0000-0000-0000-000000000002', 'ก๋วยเตี๋ยวเนื้อน้ำตก','ก๋วยเตี๋ยว', 'เนื้อสไลด์นุ่ม เครื่องเทศ น้ำตก รสเข้มข้น',          null),
  ('22222222-0000-0000-0000-000000000003', 'ก๋วยเตี๋ยวไก่น้ำใส',  'ก๋วยเตี๋ยว', 'ไก่ต้ม ลูกชิ้นไก่ น้ำซุปกระดูกไก่',                   null),
  ('22222222-0000-0000-0000-000000000004', 'เย็นตาโฟ',            'ก๋วยเตี๋ยว', 'เส้นเล็ก เต้าหู้ ลูกชิ้น น้ำซุปสีชมพูหวานอมเปรี้ยว',  null);

-- ── หมวด "ชา" ─────────────────────────────────────────────
INSERT INTO menu_items (id, name, category, description, image_url) VALUES
  ('33333333-0000-0000-0000-000000000001', 'ชาไทย',      'ชา', 'ชาไทยต้มเข้มข้น นมข้น กลมกล่อม',         null),
  ('33333333-0000-0000-0000-000000000002', 'ชามะนาว',    'ชา', 'ชาดำเย็น น้ำมะนาวสด หวานซ่า',              null),
  ('33333333-0000-0000-0000-000000000003', 'ชาเขียวนม',  'ชา', 'ชาเขียวญี่ปุ่น นมสด หอมนุ่ม',              null),
  ('33333333-0000-0000-0000-000000000004', 'ชาดำเย็น',   'ชา', 'ชาดำเข้มข้น น้ำตาล บีบมะนาวได้',           null);

-- ── หมวด "กาแฟ" ───────────────────────────────────────────
INSERT INTO menu_items (id, name, category, description, image_url) VALUES
  ('44444444-0000-0000-0000-000000000001', 'อเมริกาโน่', 'กาแฟ', 'เอสเปรสโซ่ผสมน้ำร้อน กลิ่นหอม รสชาตินุ่ม',    null),
  ('44444444-0000-0000-0000-000000000002', 'ลาเต้',      'กาแฟ', 'เอสเปรสโซ่ นมร้อนฟองนุ่ม ไม่หวานมาก',          null),
  ('44444444-0000-0000-0000-000000000003', 'คาปูชิโน่',  'กาแฟ', 'เอสเปรสโซ่ นมร้อน โฟมนม ผงอบเชย',              null),
  ('44444444-0000-0000-0000-000000000004', 'โมคค่า',     'กาแฟ', 'เอสเปรสโซ่ ช็อคโกแลต นมร้อน วิปครีม',          null);

-- ── ราคา S/M/L ────────────────────────────────────────────

-- ข้าว (S=45, M=55, L=65)
INSERT INTO menu_sizes (menu_item_id, size, price) VALUES
  ('11111111-0000-0000-0000-000000000001','S',45),('11111111-0000-0000-0000-000000000001','M',55),('11111111-0000-0000-0000-000000000001','L',65),
  ('11111111-0000-0000-0000-000000000002','S',45),('11111111-0000-0000-0000-000000000002','M',55),('11111111-0000-0000-0000-000000000002','L',65),
  ('11111111-0000-0000-0000-000000000003','S',50),('11111111-0000-0000-0000-000000000003','M',60),('11111111-0000-0000-0000-000000000003','L',70),
  ('11111111-0000-0000-0000-000000000004','S',55),('11111111-0000-0000-0000-000000000004','M',65),('11111111-0000-0000-0000-000000000004','L',75);

-- ก๋วยเตี๋ยว (S=40, M=50, L=60)
INSERT INTO menu_sizes (menu_item_id, size, price) VALUES
  ('22222222-0000-0000-0000-000000000001','S',40),('22222222-0000-0000-0000-000000000001','M',50),('22222222-0000-0000-0000-000000000001','L',60),
  ('22222222-0000-0000-0000-000000000002','S',45),('22222222-0000-0000-0000-000000000002','M',55),('22222222-0000-0000-0000-000000000002','L',65),
  ('22222222-0000-0000-0000-000000000003','S',40),('22222222-0000-0000-0000-000000000003','M',50),('22222222-0000-0000-0000-000000000003','L',60),
  ('22222222-0000-0000-0000-000000000004','S',45),('22222222-0000-0000-0000-000000000004','M',55),('22222222-0000-0000-0000-000000000004','L',65);

-- ชา (S=35, M=45, L=55)
INSERT INTO menu_sizes (menu_item_id, size, price) VALUES
  ('33333333-0000-0000-0000-000000000001','S',35),('33333333-0000-0000-0000-000000000001','M',45),('33333333-0000-0000-0000-000000000001','L',55),
  ('33333333-0000-0000-0000-000000000002','S',35),('33333333-0000-0000-0000-000000000002','M',45),('33333333-0000-0000-0000-000000000002','L',55),
  ('33333333-0000-0000-0000-000000000003','S',40),('33333333-0000-0000-0000-000000000003','M',50),('33333333-0000-0000-0000-000000000003','L',60),
  ('33333333-0000-0000-0000-000000000004','S',30),('33333333-0000-0000-0000-000000000004','M',40),('33333333-0000-0000-0000-000000000004','L',50);

-- กาแฟ (S=45, M=55, L=65)
INSERT INTO menu_sizes (menu_item_id, size, price) VALUES
  ('44444444-0000-0000-0000-000000000001','S',45),('44444444-0000-0000-0000-000000000001','M',55),('44444444-0000-0000-0000-000000000001','L',65),
  ('44444444-0000-0000-0000-000000000002','S',50),('44444444-0000-0000-0000-000000000002','M',60),('44444444-0000-0000-0000-000000000002','L',70),
  ('44444444-0000-0000-0000-000000000003','S',50),('44444444-0000-0000-0000-000000000003','M',60),('44444444-0000-0000-0000-000000000003','L',70),
  ('44444444-0000-0000-0000-000000000004','S',55),('44444444-0000-0000-0000-000000000004','M',65),('44444444-0000-0000-0000-000000000004','L',75);
