# 🎥 AgriMarket — 3 to 5 Minute Demo Video Script
**Subject:** Backend Web Development Hackathon  
**Problem Statement ID:** HACK-P309 (Farmer Marketplace)  
**Target Duration:** ~3.5 to 4 minutes  

---

## Part 1 — Introduction (25 seconds)
- **On Screen:** Title slide showing project name *AgriMarket*, Problem ID *HACK-P309*, team name *AgriCoders*, and names/roll numbers of all 4 members.
- **Narration:**
  > *"Hello respected evaluators and faculty. We are team AgriCoders, presenting our Backend Web Development Hackathon project: AgriMarket, addressing Problem Statement HACK-P309: Farmer Marketplace. Our team members are [Student 1], [Student 2], [Student 3], and [Student 4]."*

---

## Part 2 — Problem & Proposed Solution (40 seconds)
- **On Screen:** Transition to the AgriMarket home screen. Highlight the comparison banner between farm prices and retail intermediary rates.
- **Narration:**
  > *"Across our agricultural supply chains, smallholder farmers lose between 30 to 45 percent of their harvest value to aggregators, commission agents, and wholesalers, while consumers pay inflated retail prices. Furthermore, availability and harvest freshness are rarely communicated transparently.*
  > 
  > *AgriMarket solves this by creating a direct, transparent web marketplace. Farmers list produce with verifiable harvest dates, batch traceability codes, and quantity limits. Buyers—from households to restaurants and wholesalers—can order directly with atomic inventory checks, simulated payments, and transparent order lifecycle tracking."*

---

## Part 3 — Working Application Demonstration (1.5 to 2 minutes)
- **On Screen:** Switch to browser view at `http://127.0.0.1:8000`.

### Scene 1: Buyer Discovery & Search (30 seconds)
- **Action:** 
  1. Show search bar: type "Tomato", filter by category "Vegetables", and adjust the max price slider.
  2. Point out the produce card features: harvest freshness tag (*"Harvested Yesterday"*), available stock (*"180 kg in stock"*), and savings badge (*"Save 27% vs Retail"*).
  3. Click **Traceability & QR** modal: showcase the batch UUID (`BATCH-NSK-2026-081`), soil/farm coordinates, and scannable QR code.
- **Narration:**
  > *"Here is the live marketplace catalog. Buyers can filter produce by category, price, region, and fulfillment options. Every product displays clear units, farm locations, and estimated savings compared to traditional retail. Clicking 'Traceability & QR' displays verifiable harvest provenance and a scannable batch code."*

### Scene 2: Atomic Cart & Order Placement (30 seconds)
- **Action:**
  1. Choose 5 kg of tomatoes and 1 jar of Bilona Desi Ghee. Add them to the cart.
  2. Attempt to input 99,999 kg to show stock validation error (*"Cannot exceed available stock"*).
  3. Open cart slide-over drawer, select *Local Delivery*, pick *Cash on Delivery (COD)* or *Demo Instant UPI*, and click **Send Order Request**.
- **Narration:**
  > *"Now we add produce to our cart. Notice that if a user attempts to order more than the available inventory, our backend immediately rejects the request with a stock limit error. Submitting the order atomically deducts the inventory in our database and takes us directly to the My Orders tracking portal."*

### Scene 3: Order Lifecycle & Farmer Hub (45 seconds)
- **Action:**
  1. Show the 4-stage visual progress stepper on *My Orders* (`requested` ➔ `accepted` ➔ `ready` ➔ `completed`).
  2. Use the **Quick Switcher** in the navbar to switch to Farmer *Ramesh Patel*.
  3. Show the Farmer Hub: active listings, pending orders, and total revenue.
  4. In *Incoming Orders*, click **Accept Order**, then **Mark Ready for Pickup**.
  5. Demonstrate **Inventory Controls**: inline stock update, and the *List New Produce* modal with duplicate detection.
- **Narration:**
  > *"Using our instant role switcher, we switch to Farmer Ramesh Patel. In the Farmer Hub, Ramesh sees live sales metrics, inventory counts, and incoming orders. He clicks 'Accept Order', transitioning the status to accepted, and then 'Mark Ready'. If an order is cancelled at any stage, our backend automatically credits the reserved inventory back to available stock."*

---

## Part 4 — Backend Architecture, APIs & Database (50 seconds)
- **On Screen:** Open the Swagger API docs at `http://127.0.0.1:8000/docs`, followed by VS Code showing `backend/app.py` and terminal running `test_marketplace.py`.
- **Narration:**
  > *"Under the hood, our application is powered by FastAPI and Python 3.12, serving standardized REST endpoints with full input validation via Pydantic v2. Our database is SQLite with foreign keys and ACID transactions to ensure zero race conditions during simultaneous checkouts.
  > 
  > Here in our terminal, we execute our automated test suite consisting of 9 unit tests. As you can see, all 9 tests pass with 100 percent success, validating stock limits, minimum order quantities, state machine progressions, duplicate detection, and cancellation stock restoration."*

---

## Part 5 — Deployment & Conclusion (25 seconds)
- **On Screen:** Show the GitHub repository structure and Admin Moderation Desk (`/admin`).
- **Narration:**
  > *"The project is fully documented in our GitHub repository following the submission guidelines, including complete API documentation, a Postman collection, architecture diagrams, and a 12-slide presentation deck. 
  > 
  > AgriMarket delivers a real-world, functional solution that empowers farmers and gives buyers fresh, transparent food. Thank you!"*
