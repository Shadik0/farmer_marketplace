# 🌾 AgriMarket — Final Submission Document
### HACK-P309 | Farmer Marketplace | Backend Web Development
### Submitted: 30 October 2026

---

## ✅ Deliverable 1 — Team Details

| # | Full Name | Roll Number | Branch | Role |
|---|-----------|-------------|--------|------|
| 1 | **Gayam Venkata Srinivasulu** ⭐ | 25MVCSCR0013 | CSE (CS) | **Team Leader** |
| 2 | SHADIK ALI | 25MVCAIR0102 | CSE (AI) | Team Member |
| 3 | PITLA PAVAN FANINDRA | 25MVCSCR0044 | CSE (CS) | Team Member |
| 4 | B PARDASARATHI REDDY | 25MVCSCR0004 | CSE (CS) | Team Member |

> **Team Contact:** +91 80748 68505

---

## ✅ Deliverable 2 — Problem Statement

| Field | Details |
|-------|---------|
| **Problem ID** | `HACK-P309` |
| **Title** | Farmer Marketplace |
| **Category** | Agriculture |
| **Difficulty** | Intermediate |
| **Type** | Student Hackathon Prototype |

**Problem Summary:**  
Create an online marketplace where farmers can list produce and buyers (households, retailers, restaurants, wholesalers) can browse available products and place orders directly — eliminating middlemen and providing transparent farm-gate pricing with verified harvest traceability.

---

## ✅ Deliverable 3 — GitHub Repository

| Item | Detail |
|------|--------|
| **Repository Name** | `agrimarket-hack-p309` |
| **Source Code** | `farmer_marketplace/` (complete full-stack project) |

**Project File Structure:**
```
farmer_marketplace/
├── backend/
│   ├── app.py              ← FastAPI REST API (800+ lines, 25+ endpoints)
│   ├── database.py         ← SQLite schema + PRAGMA foreign keys
│   ├── models.py           ← Pydantic v2 request/response models
│   └── seed_data.py        ← 5 farmers, 3 buyers, 17 products, 3 orders
├── frontend/
│   ├── index.html          ← Responsive UI (Tailwind CSS, 814 lines)
│   └── app.js              ← Reactive JS controller (1579 lines)
├── docs/
│   ├── api-documentation.md        ← Full API reference (25 endpoints)
│   ├── postman_collection.json     ← Postman v2.1 collection (12 requests)
│   ├── presentation.html           ← Interactive 12-slide deck
│   ├── presentation_slides.md      ← Slide content & speaker notes
│   ├── demo_video.mp4              ← 720p HD demo video (215 seconds)
│   ├── demo_video_script.md        ← Narration script with timestamps
│   └── video_player.html           ← Web video player page
├── tests/
│   └── test_marketplace.py         ← 9 automated unit tests (all PASS)
├── README.md               ← 17-section project documentation
├── .env.example            ← Environment variable template
├── .gitignore              ← Standard Python + SQLite exclusions
└── render_video.py         ← Video generation script (Pillow + ffmpeg)
```

---

## ✅ Deliverable 4 — Deployment Link

| Environment | URL |
|-------------|-----|
| 🌐 **Live Web App (Public)** | https://hitachi-hostel-musical-tuesday.trycloudflare.com |
| 🎬 **Demo Video Player** | https://hitachi-hostel-musical-tuesday.trycloudflare.com/video |
| 📊 **Presentation Slides** | https://hitachi-hostel-musical-tuesday.trycloudflare.com/presentation |
| 🏠 **Local Network (Wi-Fi)** | http://192.168.0.103:8000 |
| 🏠 **Localhost** | http://localhost:8000 |

> **Hosting:** Cloudflare Quick Tunnel (SSL-terminated) tunnelling to Uvicorn ASGI server bound on `0.0.0.0:8000`. Accessible from any device worldwide.

---

## ✅ Deliverable 5 — Backend API URL

| Item | URL |
|------|-----|
| **Base API URL** | `https://hitachi-hostel-musical-tuesday.trycloudflare.com` |
| **Interactive Swagger Docs** | https://hitachi-hostel-musical-tuesday.trycloudflare.com/docs |
| **OpenAPI JSON Schema** | https://hitachi-hostel-musical-tuesday.trycloudflare.com/openapi.json |

