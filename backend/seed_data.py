import datetime
from .database import get_connection, init_db

def seed_database():
    init_db()
    conn = get_connection()
    cursor = conn.cursor()

    # Clear existing data for clean re-seed
    cursor.execute("DELETE FROM moderation_logs;")
    cursor.execute("DELETE FROM order_items;")
    cursor.execute("DELETE FROM orders;")
    cursor.execute("DELETE FROM products;")
    cursor.execute("DELETE FROM users;")

    today = datetime.date.today()
    yesterday = today - datetime.timedelta(days=1)
    two_days_ago = today - datetime.timedelta(days=2)
    three_days_ago = today - datetime.timedelta(days=3)
    five_days_ago = today - datetime.timedelta(days=5)
    one_week_later = today + datetime.timedelta(days=7)
    two_weeks_later = today + datetime.timedelta(days=14)

    # 1. Farmers (5 profiles)
    farmers = [
        (
            1, "Ramesh Patel", "ramesh@greenmeadows.org", "farmer", "+91 80748 68505",
            "Green Meadows Organic Farm", "Nashik, Maharashtra",
            "Plot 14, Gangapur Valley, Nashik",
            "Certified multi-generational organic farm specializing in pesticide-free vine vegetables and fresh leafy greens.",
            4.95, "https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=200&auto=format&fit=crop&q=80"
        ),
        (
            2, "Maria Santos", "maria@sunburstvalleydemo.com", "farmer", "+91 80748 68505",
            "Sunburst Valley Orchard", "Solan, Himachal Pradesh",
            "Hillcrest Estate, Kalka-Shimla Corridor, Solan",
            "High-altitude mountain orchard cultivating crisp apples, stone fruits, and raw forest wildflower honey.",
            4.88, "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80"
        ),
        (
            3, "John Kim", "john@heritagegrains.org", "farmer", "+91 80748 68505",
            "Heritage Grains Collective", "Ludhiana, Punjab",
            "GT Road Agri Zone, Ludhiana",
            "Community cooperative growing traditional heirloom grains, long-grain basmati, and cold-pressed oilseeds.",
            4.92, "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
        ),
        (
            4, "Elena Rostova", "elena@happycowdairy.com", "farmer", "+91 80748 68505",
            "Happy Cow Artisanal Dairy", "Anand, Gujarat",
            "Amul Dairy Road Outskirts, Anand",
            "Grass-fed A2 Gir cow sanctuary offering pure unpasteurized morning milk, cultured butter, and traditional bilona ghee.",
            4.97, "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"
        ),
        (
            5, "Devendra Sharma", "devendra@fragrantroots.com", "farmer", "+91 80748 68505",
            "Fragrant Roots Herb & Spice Co.", "Wayanad, Kerala",
            "Misty Ridge Spices, Vythiri, Wayanad",
            "Shade-grown biodynamic spice estate producing pungent Tellicherry peppercorns, fresh ginger rhizomes, and wild cinnamon.",
            4.91, "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80"
        )
    ]

    for f in farmers:
        cursor.execute("""
            INSERT INTO users (id, name, email, role, phone, farm_name, location, address, bio, rating, avatar_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, f)

    # 2. Buyers (3 profiles)
    buyers = [
        (
            6, "Priya Sharma", "priya@kitchenstories.in", "buyer", "+91 98200 11223",
            None, "Mumbai, Maharashtra", "Flat 402, Sea Green Apts, Bandra West, Mumbai",
            "Home chef passionate about fresh farm ingredients, seasonal salads, and organic kitchen pantry essentials.",
            4.9, "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
        ),
        (
            7, "Chef Marco", "marco@greenbistro.com", "buyer", "+91 98230 44556",
            None, "Pune, Maharashtra", "GreenBistro, Koregaon Park Main Road, Pune",
            "Executive Chef running a Farm-to-Table restaurant seeking weekly fresh greens, heritage heirloom grains, and artisanal dairy.",
            4.95, "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80"
        ),
        (
            8, "Dave Grocers", "dave@urbanfreshwholesale.com", "buyer", "+91 98110 77889",
            None, "Delhi NCR", "Shed 12, Azadpur Agricultural Complex, Delhi",
            "Regional cooperative wholesaler supplying neighbourhood green grocers with bulk crates of apples and seasonal roots.",
            4.85, "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80"
        )
    ]

    for b in buyers:
        cursor.execute("""
            INSERT INTO users (id, name, email, role, phone, farm_name, location, address, bio, rating, avatar_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, b)

    # 3. Admin (1 profile)
    cursor.execute("""
        INSERT INTO users (id, name, email, role, phone, farm_name, location, address, bio, rating, avatar_url)
        VALUES (9, 'Moderation Desk', 'admin@agrimarket.org', 'admin', '+91 80000 00000', NULL, 'Central HQ, Bangalore', 'AgriTech Incubator, Bangalore', 'Platform Trust & Safety Moderator inspecting duplicate produce listings and price gouging.', 5.0, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80')
    """)

    # 4. Products (17 diverse items across 5 farmers)
    products = [
        # Farmer 1: Ramesh Patel (Vegetables)
        (
            1, 1, "Organic Vine-Ripened Tomatoes", "Vegetables",
            "Juicy, naturally ripened Roma and beefsteak tomatoes picked at peak sweetness. Zero synthetic chemicals used.",
            "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80",
            "kg", 35.0, 180.0, 1.0, 30.0, 10.0,
            str(yesterday), str(one_week_later), "both", "Nashik, Maharashtra",
            1, 1, "BATCH-NSK-2026-081", 48.0, "active", "", 0
        ),
        (
            2, 1, "Hydroponic Baby Spinach", "Vegetables",
            "Crisp, tender baby spinach leaves harvested at dawn. Washed in clean spring water and packed in aerated cartons.",
            "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80",
            "bunch", 25.0, 95.0, 1.0, 20.0, 8.0,
            str(today), str(today + datetime.timedelta(days=4)), "both", "Nashik, Maharashtra",
            1, 1, "BATCH-NSK-2026-082", 38.0, "active", "", 0
        ),
        (
            3, 1, "Sweet Red Nashik Onions", "Vegetables",
            "Sun-cured medium pungent red onions renowned for rich aroma, long storage stability, and thick rings.",
            "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80",
            "crate (20kg)", 420.0, 45.0, 1.0, 5.0, 12.0,
            str(three_days_ago), str(two_weeks_later), "both", "Nashik, Maharashtra",
            1, 1, "BATCH-NSK-2026-083", 560.0, "active", "", 0
        ),
        (
            4, 1, "Fresh English Cucumber", "Vegetables",
            "Crisp thin-skinned seedless cucumbers grown in naturally ventilated polyhouse. Refreshing and sweet.",
            "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=600&auto=format&fit=crop&q=80",
            "kg", 30.0, 120.0, 1.0, 25.0, 10.0,
            str(yesterday), str(one_week_later), "both", "Nashik, Maharashtra",
            1, 1, "BATCH-NSK-2026-084", 42.0, "active", "", 0
        ),

        # Farmer 2: Maria Santos (Fruits & Honey)
        (
            5, 2, "High-Altitude Royal Gala Apples", "Fruits",
            "Tree-ripened crunchy apples harvested from 7,000 ft orchards. Sweet floral aroma with high natural pectin.",
            "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80",
            "box (10kg)", 950.0, 60.0, 1.0, 10.0, 15.0,
            str(two_days_ago), str(two_weeks_later), "both", "Solan, Himachal Pradesh",
            1, 1, "BATCH-SLN-2026-114", 1300.0, "active", "", 0
        ),
        (
            6, 2, "Raw Himalayan Wildflower Honey", "Dairy & Honey",
            "Unfiltered, cold-extracted pure forest honey collected by native Apis cerana bees in the Shimla ridge forests.",
            "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80",
            "jar (500g)", 380.0, 75.0, 1.0, 12.0, 10.0,
            str(five_days_ago), str(today + datetime.timedelta(days=90)), "delivery_only", "Solan, Himachal Pradesh",
            1, 1, "BATCH-SLN-2026-115", 520.0, "active", "", 0
        ),
        (
            7, 2, "Golden Sundried Apricots", "Fruits",
            "Handpicked Kinnauri apricots sun-dried on clean slate stones without sulfur preservatives.",
            "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=600&auto=format&fit=crop&q=80",
            "kg", 450.0, 40.0, 1.0, 10.0, 8.0,
            str(five_days_ago), str(today + datetime.timedelta(days=60)), "both", "Solan, Himachal Pradesh",
            1, 1, "BATCH-SLN-2026-116", 600.0, "active", "", 0
        ),

        # Farmer 3: John Kim (Grains & Pulses)
        (
            8, 3, "Sharbati Whole Wheat Grain", "Grains & Pulses",
            "Golden heavy grains with high protein and elastic gluten quality. Perfect for soft rotis and artisanal bread.",
            "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80",
            "bag (25kg)", 1100.0, 85.0, 1.0, 5.0, 10.0,
            str(five_days_ago), str(today + datetime.timedelta(days=120)), "both", "Ludhiana, Punjab",
            1, 1, "BATCH-LDH-2026-044", 1450.0, "active", "", 0
        ),
        (
            9, 3, "Traditional Aged Basmati Rice", "Grains & Pulses",
            "Two-year naturally aged extra-long grain Basmati rice with distinctive aromatic nuttiness.",
            "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80",
            "bag (10kg)", 920.0, 110.0, 1.0, 10.0, 12.0,
            str(five_days_ago), str(today + datetime.timedelta(days=180)), "both", "Ludhiana, Punjab",
            1, 1, "BATCH-LDH-2026-045", 1250.0, "active", "", 0
        ),
        (
            10, 3, "Organic Unpolished Toor Dal (Pigeon Pea)", "Grains & Pulses",
            "Farm-milled yellow split peas retaining the nutrient-dense outer aleurone layer. High fiber and earthy taste.",
            "https://images.unsplash.com/photo-1585992636148-5ac529e71b78?w=600&auto=format&fit=crop&q=80",
            "kg", 140.0, 200.0, 1.0, 25.0, 10.0,
            str(three_days_ago), str(today + datetime.timedelta(days=90)), "both", "Ludhiana, Punjab",
            1, 1, "BATCH-LDH-2026-046", 185.0, "active", "", 0
        ),

        # Farmer 4: Elena Rostova (Dairy & Honey)
        (
            11, 4, "Farm Fresh A2 Gir Cow Raw Milk", "Dairy & Honey",
            "Chilled non-homogenized pure morning milk from free-range indigenous Gir cows. Tested for zero adulteration.",
            "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80",
            "liter", 68.0, 70.0, 1.0, 15.0, 8.0,
            str(today), str(today + datetime.timedelta(days=2)), "both", "Anand, Gujarat",
            1, 1, "BATCH-AND-2026-301", 85.0, "active", "", 0
        ),
        (
            12, 4, "Hand-Churned Bilona Desi Cow Ghee", "Dairy & Honey",
            "Traditional Vedic Bilona method ghee prepared by churning curd over slow cowdung cake embers.",
            "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=600&auto=format&fit=crop&q=80",
            "jar (1 Liter)", 1450.0, 30.0, 1.0, 5.0, 10.0,
            str(two_days_ago), str(today + datetime.timedelta(days=180)), "both", "Anand, Gujarat",
            1, 1, "BATCH-AND-2026-302", 1850.0, "active", "", 0
        ),
        (
            13, 4, "Cultured Salted Farm Butter", "Dairy & Honey",
            "Creamy, probiotic-rich cultured yellow table butter churned fresh every morning.",
            "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&auto=format&fit=crop&q=80",
            "pack (500g)", 260.0, 45.0, 1.0, 10.0, 5.0,
            str(yesterday), str(today + datetime.timedelta(days=14)), "pickup_only", "Anand, Gujarat",
            1, 1, "BATCH-AND-2026-303", 320.0, "active", "", 0
        ),

        # Farmer 5: Devendra Sharma (Herbs & Spices)
        (
            14, 5, "Single-Origin Tellicherry Black Peppercorns", "Herbs & Spices",
            "Extra-bold TGSEB grade sun-dried black peppercorns from ancient Wayanad vines with exceptional piperine bite.",
            "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80",
            "kg", 680.0, 90.0, 1.0, 10.0, 10.0,
            str(three_days_ago), str(today + datetime.timedelta(days=180)), "both", "Wayanad, Kerala",
            1, 1, "BATCH-WYD-2026-501", 920.0, "active", "", 0
        ),
        (
            15, 5, "Fresh Organically Grown Ginger Rhizomes", "Herbs & Spices",
            "Plump, juicy low-fiber ginger harvested straight from rich virgin forest loams. Intense lemony aroma.",
            "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80",
            "kg", 85.0, 140.0, 1.0, 20.0, 12.0,
            str(yesterday), str(two_weeks_later), "both", "Wayanad, Kerala",
            1, 1, "BATCH-WYD-2026-502", 115.0, "active", "", 0
        ),
        (
            16, 5, "Aromatic Wild Ceylon Cinnamon Quills", "Herbs & Spices",
            "True Ceylon cinnamon quills with paper-thin sweet delicate bark layers, sustainably peeled in Wayanad hills.",
            "https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600&auto=format&fit=crop&q=80",
            "pack (250g)", 290.0, 60.0, 1.0, 10.0, 10.0,
            str(five_days_ago), str(today + datetime.timedelta(days=120)), "delivery_only", "Wayanad, Kerala",
            1, 1, "BATCH-WYD-2026-503", 390.0, "active", "", 0
        ),

        # 17: Flagged item for Admin Moderation test/demo
        (
            17, 1, "Organic Vine-Ripened Tomatoes (Duplicate Listing)", "Vegetables",
            "Duplicate entry created inadvertently by grower during sync.",
            "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80",
            "kg", 35.0, 50.0, 1.0, 0, 0,
            str(today), str(one_week_later), "both", "Nashik, Maharashtra",
            1, 1, "BATCH-DUP-001", 48.0, "flagged", "Potential duplicate of Listing #1 with identical title and farm.", 1
        )
    ]

    for p in products:
        cursor.execute("""
            INSERT INTO products (
                id, farmer_id, name, category, description, photo_url, unit, price,
                available_quantity, min_order_quantity, bulk_discount_qty, bulk_discount_percent,
                harvest_date, availability_date, pickup_delivery, location,
                organic_certified, pesticide_free, batch_number, market_price_estimate,
                status, moderation_note, is_duplicate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, p)

    # 5. Sample Initial Orders (Showing lifecycle states: requested, accepted, ready, completed)
    # Order 1: Priya Sharma bought from Ramesh Patel (Accepted)
    cursor.execute("""
        INSERT INTO orders (id, buyer_id, farmer_id, total_amount, delivery_type, delivery_address, payment_method, payment_status, status, notes)
        VALUES (1, 6, 1, 175.0, 'delivery', 'Flat 402, Sea Green Apts, Bandra West, Mumbai', 'cash_on_delivery', 'simulated_pending', 'accepted', 'Please deliver in the morning before 10 AM.')
    """)
    cursor.execute("""
        INSERT INTO order_items (order_id, product_id, product_name, quantity, unit, unit_price, total_price)
        VALUES (1, 1, 'Organic Vine-Ripened Tomatoes', 5.0, 'kg', 35.0, 175.0)
    """)

    # Order 2: Chef Marco bought from Elena Rostova (Ready for pickup)
    cursor.execute("""
        INSERT INTO orders (id, buyer_id, farmer_id, total_amount, delivery_type, delivery_address, payment_method, payment_status, status, notes)
        VALUES (2, 7, 4, 1450.0, 'pickup', 'GreenBistro, Koregaon Park, Pune', 'cash_on_pickup', 'simulated_pending', 'ready', 'Restaurant logistics van will arrive at farm gate by 2 PM.')
    """)
    cursor.execute("""
        INSERT INTO order_items (order_id, product_id, product_name, quantity, unit, unit_price, total_price)
        VALUES (2, 12, 'Hand-Churned Bilona Desi Cow Ghee', 1.0, 'jar (1 Liter)', 1450.0, 1450.0)
    """)

    # Order 3: Wholesaler Dave bought from Maria Santos (Completed)
    cursor.execute("""
        INSERT INTO orders (id, buyer_id, farmer_id, total_amount, delivery_type, delivery_address, payment_method, payment_status, status, notes)
        VALUES (3, 8, 2, 9500.0, 'delivery', 'Shed 12, Azadpur Agricultural Complex, Delhi', 'simulated_instant_transfer', 'simulated_paid', 'completed', 'Bulk crate delivery inspected and accepted.')
    """)
    cursor.execute("""
        INSERT INTO order_items (order_id, product_id, product_name, quantity, unit, unit_price, total_price)
        VALUES (3, 5, 'High-Altitude Royal Gala Apples', 10.0, 'box (10kg)', 950.0, 9500.0)
    """)

    # Moderation log for the flagged item
    cursor.execute("""
        INSERT INTO moderation_logs (product_id, admin_id, action, reason)
        VALUES (17, 9, 'flagged', 'Automated system detected exact duplicate product title and farm match.')
    """)

    conn.commit()
    conn.close()
    print("Database successfully seeded with 5 farmers, 3 buyers, 1 admin, 17 products, and 3 sample orders.")

if __name__ == "__main__":
    seed_database()
