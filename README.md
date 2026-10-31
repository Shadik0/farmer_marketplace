# 🌾 AgriMarket — Direct Farm-to-Buyer Marketplace
**Problem Statement ID:** HACK-P309  
**Subject:** BACKEND WEB DEVELOPMENT  
**Team Name:** AgriCoders  
**Project Type:** Full-Stack Web Application (Internal & External Hackathon)  

---

## 1. Project Title
**AgriMarket — Direct Farm-to-Buyer Produce Marketplace**  
**Problem Statement ID:** `HACK-P309` (Category: Agriculture, Intermediate)

---

## 2. Project Overview
**AgriMarket** is an end-to-end full-stack web application designed to connect local farmers directly with household buyers, farm-to-table restaurants, and regional grocery wholesalers. Built with FastAPI, SQLite, and modern responsive frontend technologies, the platform eliminates predatory middleman markups by providing transparent produce listings, verified harvest freshness, strict atomic stock validation, a 5-stage order lifecycle, and an instant multi-role switcher for rapid evaluation.

---

## 3. Problem Statement
In traditional agricultural supply networks, smallholder farmers face severe difficulty reaching direct buyers and communicating real-time produce availability, harvest dates, and transparent prices. 

A multi-layered chain of 3 to 5 intermediaries (village aggregators, commission agents, regional mandi operators, cold-storage middlemen, and retail grocers) extracts up to **35% to 45%** of consumer food spend. Consequently, farmers suffer compressed margins while consumers pay inflated prices for produce that has spent days in transit. Furthermore, consumers lack batch-level provenance, harvest freshness records, or guarantee that orders will be fulfilled without stock discrepancies.

---

## 4. Proposed Solution
AgriMarket solves this problem by providing a direct digital exchange featuring:
1. **Direct Farm Publishing:** Growers publish fresh harvest batches with verifiable dates, pricing, and fulfillment modes (farm gate pickup vs. direct delivery).
2. **Atomic Inventory Management:** Prevents overselling by locking and deducting available quantities atomically during checkout.
3. **Transparent 5-Stage Order Lifecycle:** Orders cleanly traverse `requested` ➔ `accepted` ➔ `ready` ➔ `completed` (or `cancelled`, which atomically restores stock).
4. **Benchmarked Fair Pricing:** Direct comparison of farm gate prices against supermarket retail rates, demonstrating 20–35% buyer savings and 25–40% farmer profit gains.
5. **Traceability & QR Verification:** Real-time generation of batch UUIDs and scannable QR codes showing farm origin, GPS coordinates, and organic certifications.

---

## 5. Features Actually Implemented

### A. Core Functional Features
- **Multi-Role Accounts:** Dedicated interfaces for Farmers, Buyers, and Platform Quality Administrators, with an instant 1-click **Quick Role Switcher** dropdown in the navigation bar.
- **Rich Produce Listings:** Complete metadata including name, category, curated photos, unit (`kg`, `bunch`, `crate`, `bag`, `liter`, `jar`), price per unit, available quantity, minimum order quantity (MOQ), harvest date, shelf-life window, and fulfillment options.
- **Search & Multi-Filter Engine:** Live debounced search across product name, description, farm name, and location; category pill tabs; price range slider; farming region filter; fulfillment selector; and sorting by freshness, price, and farmer rating.
- **Atomic Cart & Checkout:** Real-time stock limit validation preventing orders $> \text{available stock}$.
- **Wholesale Bulk Discounts:** Automated tier calculation (e.g. orders $\ge 50\text{kg}$ receive 10% discount).
- **5-Stage Order Lifecycle Stepper:** Visual tracking stepper (`requested` ➔ `accepted` ➔ `ready` ➔ `completed`) with atomic inventory restoration upon cancellation.
- **Farmer Hub Dashboard:** Real-time KPI metrics (Active Listings, Total Stock, Pending Orders, Revenue), inline inventory and price adjustment, listing publisher with duplicate detection, and incoming order fulfillment stream.
- **Buyer Order Portal:** Itemized receipts, simulated payment status, direct farm contact, and cancellation workflow.
- **Admin Moderation Desk:** Automated duplicate listing detection, moderation queue (`Approve`, `Flag`, `Reject`), and platform GMV metrics.
- **Simulated Payment & Safety Protections:** Prominent prototype notices; supports simulated Cash on Farm Pickup, Cash on Delivery (COD), and Demo Instant UPI. No sensitive banking credentials are ever collected.

### B. Advanced Hackathon Additions
- **Farm Provenance & Scannable QR Codes:** Modal displaying batch UUID (e.g. `BATCH-NSK-2026-081`), soil region, and generated QR code.
- **Fair Price & Mandi Benchmark Analysis:** Dynamic comparison against retail supermarket rates.
- **Multilingual UI Support:** 1-click toggle between **English**, **हिंदी (Hindi)**, and **Español (Spanish)**.
- **1-Click Demo Data Reset:** Header button that resets the SQLite database to the original pristine seed state at any time during live demonstrations.