**Key API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users` | List all users (farmers, buyers, admin) |
| `POST` | `/api/users` | Register a new user |
| `GET` | `/api/products` | Browse products with search & filters |
| `POST` | `/api/products` | Farmer: add new produce listing |
| `PUT` | `/api/products/{id}` | Update price / inventory / status |
| `POST` | `/api/orders` | Buyer: place an order (atomic stock check) |
| `GET` | `/api/orders` | List orders by buyer or farmer |
| `PUT` | `/api/orders/{id}/status` | Update order lifecycle status |
| `GET` | `/api/admin/listings` | Admin: moderation queue |
| `PUT` | `/api/admin/listings/{id}/moderate` | Approve / reject listing |
| `GET` | `/api/admin/metrics` | Platform health dashboard metrics |
| `GET` | `/api/analytics/price-trends` | Farm-gate vs. mandi price comparison |
| `POST` | `/api/seed/reset` | Reset demo data to seed state |

---

## ✅ Deliverable 6 — README.md

**File location:** `farmer_marketplace/README.md` (17 complete sections)

**Sections covered in README:**
1. Project Overview & Problem Statement
2. Team Details
3. Tech Stack (FastAPI · SQLite · Tailwind CSS · Vanilla JS)
4. System Architecture Diagram
5. Setup & Installation Instructions
6. Environment Variables (`.env.example`)
7. API Endpoints Reference
8. Database Schema Documentation
9. Seed Data Description (5 farmers, 17 products)
10. Frontend Features (Search, Filters, Cart, Dashboards)
11. Order Lifecycle (5 stages: requested → accepted → ready → completed/cancelled)
12. Business Rules (Stock validation, MOQ, bulk discounts)
13. Testing Guide (9 unit tests)
14. Security & Safety Notes (Simulated payments — no real card data)
15. Known Limitations (Prototype scope)
16. Deployment Instructions
17. License & Contributions

---

## ✅ Deliverable 7 — Demo Video

| Item | Link |
|------|------|
| 🎬 **Web Video Player** | https://hitachi-hostel-musical-tuesday.trycloudflare.com/video |
| ⬇️ **Direct MP4 Download** | https://hitachi-hostel-musical-tuesday.trycloudflare.com/docs-view/demo_video.mp4 |
| 📄 **Video Script** | `farmer_marketplace/docs/demo_video_script.md` |

**Video Details:**
- **Resolution:** 1280×720 (720p HD)
- **Duration:** 215 seconds (~3.5 minutes)
- **Format:** MP4 (H.264 via imageio-ffmpeg)
- **File Size:** 2.9 MB

**Video Structure (5 Parts):**

| Part | Timestamp | Content |
|------|-----------|---------|
| 1 | 0:00–0:30 | Problem Statement & Solution Overview |
| 2 | 0:30–1:20 | Farmer Hub — Listing produce, managing inventory |
| 3 | 1:20–2:10 | Buyer Experience — Search, cart, checkout |
| 4 | 2:10–2:50 | Order Lifecycle — Status progression & farmer acceptance |
| 5 | 2:50–3:35 | Admin Moderation & Price Trends Dashboard |

---

## ✅ Deliverable 8 — PowerPoint Presentation

| Item | Link |
|------|------|
| 🖥️ **Interactive Web Presentation (12 Slides)** | https://hitachi-hostel-musical-tuesday.trycloudflare.com/presentation |
| 📄 **Slide Content & Notes** | `farmer_marketplace/docs/presentation_slides.md` |

**Navigation:** Use `←` / `→` arrow keys or on-screen buttons to advance slides.

**12 Slide Breakdown:**

| Slide | Title |
|-------|-------|
| 1 | Cover — AgriMarket · HACK-P309 · Team |
| 2 | Problem Statement & Market Pain Points |
| 3 | Proposed Solution & Value Proposition |
| 4 | System Architecture Overview |
| 5 | Tech Stack (FastAPI · SQLite · Tailwind · Cloudflare) |
| 6 | Core Features — Farmer Hub & Product Listings |
| 7 | Core Features — Buyer Search, Cart & Checkout |
| 8 | Order Lifecycle — 5-Stage Status Flow |
| 9 | Admin Moderation & Duplicate Detection |
| 10 | Price Trends & Analytics Dashboard |
| 11 | Testing Evidence — 9 Tests Passed |
| 12 | Impact, Scalability & Future Roadmap |

---

## ✅ Deliverable 9 — API Documentation

**File:** `farmer_marketplace/docs/api-documentation.md`  
**Live Interactive Docs:** https://hitachi-hostel-musical-tuesday.trycloudflare.com/docs  
**Postman Collection:** `farmer_marketplace/docs/postman_collection.json`

### Sample API Calls with Responses

#### GET /api/products?status=active
```json
[
  {
    "id": 11,
    "name": "Farm Fresh A2 Gir Cow Raw Milk",
    "category": "Dairy & Honey",
    "price": 68.0,
    "unit": "liter",
    "available_quantity": 70.0,
    "min_order_quantity": 1.0,
    "bulk_discount_qty": 15.0,
    "bulk_discount_percent": 8.0,
    "farm_name": "Happy Cow Artisanal Dairy",
    "farmer_phone": "+91 80748 68505",
    "location": "Anand, Gujarat",
    "organic_certified": true,
    "status": "active"
  }
]
```

#### POST /api/orders (Place an order)
```json
{
  "buyer_id": 6,
  "items": [
    { "product_id": 1, "quantity": 5 }
  ],
  "payment_method": "cash_on_pickup",
  "fulfillment_type": "pickup"
}
```
**Response:**
```json
{
  "id": 4,
  "status": "requested",
  "total_amount": 175.0,
  "farmer_phone": "+91 80748 68505",
  "farm_name": "Green Meadows Organic Farm"
}
```

#### PUT /api/orders/4/status (Farmer accepts order)
```json
{ "status": "accepted", "farmer_id": 1 }
```

#### GET /api/admin/metrics
```json
{
  "total_farmers": 5,
  "total_buyers": 3,
  "active_products": 16,
  "flagged_products": 1,
  "total_orders": 3,
  "gross_merchandise_value": 11125.0,
  "completed_orders": 1
}
```

#### GET /api/analytics/price-trends (Sample)
```json
[
  {
    "name": "Organic Vine-Ripened Tomatoes",
    "category": "Vegetables",
    "farmer_price": 35.0,
    "retail_price": 48.0,
    "buyer_savings_percent": 27.1
  },
  {
    "name": "Hydroponic Baby Spinach",
    "category": "Vegetables",
    "farmer_price": 25.0,
    "retail_price": 38.0,
    "buyer_savings_percent": 34.2
  }
]
```

---

## ✅ Deliverable 10 — Testing Evidence

### Automated Test Results

```
Ran 9 tests in 1.352s
OK  ← ALL TESTS PASSED ✅
```

| # | Test Name | What It Tests | Result |
|---|-----------|---------------|--------|
| 1 | `test_seeded_users_and_products` | ≥5 farmers, ≥15 products in DB | ✅ PASS |
| 2 | `test_stock_limit_enforcement` | Cannot order more than available stock | ✅ PASS |
| 3 | `test_order_placement_deducts_inventory` | Stock reduces atomically after order | ✅ PASS |
| 4 | `test_order_cancellation_restores_inventory` | Cancel restores stock to pool | ✅ PASS |
| 5 | `test_order_lifecycle_flow` | requested→accepted→ready→completed | ✅ PASS |
| 6 | `test_illegal_order_transition_rejected` | Completed order cannot be re-cancelled | ✅ PASS |
| 7 | `test_minimum_order_quantity_enforcement` | Orders below MOQ are rejected | ✅ PASS |
| 8 | `test_bulk_discount_calculation` | Bulk discount applies at threshold qty | ✅ PASS |
| 9 | `test_duplicate_product_detection_and_moderation` | Admin flags duplicate listings | ✅ PASS |

**Test File:** `farmer_marketplace/tests/test_marketplace.py`  
**Test Framework:** Python `unittest` + FastAPI `TestClient`  
**Run Command:** `python -m unittest farmer_marketplace.tests.test_marketplace -v`

### Postman Collection Evidence

**File:** `farmer_marketplace/docs/postman_collection.json`  
**Collection Name:** AgriMarket API — HACK-P309  
**Requests:** 12 (covering success cases + edge/error cases)

| Request | Method | Endpoint |
|---------|--------|----------|
| Browse All Products | GET | `/api/products?status=active` |
| Search by Category | GET | `/api/products?category=Vegetables` |
| Search by Price Range | GET | `/api/products?max_price=500` |
| Get Product by ID | GET | `/api/products/1` |
| Place Order (Success) | POST | `/api/orders` |
| Place Order (Over Stock) | POST | `/api/orders` → 422 Error |
| Advance Order Status | PUT | `/api/orders/1/status` |
| Cancel Order | PUT | `/api/orders/1/status` → cancelled |
| Farmer Dashboard | GET | `/api/orders?farmer_id=1` |
| Buyer Order History | GET | `/api/orders?buyer_id=6` |
| Admin Metrics | GET | `/api/admin/metrics` |
| Reset Demo Data | POST | `/api/seed/reset` |

---

## ✅ Deliverable 11 — Architecture / Database Design

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                  │
│   Browser (index.html + app.js)  ←→  Tailwind CSS + Vanilla JS      │
│   Roles: Farmer | Buyer | Admin  ←→  Role Switcher Dropdown          │
└─────────────────────┬───────────────────────────────────────────────┘
                      │  HTTPS (Cloudflare Tunnel)
┌─────────────────────▼───────────────────────────────────────────────┐
│                    CLOUDFLARE EDGE LAYER                             │
│   hitachi-hostel-musical-tuesday.trycloudflare.com                   │
│   SSL Termination · DDoS Protection · Global CDN                     │
└─────────────────────┬───────────────────────────────────────────────┘
                      │  HTTP/QUIC
┌─────────────────────▼───────────────────────────────────────────────┐
│                     BACKEND LAYER (FastAPI)                          │
│   Uvicorn ASGI  ·  Python 3.12  ·  0.0.0.0:8000                     │
│                                                                       │
│   Routes:                                                             │
│   /api/users          /api/products     /api/orders                  │
│   /api/admin          /api/analytics    /api/seed/reset              │
│   /presentation       /video            /docs  /static               │
│                                                                       │
│   Business Logic:                                                     │
│   • Atomic stock deduction (SQLite transactions)                      │
│   • Order lifecycle state machine                                     │
│   • Bulk discount calculation engine                                  │
│   • Duplicate listing detection (admin moderation)                    │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────────┐
│                    DATABASE LAYER (SQLite)                            │
│   File: backend/marketplace.db   PRAGMA foreign_keys = ON            │
│                                                                       │
│   Tables: users · products · orders · order_items · moderation_logs  │
└─────────────────────────────────────────────────────────────────────┘
```

