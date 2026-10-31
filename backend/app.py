import os
import random
import datetime
from pathlib import Path
from typing import Optional, List

from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from .database import get_connection, init_db
from .seed_data import seed_database
from .models import (
    UserOut, ProductCreate, ProductUpdate,
    OrderCreateRequest, OrderStatusUpdate,
    AdminModerationRequest
)

# Initialize DB on startup if not existing
init_db()

app = FastAPI(
    title="AgriMarket - Farmer & Buyer Marketplace API",
    description="Student Hackathon Prototype for Direct Farmer-to-Buyer Marketplace (Problem HACK-P309)",
    version="1.0.0"
)

# Enable CORS for local testing & preview
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIR = Path(__file__).parent.parent / "frontend"

# Helper for dict rows
def dict_from_row(row):
    return dict(row) if row else None


# ==========================================
# 1. USER & AUTHENTICATION ENDPOINTS
# ==========================================

@app.get("/api/users", response_model=List[UserOut])
def get_users(role: Optional[str] = None):
    """Retrieve all seeded users or filter by role (farmer, buyer, admin)."""
    conn = get_connection()
    cursor = conn.cursor()
    if role:
        cursor.execute("SELECT * FROM users WHERE role = ? ORDER BY id ASC", (role,))
    else:
        cursor.execute("SELECT * FROM users ORDER BY role DESC, id ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict_from_row(r) for r in rows]

@app.get("/api/users/{user_id}", response_model=UserOut)
def get_user_by_id(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return dict_from_row(row)

@app.post("/api/auth/register", response_model=UserOut)
def register_user(
    name: str,
    email: str,
    role: str,
    location: str,
    phone: Optional[str] = "",
    farm_name: Optional[str] = None,
    address: Optional[str] = "",
    bio: Optional[str] = ""
):
    if role not in ("farmer", "buyer"):
        raise HTTPException(status_code=400, detail="Role must be 'farmer' or 'buyer'")
    
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO users (name, email, role, phone, farm_name, location, address, bio, avatar_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            name, email, role, phone, farm_name if role == "farmer" else None,
            location, address, bio,
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80"
        ))
        new_id = cursor.lastrowid
        conn.commit()
        cursor.execute("SELECT * FROM users WHERE id = ?", (new_id,))
        user = dict_from_row(cursor.fetchone())
        conn.close()
        return user
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=400, detail=f"Registration failed: {str(e)}")


# ==========================================
# 2. PRODUCT LISTINGS ENDPOINTS
# ==========================================