---

## 6. Technology Stack

- **Backend Framework:** FastAPI (Python 3.12) — High-performance asynchronous ASGI framework with automated OpenAPI / Swagger generation.
- **Database:** SQLite3 with Foreign Key constraints, ACID transactions, and thread-safe connection pooling.
- **Data Validation:** Pydantic v2 schemas for strict request/response data typing.
- **Frontend Architecture:** Single Page Application (HTML5, Tailwind CSS via CDN, Google Fonts Outfit & Plus Jakarta Sans, Lucide SVG iconography).
- **Testing Suite:** Python standard `unittest` and `fastapi.testclient.TestClient`.
- **Server / Deployment:** Uvicorn ASGI Server (`uvicorn`).

---

## 7. System Architecture

```
[ User Web Browser / Mobile Client ]
                │
                ▼ (HTTP / JSON REST APIs)
[ FastAPI ASGI Application (backend/app.py) ]
    ├── CORS Middleware & Static Asset Mount (/static)
    ├── Authentication & Role Switcher (/api/users)
    ├── Produce Catalog Engine (/api/products)
    │     └── Automated Duplicate Collision Detector
    ├── Atomic Order & Stock Engine (/api/orders)
    │     ├── Stock Limit & MOQ Validator
    │     ├── Atomic Inventory Deductor
    │     └── Cancellation Stock Restoration Routine
    ├── Admin Moderation Desk (/api/admin)
    └── Market Analytics & Price Trends (/api/analytics)
                │
                ▼ (ACID Transactions & Foreign Keys)
[ Persistent SQLite Database (marketplace.db) ]
    ├── users (5 Farmers, 3 Buyers, 1 Admin)
    ├── products (17 listings across 5 categories)
    ├── orders (status, payment, totals)
    ├── order_items (line items, pricing)
    └── moderation_logs (audit trail)
```

---

## 8. Application Screenshots & Workflows

1. **Marketplace Catalog:** Hero banner, category tabs, product cards with harvest freshness tags, mandi price savings badges, and stock counters.
2. **Produce Card & Traceability Modal:** Batch UUID verification, farm GPS origin, and scannable QR code.
3. **Cart Slide-Over & Checkout:** Quantity controls, fulfillment choice (Farm Pickup vs. Local Delivery), simulated payment selector, and safety disclaimer.
4. **Farmer Hub:** Active produce stats, inventory management table with inline stock update, and incoming orders stream.
5. **Buyer Dashboard:** Visual 4-stage stepper tracking orders in real-time.
6. **Admin Moderation Portal:** Duplicate detection queue with 1-click moderation controls.

*(Interactive live presentation slides available in `docs/presentation.html`)*.

---

## 9. Installation Instructions

### Prerequisites
- Python 3.10 or higher
- Git

### Step-by-Step Local Setup
```bash
# 1. Clone repository
git clone <YOUR_REPOSITORY_URL>
cd farmer_marketplace

# 2. (Optional) Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# 3. Install dependencies
pip install fastapi uvicorn httpx pydantic

# 4. Initialize and seed the SQLite database
python -c "import sys; sys.path.insert(0, '.'); from backend.seed_data import seed_database; seed_database()"

# 5. Start the full-stack server
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
```
Open your browser to: **`http://127.0.0.1:8000`**  
Open API Documentation: **`http://127.0.0.1:8000/docs`**

---

## 10. Environment Variables

Create a `.env` file in the project root based on `.env.example`:
```env
# Server settings
APP_ENV=development
APP_HOST=127.0.0.1
APP_PORT=8000
DEBUG=True

# Database Configuration
DATABASE_URL=sqlite:///./backend/marketplace.db

# Security & CORS
ALLOWED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000

# Feature Flags
ENABLE_DEMO_RESET=True
SIMULATED_PAYMENTS_ONLY=True
```

---

## 11. API Documentation