### Database Schema (ERD)

```
users
─────────────────────────────────────
id            INTEGER  PK AUTOINCREMENT
name          TEXT     NOT NULL
email         TEXT     UNIQUE NOT NULL
role          TEXT     CHECK(farmer|buyer|admin)
phone         TEXT
farm_name     TEXT     (farmers only)
location      TEXT     NOT NULL
address       TEXT
bio           TEXT
rating        REAL     DEFAULT 4.9
avatar_url    TEXT
created_at    TIMESTAMP

products
─────────────────────────────────────
id                    INTEGER  PK
farmer_id             INTEGER  FK → users.id
name                  TEXT
category              TEXT     CHECK(Vegetables|Fruits|Grains & Pulses|Herbs & Spices|Dairy & Honey)
description           TEXT
photo_url             TEXT
unit                  TEXT
price                 REAL
available_quantity    REAL
min_order_quantity    REAL     DEFAULT 1.0
bulk_discount_qty     REAL     DEFAULT 0
bulk_discount_percent REAL     DEFAULT 0
harvest_date          DATE
availability_date     DATE
pickup_delivery       TEXT     CHECK(pickup_only|delivery_only|both)
location              TEXT
organic_certified     INTEGER  DEFAULT 0
pesticide_free        INTEGER  DEFAULT 0
batch_code            TEXT
market_price_estimate REAL
status                TEXT     CHECK(active|paused|sold_out|removed)

orders
─────────────────────────────────────
id              INTEGER  PK
buyer_id        INTEGER  FK → users.id
farmer_id       INTEGER  FK → users.id
total_amount    REAL
payment_method  TEXT     CHECK(cash_on_pickup|cod|demo_upi)
payment_status  TEXT     CHECK(simulated_pending|simulated_paid)
fulfillment_type TEXT    CHECK(pickup|delivery)
status          TEXT     CHECK(requested|accepted|ready|completed|cancelled)
created_at      TIMESTAMP
updated_at      TIMESTAMP

order_items
─────────────────────────────────────
id          INTEGER  PK
order_id    INTEGER  FK → orders.id
product_id  INTEGER  FK → products.id
quantity    REAL
unit_price  REAL
subtotal    REAL

moderation_logs
─────────────────────────────────────
id          INTEGER  PK
product_id  INTEGER  FK → products.id
admin_id    INTEGER  FK → users.id
action      TEXT
reason      TEXT
created_at  TIMESTAMP
```

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend Framework | FastAPI | 0.115+ |
| ASGI Server | Uvicorn | 0.32+ |
| Database | SQLite | 3 (built-in) |
| ORM / Validation | Pydantic v2 | 2.9+ |
| Frontend Styling | Tailwind CSS | CDN |
| Frontend Logic | Vanilla JavaScript | ES2022 |
| Testing | Python unittest + httpx | stdlib |
| Video Generation | Pillow + imageio-ffmpeg | Latest |
| Public Tunnelling | Cloudflare Quick Tunnel | Latest |
| Language | Python 3.12 | 3.12+ |

