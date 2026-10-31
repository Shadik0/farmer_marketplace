# 📡 AgriMarket REST API Documentation
**Problem Statement ID:** HACK-P309  
**Subject:** Backend Web Development  
**Base URL:** `http://127.0.0.1:8000` (or live deployed server)  
**Interactive Docs (OpenAPI/Swagger):** `http://127.0.0.1:8000/docs`

---

## 1. Authentication & User Management

### 1.1 List Users
- **Endpoint:** `GET /api/users`
- **Purpose:** Retrieve all platform accounts (farmers, buyers, admin) or filter by role.
- **Query Parameters:**
  - `role` *(string, optional)*: `'farmer'`, `'buyer'`, or `'admin'`.
- **Response Format (`200 OK`):**
  ```json
  [
    {
      "id": 1,
      "name": "Ramesh Patel",
      "email": "ramesh@greenmeadows.org",
      "role": "farmer",
      "phone": "+91 80748 68505",
      "farm_name": "Green Meadows Organic Farm",
      "location": "Nashik, Maharashtra",
      "address": "Plot 14, Gangapur Valley, Nashik",
      "bio": "Certified multi-generational organic farm...",
      "rating": 4.95,
      "avatar_url": "https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=200"
    }
  ]
  ```

### 1.2 Get Single User
- **Endpoint:** `GET /api/users/{user_id}`
- **Purpose:** Retrieve profile and farm details for a single user ID.
- **Status Codes:** `200 OK`, `404 Not Found`.

### 1.3 Register New User
- **Endpoint:** `POST /api/auth/register`
- **Purpose:** Register a new farmer or buyer account.
- **Request Body:**
  ```json
  {
    "name": "Sita Devi",
    "email": "sita@krishifarm.in",
    "role": "farmer",
    "phone": "+91 98765 43210",
    "farm_name": "Sita Devi Organic Orchard",
    "location": "Shimla, Himachal Pradesh",
    "address": "Village Kotkhai, Shimla",
    "bio": "Growing premium apples and cherries."
  }
  ```
- **Response Format (`200 OK`):** User profile object.
- **Error Codes:** `400 Bad Request` (missing required fields or invalid role).

---

## 2. Produce Listings Management

### 2.1 Search and Filter Produce
- **Endpoint:** `GET /api/products`
- **Purpose:** Full search and filtering of farm produce catalog.
- **Query Parameters:**
  - `search` *(string, optional)*: Case-insensitive keyword search in name, description, farm name, or location.
  - `category` *(string, optional)*: `Vegetables`, `Fruits`, `Grains & Pulses`, `Dairy & Honey`, `Herbs & Spices`.
  - `min_price` *(float, optional)*: Minimum price per unit.
  - `max_price` *(float, optional)*: Maximum price per unit.
  - `location` *(string, optional)*: Filter by farm district or state.
  - `pickup_delivery` *(string, optional)*: `pickup_only`, `delivery_only`, `both`.
  - `in_stock_only` *(bool, optional)*: When `true`, filters for `available_quantity > 0`.
  - `farmer_id` *(int, optional)*: Filter listings owned by a specific farmer.
  - `status` *(string, optional, default: `'active'`)*: Filter status (`active`, `paused`, `flagged`, `all`).
  - `sort_by` *(string, optional)*: `'freshness'` (default), `'price_asc'`, `'price_desc'`, `'rating'`.
- **Response Format (`200 OK`):**
  ```json
  [
    {
      "id": 1,
      "farmer_id": 1,
      "name": "Organic Vine-Ripened Tomatoes",
      "category": "Vegetables",
      "description": "Juicy, naturally ripened Roma and beefsteak tomatoes picked at peak sweetness.",
      "photo_url": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600",
      "unit": "kg",
      "price": 35.0,
      "available_quantity": 180.0,
      "min_order_quantity": 2.0,
      "bulk_discount_qty": 30.0,
      "bulk_discount_percent": 10.0,
      "harvest_date": "2026-10-29",
      "availability_date": "2026-11-06",
      "pickup_delivery": "both",
      "location": "Nashik, Maharashtra",
      "organic_certified": 1,
      "pesticide_free": 1,
      "batch_number": "BATCH-NSK-2026-081",
      "market_price_estimate": 48.0,
      "status": "active",
      "farmer_name": "Ramesh Patel",
      "farm_name": "Green Meadows Organic Farm",
      "farmer_rating": 4.95,
      "farmer_phone": "+91 80748 68505"
    }
  ]
  ```

### 2.2 Create Produce Listing
- **Endpoint:** `POST /api/products`
- **Purpose:** Farmer publishes new produce with inventory validation and automated duplicate detection.
- **Request Body:**
  ```json
  {
    "farmer_id": 1,
    "name": "Fresh Green Bell Peppers",
    "category": "Vegetables",
    "description": "Crisp greenhouse capsicum harvested daily.",
    "photo_url": "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600",
    "unit": "kg",
    "price": 45.0,
    "available_quantity": 80.0,
    "min_order_quantity": 1.0,
    "bulk_discount_qty": 20.0,
    "bulk_discount_percent": 10.0,
    "harvest_date": "2026-10-30",
    "availability_date": "2026-11-08",
    "pickup_delivery": "both",
    "location": "Nashik, Maharashtra",
    "organic_certified": true,
    "pesticide_free": true
  }
  ```