@app.get("/api/products")
def list_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    location: Optional[str] = None,
    pickup_delivery: Optional[str] = None,
    in_stock_only: bool = False,
    farmer_id: Optional[int] = None,
    status: Optional[str] = "active",
    sort_by: Optional[str] = "freshness"  # 'freshness', 'price_asc', 'price_desc', 'rating'
):
    """
    Search and filter produce listings with farmer metadata, stock limits, and benchmark prices.
    """
    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT 
            p.*, 
            u.name as farmer_name, 
            u.farm_name, 
            u.rating as farmer_rating, 
            u.phone as farmer_phone,
            u.address as farmer_address
        FROM products p
        JOIN users u ON p.farmer_id = u.id
        WHERE 1=1
    """
    params = []

    if status and status != "all":
        query += " AND p.status = ?"
        params.append(status)

    if farmer_id:
        query += " AND p.farmer_id = ?"
        params.append(farmer_id)

    if category and category != "All":
        query += " AND p.category = ?"
        params.append(category)

    if search:
        search_param = f"%{search.strip()}%"
        query += " AND (p.name LIKE ? OR p.description LIKE ? OR u.farm_name LIKE ? OR p.location LIKE ?)"
        params.extend([search_param, search_param, search_param, search_param])

    if min_price is not None:
        query += " AND p.price >= ?"
        params.append(min_price)

    if max_price is not None:
        query += " AND p.price <= ?"
        params.append(max_price)

    if location and location != "All":
        query += " AND p.location LIKE ?"
        params.append(f"%{location}%")

    if pickup_delivery and pickup_delivery != "All":
        if pickup_delivery in ("pickup_only", "delivery_only"):
            query += " AND (p.pickup_delivery = ? OR p.pickup_delivery = 'both')"
            params.append(pickup_delivery)

    if in_stock_only:
        query += " AND p.available_quantity > 0"

    # Sorting
    if sort_by == "price_asc":
        query += " ORDER BY p.price ASC"
    elif sort_by == "price_desc":
        query += " ORDER BY p.price DESC"
    elif sort_by == "rating":
        query += " ORDER BY u.rating DESC"
    else:  # 'freshness'
        query += " ORDER BY p.harvest_date DESC, p.id DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    products = [dict_from_row(r) for r in rows]
    return products

@app.get("/api/products/{product_id}")
def get_product_details(product_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            p.*, 
            u.name as farmer_name, 
            u.farm_name, 
            u.rating as farmer_rating, 
            u.phone as farmer_phone,
            u.address as farmer_address,
            u.bio as farmer_bio
        FROM products p
        JOIN users u ON p.farmer_id = u.id
        WHERE p.id = ?
    """, (product_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")
    return dict_from_row(row)

@app.post("/api/products")
def create_product(product: ProductCreate):
    """
    Farmer publishes a produce listing with safety checks and duplicate detection.
    """
    conn = get_connection()
    cursor = conn.cursor()

    # Validate farmer
    cursor.execute("SELECT id, role FROM users WHERE id = ?", (product.farmer_id,))
    farmer = cursor.fetchone()
    if not farmer or farmer["role"] != "farmer":
        conn.close()
        raise HTTPException(status_code=400, detail="Only registered farmers can list produce")

    # Duplicate listing check: Check if farmer already has an active listing with the exact same name
    cursor.execute("""
        SELECT id FROM products 
        WHERE farmer_id = ? AND LOWER(name) = LOWER(?) AND status = 'active'
    """, (product.farmer_id, product.name))
    duplicate = cursor.fetchone()

    is_duplicate = 1 if duplicate else 0
    status = "flagged" if is_duplicate else "active"
    mod_note = "Auto-flagged: identical product name already exists for this farm" if is_duplicate else ""

    # Generate batch code for traceability
    year = datetime.date.today().year
    rand_code = random.randint(100, 999)
    batch_num = f"BATCH-{product.category[:3].upper()}-{year}-{rand_code}"

    # Default market price estimate if not supplied
    market_est = product.market_price_estimate or round(product.price * 1.25, 2)

    # Fallback photo if none provided
    photo = product.photo_url or "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80"

    cursor.execute("""
        INSERT INTO products (
            farmer_id, name, category, description, photo_url, unit, price,
            available_quantity, min_order_quantity, bulk_discount_qty, bulk_discount_percent,
            harvest_date, availability_date, pickup_delivery, location,
            organic_certified, pesticide_free, batch_number, market_price_estimate,
            status, moderation_note, is_duplicate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        product.farmer_id, product.name, product.category, product.description, photo,
        product.unit, product.price, product.available_quantity, product.min_order_quantity,
        product.bulk_discount_qty, product.bulk_discount_percent,
        product.harvest_date, product.availability_date, product.pickup_delivery, product.location,
        1 if product.organic_certified else 0, 1 if product.pesticide_free else 0,
        batch_num, market_est, status, mod_note, is_duplicate
    ))
    new_id = cursor.lastrowid
    conn.commit()

    cursor.execute("SELECT * FROM products WHERE id = ?", (new_id,))
    created_product = dict_from_row(cursor.fetchone())
    conn.close()
    return created_product

@app.put("/api/products/{product_id}")
def update_product(product_id: int, update_data: ProductUpdate):
    """Update produce details (e.g., price, stock quantity, availability status)."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found")

    fields = []
    params = []
    data_dict = update_data.model_dump(exclude_unset=True)

    for key, value in data_dict.items():
        if key in ("organic_certified", "pesticide_free"):
            fields.append(f"{key} = ?")
            params.append(1 if value else 0)
        else:
            fields.append(f"{key} = ?")
            params.append(value)

    if not fields:
        conn.close()
        return dict_from_row(existing)

    fields.append("updated_at = CURRENT_TIMESTAMP")
    params.append(product_id)

    sql = f"UPDATE products SET {', '.join(fields)} WHERE id = ?"
    cursor.execute(sql, params)
    conn.commit()

    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    updated = dict_from_row(cursor.fetchone())
    conn.close()
    return updated

@app.delete("/api/products/{product_id}")
def delete_product(product_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    prod = cursor.fetchone()
    if not prod:
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found")

    # Soft delete / archive to preserve past order history integrity
    cursor.execute("UPDATE products SET status = 'archived' WHERE id = ?", (product_id,))
    conn.commit()
    conn.close()
    return {"message": "Listing archived successfully", "product_id": product_id}


# ==========================================
# 3. CART & ORDER REQUEST WORKFLOW
# ==========================================

@app.post("/api/orders")
def create_order(request: OrderCreateRequest):
    """
    Buyer places an order request with strict inventory check & atomic stock deduction.
    Demonstrates simulated payments & prototype delivery notice.
    """
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Verify Buyer
    cursor.execute("SELECT id, role FROM users WHERE id = ?", (request.buyer_id,))
    buyer = cursor.fetchone()
    if not buyer:
        conn.close()
        raise HTTPException(status_code=400, detail="Buyer profile not found")

    # Group ordered items by farmer so each farmer gets a clean order request
    farmer_items_map = {}

    try:
        # Atomic stock verification loop
        for item in request.items:
            cursor.execute("SELECT * FROM products WHERE id = ?", (item.product_id,))
            product = cursor.fetchone()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product ID #{item.product_id} not found")

            if product["status"] != "active":
                raise HTTPException(
                    status_code=400,
                    detail=f"Produce '{product['name']}' is currently not available for ordering."
                )

            # Stock check
            if item.quantity > product["available_quantity"]:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Stock limit exceeded for '{product['name']}': "
                        f"You requested {item.quantity} {product['unit']}, but only "
                        f"{product['available_quantity']} {product['unit']} are currently available."
                    )
                )

            # Minimum order quantity check
            if item.quantity < product["min_order_quantity"]:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Minimum order for '{product['name']}' is "
                        f"{product['min_order_quantity']} {product['unit']}."
                    )
                )

            farmer_id = product["farmer_id"]
            if farmer_id not in farmer_items_map:
                farmer_items_map[farmer_id] = []
            
            # Apply bulk discount if applicable
            unit_price = product["price"]
            if product["bulk_discount_qty"] > 0 and item.quantity >= product["bulk_discount_qty"]:
                discount = (product["bulk_discount_percent"] / 100.0)
                unit_price = round(unit_price * (1.0 - discount), 2)

            total_item_price = round(unit_price * item.quantity, 2)

            farmer_items_map[farmer_id].append({
                "product_id": product["id"],
                "product_name": product["name"],
                "quantity": item.quantity,
                "unit": product["unit"],
                "unit_price": unit_price,
                "total_price": total_item_price,
                "available_quantity": product["available_quantity"]
            })

        created_order_ids = []

        # 2. Process order creation and atomic stock deduction per farmer
        for farmer_id, items in farmer_items_map.items():
            total_order_amount = sum(i["total_price"] for i in items)
            
            # Simulated payment status
            init_payment_status = "simulated_paid" if request.payment_method == "simulated_instant_transfer" else "simulated_pending"

            cursor.execute("""
                INSERT INTO orders (
                    buyer_id, farmer_id, total_amount, delivery_type,
                    delivery_address, payment_method, payment_status,
                    status, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'requested', ?)
            """, (
                request.buyer_id, farmer_id, total_order_amount, request.delivery_type,
                request.delivery_address or "Farm Gate Pickup", request.payment_method,
                init_payment_status, request.notes or ""
            ))
            order_id = cursor.lastrowid
            created_order_ids.append(order_id)

            for item in items:
                # Insert order item
                cursor.execute("""
                    INSERT INTO order_items (
                        order_id, product_id, product_name, quantity, unit, unit_price, total_price
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    order_id, item["product_id"], item["product_name"],
                    item["quantity"], item["unit"], item["unit_price"], item["total_price"]
                ))

                # ATOMIC STOCK DEDUCTION
                cursor.execute("""
                    UPDATE products 
                    SET available_quantity = available_quantity - ?
                    WHERE id = ?
                """, (item["quantity"], item["product_id"]))

        conn.commit()

        # Fetch detailed created orders
        orders_out = []
        for oid in created_order_ids:
            cursor.execute("""
                SELECT o.*, u.name as farmer_name, u.farm_name, u.phone as farmer_phone
                FROM orders o
                JOIN users u ON o.farmer_id = u.id
                WHERE o.id = ?
            """, (oid,))
            order_data = dict_from_row(cursor.fetchone())
            cursor.execute("SELECT * FROM order_items WHERE order_id = ?", (oid,))
            order_data["items"] = [dict_from_row(i) for i in cursor.fetchall()]
            orders_out.append(order_data)

        conn.close()
        return {
            "message": "Order placed successfully!",
            "orders": orders_out,
            "safety_notice": "PROTOTYPE NOTICE: Payments are simulated. No real cards or funds are charged.",
            "logistics_notice": "LOGISTICS NOTICE: Actual delivery/pickup is coordinated between buyer and farmer."
        }

    except HTTPException:
        conn.rollback()
        conn.close()
        raise
    except Exception as e:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=500, detail=f"Order processing failed: {str(e)}")

@app.get("/api/orders")
def get_orders(
    buyer_id: Optional[int] = None,
    farmer_id: Optional[int] = None,
    status: Optional[str] = None
):
    """Retrieve orders with buyer and farmer details and line items."""
    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT 
            o.*,
            b.name as buyer_name,
            b.email as buyer_email,
            b.phone as buyer_phone,
            f.name as farmer_name,
            f.farm_name,
            f.phone as farmer_phone,
            f.location as farm_location
        FROM orders o
        JOIN users b ON o.buyer_id = b.id
        JOIN users f ON o.farmer_id = f.id
        WHERE 1=1
    """
    params = []

    if buyer_id:
        query += " AND o.buyer_id = ?"
        params.append(buyer_id)

    if farmer_id:
        query += " AND o.farmer_id = ?"
        params.append(farmer_id)

    if status and status != "all":
        query += " AND o.status = ?"
        params.append(status)

    query += " ORDER BY o.created_at DESC, o.id DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()

    orders = []
    for r in rows:
        order_dict = dict_from_row(r)
        cursor.execute("SELECT * FROM order_items WHERE order_id = ?", (order_dict["id"],))
        order_dict["items"] = [dict_from_row(i) for i in cursor.fetchall()]
        orders.append(order_dict)

    conn.close()
    return orders

@app.patch("/api/orders/{order_id}/status")
def update_order_status(order_id: int, status_update: OrderStatusUpdate):
    """
    Update order lifecycle status:
    - requested -> accepted -> ready -> completed
    - or cancellation (with ATOMIC STOCK RESTORATION!)
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    order = cursor.fetchone()
    if not order:
        conn.close()
        raise HTTPException(status_code=404, detail="Order not found")

    current_status = order["status"]
    new_status = status_update.status

    # Validate lifecycle state transitions
    allowed_transitions = {
        "requested": ["accepted", "cancelled"],
        "accepted": ["ready", "cancelled"],
        "ready": ["completed", "cancelled"],
        "completed": [],       # Terminal state
        "cancelled": []        # Terminal state
    }

    if new_status not in allowed_transitions.get(current_status, []):
        conn.close()
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition order status from '{current_status}' to '{new_status}'."
        )

    try:
        # ATOMIC STOCK RESTORATION IF ORDER IS CANCELLED
        if new_status == "cancelled" and current_status != "cancelled":
            cursor.execute("SELECT product_id, quantity FROM order_items WHERE order_id = ?", (order_id,))
            items = cursor.fetchall()
            for item in items:
                cursor.execute("""
                    UPDATE products
                    SET available_quantity = available_quantity + ?
                    WHERE id = ?
                """, (item["quantity"], item["product_id"]))

        # Payment status update if completed
        new_payment_status = order["payment_status"]
        if new_status == "completed" and order["payment_status"] == "simulated_pending":
            new_payment_status = "simulated_paid"
        elif new_status == "cancelled" and order["payment_status"] == "simulated_paid":
            new_payment_status = "refunded"

        cursor.execute("""
            UPDATE orders 
            SET status = ?, 
                cancel_reason = ?, 
                payment_status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (new_status, status_update.cancel_reason, new_payment_status, order_id))

        conn.commit()

        cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
        updated_order = dict_from_row(cursor.fetchone())
        cursor.execute("SELECT * FROM order_items WHERE order_id = ?", (order_id,))
        updated_order["items"] = [dict_from_row(i) for i in cursor.fetchall()]

        conn.close()
        return {
            "message": f"Order #{order_id} status updated to '{new_status}'",
            "order": updated_order
        }

    except Exception as e:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=500, detail=f"Failed to update order status: {str(e)}")