---

## ✅ Deliverable 12 — Team Contributions

| Member | Name | Roll Number | Branch | Contributions |
|--------|------|-------------|--------|---------------|
| **Team Leader** ⭐ | Gayam Venkata Srinivasulu | 25MVCSCR0013 | CSE (CS) | Project architecture, FastAPI backend design (`app.py`), SQLite schema & foreign key constraints (`database.py`), order lifecycle state machine, deployment strategy, Cloudflare tunnel setup, team coordination |
| **Member 2** | SHADIK ALI | 25MVCAIR0102 | CSE (AI) | Seed data design (5 farmers, 17 products, 3 orders), 9 automated unit tests (`test_marketplace.py`), README.md (17 sections), API documentation, Postman collection (12 requests), demo video generation |
| **Member 3** | PITLA PAVAN FANINDRA | 25MVCSCR0044 | CSE (CS) | Pydantic v2 models (`models.py`), REST API endpoints (products, orders, admin, analytics), bulk discount engine, stock validation logic, admin moderation routes |
| **Member 4** | B PARDASARATHI REDDY | 25MVCSCR0004 | CSE (CS) | Responsive frontend UI (`index.html`), Tailwind CSS theming, JavaScript controller (`app.js`), search & filter engine, cart & checkout flow, 12-slide interactive presentation, multilingual i18n (EN/HI/ES) |