- **Business Logic & Duplicate Detection:**
  - If the farmer already has an active listing with the exact same name, the system sets `is_duplicate = 1` and marks `status = 'flagged'` for Admin moderation!
  - Automatically generates a provenance batch number (e.g. `BATCH-VEG-2026-482`).
- **Response Format (`200 OK`):** Returns the created produce object.
- **Error Codes:** `400 Bad Request` (user is not a farmer or missing required fields).

### 2.3 Update Produce Listing
- **Endpoint:** `PUT /api/products/{product_id}`
- **Purpose:** Update inventory stock, price, status (`active` / `paused`), or details.
- **Request Body:** Subset of updateable fields (e.g. `{"available_quantity": 95.0, "price": 42.0}`).
- **Response Format (`200 OK`):** Updated produce object.

### 2.4 Archive / Delete Listing
- **Endpoint:** `DELETE /api/products/{product_id}`
- **Purpose:** Soft-deletes listing by setting `status = 'archived'` to protect past order history.
- **Response Format (`200 OK`):** `{"message": "Listing archived successfully", "product_id": 1}`

---

## 3. Order Processing & Inventory Lifecycle

### 3.1 Place Order Request (Atomic Stock Check)
- **Endpoint:** `POST /api/orders`
- **Purpose:** Buyer places an order for 1 or more produce items.
- **Request Body:**
  ```json
  {
    "buyer_id": 6,
    "items": [
      { "product_id": 1, "quantity": 10.0 }
    ],
    "delivery_type": "delivery",
    "delivery_address": "Flat 402, Sea Green Apts, Bandra West, Mumbai",
    "payment_method": "cash_on_delivery",
    "notes": "Deliver before noon please."
  }
  ```
- **Crucial Business Rules:**
  1. Checks `quantity <= available_quantity`. If exceeded, aborts with `HTTP 400 Bad Request` and detailed error message.
  2. Checks `quantity >= min_order_quantity`.
  3. Groups ordered items by farmer into clean distinct orders.
  4. Automatically calculates bulk tier discounts if `quantity >= bulk_discount_qty`.
  5. Atomically decrements `available_quantity` from the `products` table using a transaction.
- **Response Format (`200 OK`):**
  ```json
  {
    "message": "Order placed successfully!",
    "orders": [
      {
        "id": 4,
        "buyer_id": 6,
        "farmer_id": 1,
        "total_amount": 350.0,
        "delivery_type": "delivery",
        "payment_method": "cash_on_delivery",
        "payment_status": "simulated_pending",
        "status": "requested",
        "items": [...]
      }
    ],
    "safety_notice": "PROTOTYPE NOTICE: Payments are simulated.",
    "logistics_notice": "LOGISTICS NOTICE: Physical fulfillment coordinated directly."
  }
  ```

### 3.2 List Orders
- **Endpoint:** `GET /api/orders`
- **Purpose:** Retrieve orders with nested line items, buyer contact, and farm details.
- **Query Parameters:**
  - `buyer_id` *(int, optional)*: Filter orders placed by a specific buyer.
  - `farmer_id` *(int, optional)*: Filter orders received by a specific farmer.
  - `status` *(string, optional)*: Filter by lifecycle state.

### 3.3 Update Order Status (Atomic Stock Restoration)
- **Endpoint:** `PATCH /api/orders/{order_id}/status`
- **Purpose:** Transition order through lifecycle states or cancel.
- **Request Body:**
  ```json
  {
    "status": "accepted",
    "cancel_reason": "",
    "user_id": 1
  }
  ```
- **State Machine Enforcement:**
  - Valid: `requested` ➔ `accepted` ➔ `ready` ➔ `completed`.
  - Valid: `requested` ➔ `cancelled`, `accepted` ➔ `cancelled`.
  - Invalid: Attempting to cancel an already `completed` order returns `HTTP 400 Bad Request`.
- **Atomic Stock Restoration:**
  - When an order transitions to `cancelled`, all quantities in `order_items` are automatically restored back to `products.available_quantity`.

---

## 4. Admin Moderation & Quality Desk

### 4.1 Get Moderation Queue
- **Endpoint:** `GET /api/admin/listings`
- **Purpose:** Retrieve all listings sorted by duplicate score and flagged status.

### 4.2 Moderate Listing
- **Endpoint:** `POST /api/admin/listings/{product_id}/moderate`
- **Request Body:**
  ```json
  {
    "admin_id": 9,
    "action": "rejected",
    "reason": "Duplicate product title match with existing farm catalog."
  }
  ```
- **Supported Actions:** `'approved'`, `'flagged'`, `'rejected'`, `'removed'`.
- **Response Format (`200 OK`):** `{"message": "Listing #17 updated to 'rejected'", "status": "rejected"}`

### 4.3 Platform Health Metrics
- **Endpoint:** `GET /api/admin/metrics`
- **Purpose:** Aggregates total farmers, total buyers, active listings, flagged listings, orders count, and platform Gross Merchandise Value (GMV).

---

## 5. Market Analytics & Demo Tools

### 5.1 Price Trends & Margin Comparison
- **Endpoint:** `GET /api/analytics/price-trends`
- **Purpose:** Compares direct farmer prices against supermarket retail prices, calculating buyer savings percentages and farmer margin improvements.

### 5.2 Reset Demo State
- **Endpoint:** `POST /api/seed/reset`
- **Purpose:** Resets database to clean initial seed data (5 farmers, 3 buyers, 1 admin, 17 products, 3 sample orders).
