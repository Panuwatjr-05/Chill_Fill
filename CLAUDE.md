# CHILL FILL — Restaurant Ordering App

เว็บแอปสั่งอาหารออนไลน์สำหรับร้าน CHILL FILL ขายอาหารและเครื่องดื่ม

---

## Stack

| ชั้น | เทคโนโลยี |
|------|-----------|
| Frontend | React 19 + Vite 6 |
| Database | Supabase (PostgreSQL + RLS) |
| Hosting | Vercel (SPA rewrite ใน `vercel.json`) |
| Notification | LINE Messaging API (Push Message) |

---

## โครงสร้างโฟลเดอร์

```
src/
├── components/
│   ├── CategoryTabs.jsx   — แท็บกรองหมวดหมู่
│   ├── MenuCard.jsx       — การ์ดเมนูในกริด
│   ├── Navbar.jsx         — แถบด้านบน + ไอคอนตะกร้า
│   └── SearchBar.jsx      — ช่องค้นหาเมนู
├── context/
│   └── CartContext.jsx    — global cart state (useReducer)
├── hooks/
│   └── useMenu.js         — ดึงเมนูทั้งหมดจาก Supabase
├── pages/
│   ├── MenuPage.jsx       — หน้าหลัก (กริด + ค้นหา + แท็บ)
│   ├── ItemDetailPage.jsx — รายละเอียดเมนู + เลือก S/M/L
│   ├── CartPage.jsx       — ตะกร้าสินค้า
│   ├── CheckoutPage.jsx   — กรอกข้อมูลจัดส่ง + ยืนยัน
│   └── OrderSuccessPage.jsx — หน้าสำเร็จ
├── services/
│   ├── supabase.js        — Supabase client
│   ├── line.js            — LINE Push Message
│   └── orderService.js    — placeOrder() รวม insert + notify
├── App.jsx                — Router + CartProvider
├── index.css              — Global styles (design tokens)
└── main.jsx               — Entry point

supabase/
└── schema.sql             — DDL + RLS + sample data

vercel.json                — SPA rewrite rules
.env.example               — ตัวแปรที่ต้องตั้งค่า
```

---

## Supabase Schema

### `menu_items`
| คอลัมน์ | ประเภท | หมายเหตุ |
|---------|--------|---------|
| id | UUID PK | gen_random_uuid() |
| name | TEXT | ชื่อเมนู |
| category | TEXT | `ข้าว` / `ก๋วยเตี๋ยว` / `ชา` / `กาแฟ` |
| description | TEXT | คำอธิบาย |
| image_url | TEXT | nullable |
| is_available | BOOLEAN | default true |

### `menu_sizes`
| คอลัมน์ | ประเภท | หมายเหตุ |
|---------|--------|---------|
| id | UUID PK | |
| menu_item_id | UUID FK | → menu_items |
| size | TEXT | `S` / `M` / `L` |
| price | NUMERIC(10,2) | ราคาแต่ละขนาด |

### `orders`
| คอลัมน์ | ประเภท | หมายเหตุ |
|---------|--------|---------|
| id | UUID PK | |
| created_at | TIMESTAMPTZ | default now() |
| customer_name | TEXT | |
| address | TEXT | |
| phone | TEXT | |
| total | NUMERIC(10,2) | |
| status | TEXT | `pending`/`confirmed`/`preparing`/`delivering`/`completed`/`cancelled` |

### `order_items`
| คอลัมน์ | ประเภท | หมายเหตุ |
|---------|--------|---------|
| id | UUID PK | |
| order_id | UUID FK | → orders |
| menu_item_id | UUID FK | → menu_items |
| size | TEXT | S/M/L |
| quantity | INT | > 0 |
| price | NUMERIC(10,2) | ราคา ณ เวลาสั่ง |
| note | TEXT | nullable |

### RLS Policies
- **menu_items / menu_sizes** — ทุกคนอ่านได้ (SELECT public)
- **orders** — ทุกคน INSERT, authenticated SELECT + UPDATE status
- **order_items** — ทุกคน INSERT, authenticated SELECT

---

## Environment Variables

คัดลอก `.env.example` → `.env.local` แล้วกรอกค่า:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# LINE Messaging API (Channel Access Token + User/Group ID ที่จะรับแจ้งเตือน)
VITE_LINE_CHANNEL_ACCESS_TOKEN=your-channel-access-token
VITE_LINE_USER_ID=your-line-user-id-or-group-id
```

> **Vercel** — ตั้งค่า env ใน Project Settings > Environment Variables ด้วยค่าเดียวกัน

---

## คำสั่ง

```bash
npm run dev      # รัน dev server (localhost:5173)
npm run build    # build สำหรับ production
npm run preview  # preview build ก่อน deploy
```

---

## UI Convention

- **ภาษาไทย** ทั้งหมด (label, placeholder, error message)
- **สีหลัก**: `#FF6B35` (ส้ม) — ใช้ CSS variable `--primary`
- ตัวแปรสีทั้งหมดอยู่ใน `:root` ของ `src/index.css`
- ไม่มี UI library ภายนอก — ใช้ CSS ล้วน
- ขนาดสูงสุด content: `max-width: 560px` (mobile-first)
- ฟอนต์: `Segoe UI`, `Noto Sans Thai`, system-ui

---

## Coding Convention

- **ไฟล์ Component**: `PascalCase.jsx`
- **ไฟล์ service/hook**: `camelCase.js`
- **ไม่มี default export ซ้อน** — 1 ไฟล์ 1 component/function หลัก
- **ไม่ใช้ TypeScript** — plain JavaScript
- **State management**: React Context + useReducer (ไม่ใช้ Redux)
- **Data fetching**: Supabase JS client โดยตรง (ไม่ใช้ React Query)
- **ไม่เขียน comment** ยกเว้น WHY ที่ไม่ชัดเจน
- CSS class ตั้งชื่อ `kebab-case` ตาม BEM-lite (block-element)
- ไม่ใช้ inline style ยกเว้นกรณีที่ค่ามาจาก dynamic variable

---

## Flow การสั่งซื้อ

```
MenuPage → ItemDetailPage → CartPage → CheckoutPage
         (เลือก S/M/L)    (แก้จำนวน)  → placeOrder()
                                           ├─ INSERT orders
                                           ├─ INSERT order_items
                                           └─ notifyNewOrder() → LINE API
                                       → OrderSuccessPage
```

---

## การ Deploy บน Vercel

1. Push โค้ดขึ้น GitHub
2. Import project บน Vercel
3. ตั้งค่า Environment Variables ทั้ง 4 ตัว
4. `vercel.json` จัดการ SPA routing ให้อัตโนมัติ
