import sqlite3
import os
from pathlib import Path

DB_PATH = Path(__file__).parent / "marketplace.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('farmer', 'buyer', 'admin')),
        phone TEXT,
        farm_name TEXT,
        location TEXT NOT NULL,
        address TEXT,
        bio TEXT,
        rating REAL DEFAULT 4.9,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        farmer_id INTEGER NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        category TEXT NOT NULL CHECK(category IN ('Vegetables', 'Fruits', 'Grains & Pulses', 'Herbs & Spices', 'Dairy & Honey')),
        description TEXT,
        photo_url TEXT,
        unit TEXT NOT NULL,
        price REAL NOT NULL,
        available_quantity REAL NOT NULL,
        min_order_quantity REAL DEFAULT 1.0,
        bulk_discount_qty REAL DEFAULT 0,
        bulk_discount_percent REAL DEFAULT 0,
        harvest_date DATE NOT NULL,
        availability_date DATE NOT NULL,
        pickup_delivery TEXT NOT NULL CHECK(pickup_delivery IN ('pickup_only', 'delivery_only', 'both')),
        location TEXT NOT NULL,
        organic_certified INTEGER DEFAULT 0,
        pesticide_free INTEGER DEFAULT 1,
        batch_number TEXT,
        market_price_estimate REAL,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'paused', 'flagged', 'rejected', 'archived')),
        moderation_note TEXT DEFAULT '',
        is_duplicate INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        buyer_id INTEGER NOT NULL REFERENCES users(id),
        farmer_id INTEGER NOT NULL REFERENCES users(id),
        total_amount REAL NOT NULL,
        delivery_type TEXT NOT NULL CHECK(delivery_type IN ('pickup', 'delivery')),
        delivery_address TEXT,
        payment_method TEXT NOT NULL CHECK(payment_method IN ('cash_on_pickup', 'cash_on_delivery', 'simulated_instant_transfer')),
        payment_status TEXT DEFAULT 'simulated_pending' CHECK(payment_status IN ('simulated_pending', 'simulated_paid', 'refunded')),
        status TEXT NOT NULL DEFAULT 'requested' CHECK(status IN ('requested', 'accepted', 'ready', 'completed', 'cancelled')),
        cancel_reason TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id),
        product_name TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS moderation_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL REFERENCES products(id),
        admin_id INTEGER NOT NULL REFERENCES users(id),
        action TEXT NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database schema initialized successfully at", DB_PATH)
