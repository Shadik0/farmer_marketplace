import sys
import unittest
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi.testclient import TestClient
from backend.app import app
from backend.seed_data import seed_database
from backend.database import get_connection

class TestFarmerMarketplace(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Reset to known seed state before tests
        seed_database()
        cls.client = TestClient(app)

    def setUp(self):
        # Fresh seed for test isolation
        seed_database()

    def test_seeded_users_and_products(self):
        """Verify baseline seed requirements: >= 5 farmers, >= 15 products."""
        res_users = self.client.get("/api/users?role=farmer")
        self.assertEqual(res_users.status_code, 200)
        farmers = res_users.json()
        self.assertGreaterEqual(len(farmers), 5, "Must have at least 5 farmer profiles")

        res_prods = self.client.get("/api/products?status=all")
        self.assertEqual(res_prods.status_code, 200)
        prods = res_prods.json()
        self.assertGreaterEqual(len(prods), 15, "Must have at least 15 sample products")

    def test_stock_limit_enforcement(self):
        """Test business rule: Prevent orders exceeding available stock."""
        # Product 1 is Tomatoes with available_quantity ~ 180.0 kg
        res_p = self.client.get("/api/products/1")
        initial_stock = res_p.json()["available_quantity"]

        # Attempt to order excessive quantity
        order_payload = {
            "buyer_id": 6, # Priya Sharma
            "items": [
                {"product_id": 1, "quantity": initial_stock + 50.0}
            ],
            "delivery_type": "delivery",
            "delivery_address": "Test Street 101",
            "payment_method": "cash_on_delivery"
        }

        res = self.client.post("/api/orders", json=order_payload)
        self.assertEqual(res.status_code, 400)
        self.assertIn("Stock limit exceeded", res.json()["detail"])

        # Verify stock remains unchanged
        res_p_after = self.client.get("/api/products/1")
        self.assertEqual(res_p_after.json()["available_quantity"], initial_stock)

    def test_minimum_order_quantity_enforcement(self):
        """Test rule: Order quantity must satisfy minimum order quantity."""
        # Product 1 has min_order_quantity = 2.0
        order_payload = {
            "buyer_id": 6,
            "items": [
                {"product_id": 1, "quantity": 0.5} # Below MOQ
            ],
            "delivery_type": "delivery",
            "delivery_address": "Test Street 101",
            "payment_method": "cash_on_delivery"
        }
        res = self.client.post("/api/orders", json=order_payload)
        self.assertEqual(res.status_code, 400)
        self.assertIn("Minimum order", res.json()["detail"])

    def test_order_placement_deducts_inventory(self):
        """Test atomic stock reduction on successful order creation."""
        res_p = self.client.get("/api/products/2") # Spinach
        initial_stock = res_p.json()["available_quantity"]
        order_qty = 10.0

        order_payload = {
            "buyer_id": 6,
            "items": [
                {"product_id": 2, "quantity": order_qty}
            ],
            "delivery_type": "pickup",
            "payment_method": "cash_on_pickup"
        }
        res = self.client.post("/api/orders", json=order_payload)
        self.assertEqual(res.status_code, 200)
        self.assertIn("Order placed successfully", res.json()["message"])

        # Check stock deduction
        res_p_after = self.client.get("/api/products/2")
        new_stock = res_p_after.json()["available_quantity"]
        self.assertEqual(new_stock, initial_stock - order_qty)

    def test_order_cancellation_restores_inventory(self):
        """Test business rule: Cancelling an order restores inventory back to available pool."""
        res_p = self.client.get("/api/products/4") # Cucumber
        initial_stock = res_p.json()["available_quantity"]
        order_qty = 15.0

        # Place order
        order_payload = {
            "buyer_id": 7, # Chef Marco
            "items": [
                {"product_id": 4, "quantity": order_qty}
            ],
            "delivery_type": "pickup",
            "payment_method": "cash_on_pickup"
        }
        order_res = self.client.post("/api/orders", json=order_payload)
        self.assertEqual(order_res.status_code, 200)
        created_order = order_res.json()["orders"][0]
        order_id = created_order["id"]

        # Stock should be reduced
        res_mid = self.client.get("/api/products/4")
        self.assertEqual(res_mid.json()["available_quantity"], initial_stock - order_qty)

        # Cancel the order
        cancel_res = self.client.patch(f"/api/orders/{order_id}/status", json={
            "status": "cancelled",
            "cancel_reason": "Customer change of plans",
            "user_id": 7
        })
        self.assertEqual(cancel_res.status_code, 200)
        self.assertEqual(cancel_res.json()["order"]["status"], "cancelled")

        # Verify stock is fully restored
        res_restored = self.client.get("/api/products/4")
        self.assertEqual(res_restored.json()["available_quantity"], initial_stock)

    def test_order_lifecycle_flow(self):
        """Test standard progression: requested -> accepted -> ready -> completed."""
        order_payload = {
            "buyer_id": 6,
            "items": [
                {"product_id": 1, "quantity": 5.0}
            ],
            "delivery_type": "delivery",
            "payment_method": "cash_on_delivery"
        }
        order_res = self.client.post("/api/orders", json=order_payload)
        order_id = order_res.json()["orders"][0]["id"]

        # 1. requested -> accepted
        res1 = self.client.patch(f"/api/orders/{order_id}/status", json={
            "status": "accepted", "user_id": 1
        })
        self.assertEqual(res1.status_code, 200)
        self.assertEqual(res1.json()["order"]["status"], "accepted")

        # 2. accepted -> ready
        res2 = self.client.patch(f"/api/orders/{order_id}/status", json={
            "status": "ready", "user_id": 1
        })
        self.assertEqual(res2.status_code, 200)
        self.assertEqual(res2.json()["order"]["status"], "ready")

        # 3. ready -> completed
        res3 = self.client.patch(f"/api/orders/{order_id}/status", json={
            "status": "completed", "user_id": 1
        })
        self.assertEqual(res3.status_code, 200)
        self.assertEqual(res3.json()["order"]["status"], "completed")
        self.assertEqual(res3.json()["order"]["payment_status"], "simulated_paid")

    def test_illegal_order_transition_rejected(self):
        """Test rule: Completed order cannot transition back or to cancelled."""
        order_payload = {
            "buyer_id": 6,
            "items": [{"product_id": 1, "quantity": 2.0}],
            "delivery_type": "delivery",
            "payment_method": "cash_on_delivery"
        }
        order_id = self.client.post("/api/orders", json=order_payload).json()["orders"][0]["id"]
        
        # Advance to completed
        self.client.patch(f"/api/orders/{order_id}/status", json={"status": "accepted", "user_id": 1})
        self.client.patch(f"/api/orders/{order_id}/status", json={"status": "ready", "user_id": 1})
        self.client.patch(f"/api/orders/{order_id}/status", json={"status": "completed", "user_id": 1})

        # Attempt illegal cancellation of completed order
        res_illegal = self.client.patch(f"/api/orders/{order_id}/status", json={
            "status": "cancelled", "cancel_reason": "Too late", "user_id": 6
        })
        self.assertEqual(res_illegal.status_code, 400)
        self.assertIn("Cannot transition", res_illegal.json()["detail"])

    def test_duplicate_product_detection_and_moderation(self):
        """Test admin moderation for duplicate product listings."""
        # Farmer 1 lists produce with exact duplicate name of active produce
        duplicate_payload = {
            "farmer_id": 1,
            "name": "Organic Vine-Ripened Tomatoes", # already exists for Farmer 1
            "category": "Vegetables",
            "description": "Another tomato batch with duplicate name",
            "unit": "kg",
            "price": 36.0,
            "available_quantity": 40.0,
            "min_order_quantity": 1.0,
            "harvest_date": "2026-10-30",
            "availability_date": "2026-11-06",
            "pickup_delivery": "both",
            "location": "Nashik, Maharashtra"
        }
        res_create = self.client.post("/api/products", json=duplicate_payload)
        self.assertEqual(res_create.status_code, 200)
        prod = res_create.json()
        self.assertEqual(prod["is_duplicate"], 1)
        self.assertEqual(prod["status"], "flagged")

        # Admin moderates and rejects the duplicate
        mod_res = self.client.post(f"/api/admin/listings/{prod['id']}/moderate", json={
            "admin_id": 9,
            "action": "rejected",
            "reason": "Confirmed duplicate listing of main tomato product."
        })
        self.assertEqual(mod_res.status_code, 200)
        self.assertEqual(mod_res.json()["status"], "rejected")

    def test_bulk_discount_calculation(self):
        """Test bulk order discount pricing logic."""
        # Product 8: Sharbati Whole Wheat Grain, price 1100 per bag, bulk_discount_qty=5.0, discount=10%
        # Standard: 1 bag = 1100
        # Bulk: 5 bags = 5 * (1100 - 110) = 5 * 990 = 4950
        order_payload = {
            "buyer_id": 8, # Wholesaler Dave
            "items": [
                {"product_id": 8, "quantity": 5.0}
            ],
            "delivery_type": "delivery",
            "delivery_address": "Azadpur Mandi Shed 12",
            "payment_method": "simulated_instant_transfer"
        }
        res = self.client.post("/api/orders", json=order_payload)
        self.assertEqual(res.status_code, 200)
        order = res.json()["orders"][0]
        item = order["items"][0]
        self.assertEqual(item["unit_price"], 990.0)
        self.assertEqual(item["total_price"], 4950.0)

if __name__ == "__main__":
    unittest.main()
