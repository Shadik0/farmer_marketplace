# 🌾 AgriMarket — Full-Stack Farmer Marketplace
## Hackathon Presentation Slide Deck (12 Slides)
**Problem Statement ID:** HACK-P309  
**Subject:** Backend Web Development  

---

### Slide 1: Title & Team Details
- **Project Title:** AgriMarket — Direct Farm-to-Buyer Marketplace
- **Problem Statement ID:** HACK-P309 (Category: Agriculture, Intermediate)
- **Subject:** Backend Web Development
- **Team Name:** AgriCoders Team 4
- **Team Members (4 Students):**
  1. Student 1 (Team Lead): Name: [Student Name 1] | Roll No: [Roll 1] | Branch: CSE | Section: A
  2. Student 2: Name: [Student Name 2] | Roll No: [Roll 2] | Branch: CSE | Section: A
  3. Student 3: Name: [Student Name 3] | Roll No: [Roll 3] | Branch: CSE | Section: A
  4. Student 4: Name: [Student Name 4] | Roll No: [Roll 4] | Branch: CSE | Section: A
- **Speaker Notes:** Welcome faculty and evaluators. Today we present AgriMarket, an end-to-end full-stack platform built to eliminate agricultural intermediary exploitation by connecting farmers directly with households, restaurants, and wholesalers.

---

### Slide 2: Problem Statement
- **Core Challenge:** Smallholder farmers lose up to 45% of produce value to a chain of 3 to 5 middlemen, commission agents, and mandi aggregators.
- **Key Pain Points:**
  - Lack of transparent pricing and availability channels for local growers.
  - Difficulty communicating harvest dates, shelf-life, and direct order quantities.
  - Intermediary price gouging increases buyer costs while squeezing farmer profits.
  - High risk of stock mismanagement and zero traceability for conscious buyers.
- **Target Users:**
  - Local Farmers & Farm Collectives.
  - Direct Buyers: Urban Households, Farm-to-Table Restaurants, and Grocery Retailers.
  - Quality Moderators & Platform Administrators.

---

### Slide 3: Objectives & Proposed Solution
- **Core Objectives:**
  - Build a high-performance direct web marketplace for farm produce.
  - Guarantee strict atomic stock validation (zero overselling).
  - Implement a transparent 5-stage order lifecycle (`requested` ➔ `accepted` ➔ `ready` ➔ `completed` or `cancelled`).
  - Provide dedicated role-specific hubs for Farmers, Buyers, and Quality Moderators.
- **Proposed Solution:**
  - Fast, lightweight REST backend with ACID transaction guarantees.
  - Visual provenance tracking with batch UUIDs and QR codes.
  - Instant role-switcher allowing seamless evaluation across 5 farmers, 3 buyers, and admin.

---

### Slide 4: Features Actually Implemented
- ✅ **Multi-Role Accounts:** Farmer Hub, Buyer Portal, and Admin Moderation Desk.
- ✅ **Dynamic Produce Catalog:** 17 pre-seeded items across Vegetables, Fruits, Grains, Dairy & Spices.
- ✅ **Comprehensive Search & Filters:** Category pills, price slider, region selector, fulfillment mode, in-stock toggle, and sorting.
- ✅ **Atomic Cart & Checkout:** Real-time stock limit check, minimum order quantity enforcement, and volume bulk discounts.
- ✅ **5-Stage Order Lifecycle:** Interactive tracking stepper with atomic stock return upon cancellation.
- ✅ **Farmer Inventory Control:** Inline stock editor, price adjuster, and incoming orders fulfillment stream.
- ✅ **Traceability & QR Verification:** Farm GPS, harvest date, organic certification, and scannable QR badge.
- ✅ **Multilingual Support:** English, Hindi (हिंदी), and Spanish (Español).

---

### Slide 5: Technology Stack
- **Backend Framework:** FastAPI (Python 3.12) — High-throughput asynchronous ASGI server with automatic OpenAPI documentation.
- **Database:** SQLite3 with Foreign Key constraints, WAL mode, and ACID transactions.
- **Data Validation & Serialization:** Pydantic v2 schemas.
- **Frontend:** Responsive Single Page Application (HTML5, Tailwind CSS, Outfit & Plus Jakarta Sans typography, Lucide SVG icons).
- **Testing Suite:** Python `unittest` + `TestClient` (9/9 automated tests passing).
- **Deployment & Tooling:** Uvicorn, Postman Collection v2.1, Git version control.

---

### Slide 6: System Architecture
```
[ User Browser / Device ]
         │
         ▼ (HTTP / JSON REST)
[ Tailwind Responsive SPA Frontend ]
         │
         ▼ (API Gateway / CORS / Static Mount)
[ FastAPI ASGI Application (app.py) ]
    ├── Router & Controllers
    ├── Pydantic Input Validators & Schemas (models.py)
    └── Business Logic & State Transition Machine
         │
         ▼ (Atomic ACID Transactions & Foreign Keys)
[ SQLite Database Engine (marketplace.db) ]
    ├── users (farmers, buyers, admin)
    ├── products (produce, stock, harvest, batch)
    ├── orders (status, payment, totals)
    ├── order_items (line items, pricing)
    └── moderation_logs (audit trail)
```