# ==========================================
# 4. ADMIN MODERATION & PLATFORM METRICS
# ==========================================

@app.get("/api/admin/listings")
def get_admin_listings():
    """Retrieve all listings with moderation flags, duplicate marks, and status."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            p.*, 
            u.name as farmer_name, 
            u.farm_name,
            u.email as farmer_email
        FROM products p
        JOIN users u ON p.farmer_id = u.id
        ORDER BY p.is_duplicate DESC, p.status = 'flagged' DESC, p.created_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict_from_row(r) for r in rows]

@app.post("/api/admin/listings/{product_id}/moderate")
def moderate_listing(product_id: int, mod_req: AdminModerationRequest):
    """Admin approves, flags, rejects, or removes duplicate/inappropriate produce."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    product = cursor.fetchone()
    if not product:
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found")

    status_map = {
        "approved": "active",
        "flagged": "flagged",
        "rejected": "rejected",
        "removed": "archived"
    }

    new_status = status_map[mod_req.action]

    cursor.execute("""
        UPDATE products 
        SET status = ?, moderation_note = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    """, (new_status, mod_req.reason or f"Action by Admin #{mod_req.admin_id}", product_id))

    cursor.execute("""
        INSERT INTO moderation_logs (product_id, admin_id, action, reason)
        VALUES (?, ?, ?, ?)
    """, (product_id, mod_req.admin_id, mod_req.action, mod_req.reason or ""))

    conn.commit()
    conn.close()
    return {"message": f"Listing #{product_id} updated to '{new_status}'", "status": new_status}