Detailed endpoint specifications, request bodies, and error formats are located in [`docs/api-documentation.md`](docs/api-documentation.md).

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users` | List users or filter by role (`farmer`, `buyer`, `admin`). |
| `POST` | `/api/auth/register` | Register a new farmer or buyer account. |
| `GET` | `/api/products` | Search and filter produce (search, category, price, region, sort). |
| `POST` | `/api/products` | Farmer lists produce with duplicate detection & batch code generation. |
| `PUT` | `/api/products/{id}` | Update listing price, quantity, or active status. |
| `DELETE` | `/api/products/{id}` | Soft-deletes listing to preserve past order history. |
| `POST` | `/api/orders` | Place order with atomic stock checks and quantity validation. |
| `GET` | `/api/orders` | List orders filtered by buyer, farmer, or status. |
| `PATCH` | `/api/orders/{id}/status` | Update lifecycle status (with atomic stock restoration on cancel). |
| `GET` | `/api/admin/listings` | Moderation queue with duplicate detection flags. |
| `POST` | `/api/admin/listings/{id}/moderate` | Moderate listing (`approved`, `flagged`, `rejected`, `removed`). |
| `GET` | `/api/admin/metrics` | Platform health metrics (farmers, buyers, active listings, GMV). |
| `GET` | `/api/analytics/price-trends` | Market price benchmark comparison and buyer savings. |
| `POST` | `/api/seed/reset` | Resets database to pristine initial seed state. |

---

## 12. Database Design

### Relational Schema (SQLite with Foreign Keys)
- **`users`:** `id`, `name`, `email` (UNIQUE), `role` (`farmer`/`buyer`/`admin`), `phone`, `farm_name`, `location`, `address`, `bio`, `rating`, `avatar_url`, `created_at`.
- **`products`:** `id`, `farmer_id` (FK), `name`, `category`, `description`, `photo_url`, `unit`, `price`, `available_quantity`, `min_order_quantity`, `bulk_discount_qty`, `bulk_discount_percent`, `harvest_date`, `availability_date`, `pickup_delivery`, `location`, `organic_certified`, `pesticide_free`, `batch_number`, `market_price_estimate`, `status`, `moderation_note`, `is_duplicate`.
- **`orders`:** `id`, `buyer_id` (FK), `farmer_id` (FK), `total_amount`, `delivery_type`, `delivery_address`, `payment_method`, `payment_status`, `status`, `cancel_reason`, `notes`, `created_at`.
- **`order_items`:** `id`, `order_id` (FK CASCADE), `product_id` (FK), `product_name`, `quantity`, `unit`, `unit_price`, `total_price`.
- **`moderation_logs`:** `id`, `product_id` (FK), `admin_id` (FK), `action`, `reason`, `created_at`.

---

## 13. Testing & Results

An automated test suite is implemented in [`tests/test_marketplace.py`](tests/test_marketplace.py).

To execute the test suite:
```bash
python -m unittest tests/test_marketplace.py
```

### Test Evidence
```text
Ran 9 tests in 1.251s
OK
- test_bulk_discount_calculation ................................ PASS
- test_duplicate_product_detection_and_moderation .............. PASS
- test_illegal_order_transition_rejected ....................... PASS
- test_minimum_order_quantity_enforcement ...................... PASS
- test_order_cancellation_restores_inventory ................... PASS
- test_order_lifecycle_flow .................................... PASS
- test_order_placement_deducts_inventory ....................... PASS
- test_seeded_users_and_products ............................... PASS
- test_stock_limit_enforcement ................................. PASS
```

A complete Postman collection is provided in [`docs/postman_collection.json`](docs/postman_collection.json).

---

## 14. Deployment

### A. Live Public Internet Access (Accessible Worldwide via Cloudflare)
- **Live Application URL:** https://hitachi-hostel-musical-tuesday.trycloudflare.com/
- **Interactive Slide Presentation (12 Slides):** https://hitachi-hostel-musical-tuesday.trycloudflare.com/presentation
- **Backend API & Swagger Documentation:** https://hitachi-hostel-musical-tuesday.trycloudflare.com/docs

### B. Local Wi-Fi / LAN Access (Same Network)
- **Local Network URL:** http://192.168.0.103:8000/
- **Localhost URL:** http://127.0.0.1:8000/ or http://localhost:8000/

### C. Demo Login Instructions
No credentials needed. Use the **Quick Switcher** dropdown in the top navigation bar to instantly toggle between 5 sample Farmers, 3 sample Buyers, and Platform Admin.

---

## 15. Team Members & Contributions

| Name | Roll Number | Branch & Section | Key Contributions |
|---|---|---|---|
| **[Student Name 1]** (Lead) | [Roll Number 1] | CSE - Section A | System architecture, FastAPI backend design, atomic transaction logic, and test suite. |
| **[Student Name 2]** | [Roll Number 2] | CSE - Section A | Database design, schema migrations, seed dataset curation, and Postman API collection. |
| **[Student Name 3]** | [Roll Number 3] | CSE - Section A | Frontend development, Tailwind styling, reactive cart drawer, and role switcher. |
| **[Student Name 4]** | [Roll Number 4] | CSE - Section A | Traceability QR generation, multilingual support, documentation, and presentation deck. |

---

## 16. Limitations and Future Scope

### Current Limitations
- Logistics fulfillment is represented for prototype simulation; direct coordination occurs between farmer and buyer.
- Payments are simulated (Cash on Pickup, COD, Simulated UPI) in compliance with prototype safety rules.

### Future Scope
- Automated SMS / WhatsApp status updates for rural farmers via Twilio or Gupshup APIs.
- IoT smart sensor integration for tracking cold-chain transit temperature.
- Dynamic route optimization for aggregated community delivery vans.

---

## 17. Acknowledgements

- **FastAPI & Uvicorn** for high-performance Python ASGI backend architecture.
- **Pydantic** for declarative data validation and OpenAPI schema serialization.
- **Tailwind CSS** for responsive styling.
- **Unsplash** for agricultural photography assets.
- **SQLite** for zero-configuration, robust ACID relational database management.