---

## 📊 Platform Metrics (Live)

| Metric | Value |
|--------|-------|
| Farmers registered | 5 |
| Buyers registered | 3 |
| Active product listings | 16 |
| Product categories | 5 |
| Sample orders | 3 |
| Gross Merchandise Value | ₹11,125.00 |
| Completed orders | 1 |
| All endpoints healthy | 10/10 ✅ |
| Automated tests passed | 9/9 ✅ |
| Demo video duration | 215 seconds (3.5 min) |
| Presentation slides | 12 |

---

## 🔗 Quick Reference — All Links

| Resource | URL |
|----------|-----|
| 🌐 Live Web App | https://hitachi-hostel-musical-tuesday.trycloudflare.com |
| 🎬 Demo Video | https://hitachi-hostel-musical-tuesday.trycloudflare.com/video |
| ⬇️ MP4 Download | https://hitachi-hostel-musical-tuesday.trycloudflare.com/docs-view/demo_video.mp4 |
| 📊 Presentation | https://hitachi-hostel-musical-tuesday.trycloudflare.com/presentation |
| 📖 Swagger API Docs | https://hitachi-hostel-musical-tuesday.trycloudflare.com/docs |
| 🔌 Products API | https://hitachi-hostel-musical-tuesday.trycloudflare.com/api/products?status=active |
| 👥 Users API | https://hitachi-hostel-musical-tuesday.trycloudflare.com/api/users |
| 📦 Orders API | https://hitachi-hostel-musical-tuesday.trycloudflare.com/api/orders?buyer_id=6 |
| 📈 Analytics API | https://hitachi-hostel-musical-tuesday.trycloudflare.com/api/analytics/price-trends |
| 🛡️ Admin Metrics | https://hitachi-hostel-musical-tuesday.trycloudflare.com/api/admin/metrics |