@app.get("/api/admin/metrics")
def get_admin_metrics():
    """High-level platform health metrics for the hackathon presentation."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'farmer'")
    total_farmers = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'buyer'")
    total_buyers = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM products WHERE status = 'active'")
    active_products = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM products WHERE is_duplicate = 1 OR status = 'flagged'")
    flagged_products = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM orders")
    total_orders = cursor.fetchone()[0]

    cursor.execute("SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status != 'cancelled'")
    gross_volume = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM orders WHERE status = 'completed'")
    completed_orders = cursor.fetchone()[0]

    conn.close()
    return {
        "total_farmers": total_farmers,
        "total_buyers": total_buyers,
        "active_products": active_products,
        "flagged_products": flagged_products,
        "total_orders": total_orders,
        "gross_merchandise_value": round(gross_volume, 2),
        "completed_orders": completed_orders
    }


# ==========================================
# 5. MARKET ANALYTICS & DEMO RESET
# ==========================================

@app.get("/api/analytics/price-trends")
def get_price_trends():
    """
    Comparison between direct farmer prices vs. typical retail mandi/supermarket rates,
    demonstrating buyer savings and farmer profit margins.
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            name, category, unit, price as farmer_price, 
            market_price_estimate as retail_price
        FROM products 
        WHERE status = 'active'
        LIMIT 8
    """)
    rows = cursor.fetchall()
    conn.close()

    items = []
    for r in rows:
        d = dict_from_row(r)
        f_price = d["farmer_price"]
        r_price = d["retail_price"] or round(f_price * 1.3, 2)
        savings_pct = round(((r_price - f_price) / r_price) * 100, 1) if r_price > 0 else 0
        items.append({
            "name": d["name"],
            "category": d["category"],
            "unit": d["unit"],
            "farmer_price": f_price,
            "retail_price": r_price,
            "buyer_savings_percent": savings_pct
        })
    return items

@app.post("/api/seed/reset")
def reset_seed_data():
    """Reset database to fresh seed state with 5 farmers, 3 buyers, 1 admin, and 17 products."""
    seed_database()
    return {"message": "Database reset to initial hackathon sample state successfully!"}


# ==========================================
# 6. STATIC FRONTEND SERVING
# ==========================================

DOCS_DIR = Path(__file__).parent.parent / "docs"

if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

    @app.get("/")
    def serve_frontend():
        return FileResponse(FRONTEND_DIR / "index.html")

if DOCS_DIR.exists():
    app.mount("/docs-view", StaticFiles(directory=str(DOCS_DIR)), name="docs-view")

    @app.get("/presentation")
    def serve_presentation():
        return FileResponse(DOCS_DIR / "presentation.html")

    @app.get("/video")
    def serve_video_player():
        return FileResponse(DOCS_DIR / "video_player.html")

    @app.get("/demo-video.mp4")
    def serve_demo_mp4():
        return FileResponse(DOCS_DIR / "demo_video.mp4", media_type="video/mp4")