---

### Slide 7: Backend Implementation
- **RESTful Design:** Proper HTTP verbs (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
- **Atomic Stock Management:**
  - Order Request: Checks `quantity <= available_quantity`. Atomically deducts inventory in SQLite transaction.
  - Order Cancellation: Automatically refunds deducted quantity back to product stock pool.
- **State Machine Rules:**
  - Enforces valid lifecycle transitions (`requested` -> `accepted` -> `ready` -> `completed`).
  - Rejects illegal transitions (e.g. attempting to cancel an already completed order returns `HTTP 400`).
- **Duplicate Detection:**
  - Checks if a farmer lists duplicate produce names and automatically flags them for moderator inspection.
- **Safe Simulated Payments:**
  - Supports Cash on Farm Pickup, COD, and Demo Instant UPI. No sensitive financial credentials requested.

---

### Slide 8: Database Design & ER Schema
- **Relational Integrity:**
  - `users` (1) ── (N) `products`
  - `users` (1) ── (N) `orders` (as Buyer or Farmer)
  - `orders` (1) ── (N) `order_items`
  - `products` (1) ── (N) `order_items`
  - `products` (1) ── (N) `moderation_logs`
- **Key Fields Tracked:**
  - `available_quantity` (REAL) with non-negative constraints.
  - `harvest_date` & `availability_date` (DATE).
  - `batch_number` (VARCHAR) for end-to-end food provenance.
  - `market_price_estimate` (REAL) for mandi price benchmark comparison.

---

### Slide 9: Application Screens & Workflows
- **Screen 1: Produce Marketplace:** Hero search, category filters, produce cards with savings badges and harvest tags.
- **Screen 2: Farmer Hub:** KPI metric cards (active produce, stock, pending orders, revenue), inventory table with inline stock update, incoming orders stream.
- **Screen 3: Buyer Orders:** Visual 4-step progress stepper (`requested` -> `accepted` -> `ready` -> `completed`), itemized receipts, farm contact.
- **Screen 4: Admin Moderation:** Flagged/duplicate listing queue with 1-click Approve/Flag/Reject controls and platform GMV.
- **Screen 5: Traceability Modal:** Harvest date, farm coordinates, batch ID, and scannable QR code.

---

### Slide 10: Testing & Results
- **Automated Test Suite:** 9 unit tests passing in 1.25s.
  - `test_stock_limit_enforcement` — PASS (Rejects excess order with 400).
  - `test_order_placement_deducts_inventory` — PASS (Verifies stock decrement).
  - `test_order_cancellation_restores_inventory` — PASS (Verifies stock restoration).
  - `test_order_lifecycle_flow` — PASS (Full lifecycle traversal).
  - `test_illegal_order_transition_rejected` — PASS (Rejects illegal cancellation).
  - `test_duplicate_product_detection_and_moderation` — PASS (Duplicate flag verified).
  - `test_bulk_discount_calculation` — PASS (Wholesale discount applied).
  - `test_minimum_order_quantity_enforcement` — PASS (Enforces MOQ).
  - `test_seeded_users_and_products` — PASS (Verifies >= 5 farmers, >= 15 products).
- **Postman Evidence:** Sanitized JSON collection exported with 12 distinct test requests.

---

### Slide 11: Deployment & Challenges
- **Deployment Strategy:**
  - Deployed on unified ASGI stack (FastAPI serving static frontend & JSON REST endpoints).
  - Configured environment variables via `.env` (`DATABASE_URL`, `ALLOWED_ORIGINS`).
- **Key Challenges Overcome:**
  1. *Challenge:* Race conditions in stock deduction during concurrent checkouts.
     *Solution:* Implemented atomic SQLite transactions with strict quantity checks before commits.
  2. *Challenge:* Duplicate listings degrading buyer experience.
     *Solution:* Built automated name & farm collision check that routes duplicates to the Admin moderation queue.
  3. *Challenge:* Stock leakage on order cancellation.
     *Solution:* Hooked order cancellation to an automatic stock restoration routine.

---

### Slide 12: Conclusion & Future Scope
- **Summary of Achievements:**
  - Fully working full-stack prototype meeting 100% of HACK-P309 and hackathon submission requirements.
  - Zero hardcoded mockups: all data flows through persistent SQLite database.
  - Seamless 1-click evaluator role switcher and demo data reset button.
- **Future Scope:**
  - Automated SMS/WhatsApp notifications for rural farmers via Twilio/Gupshup.
  - Integrated IoT moisture & temperature logging for cold-chain transit.
  - Geolocation-based routing integration for third-party rural logistics partners.
- **Thank You! Questions & Live Demo.**
