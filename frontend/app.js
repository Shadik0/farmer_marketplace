// ==========================================
// AgriMarket Frontend Reactive Controller
// ==========================================

const API_BASE = "";

// Global State
let allUsers = [];
let currentUser = null;
let allProducts = [];
let cart = []; // [{ product, quantity }]
let activeCategory = "All";
let currentTab = "marketplace";
let currentLanguage = "en";

// Multilingual Dictionary
const i18n = {
  en: {
    safetyNotice: "🛡️ <strong>Prototype Simulation Notice:</strong> Payments are simulated (Cash on Pickup / COD / Demo Instant UPI). Delivery is coordinated between farmer & buyer.",
    resetDemo: "Reset Demo Data",
    navMarketplace: "Produce Market",
    navFarmer: "Farmer Hub",
    navBuyer: "My Orders",
    navTrends: "Price Trends",
    navAdmin: "Moderation",
    addProduce: "List New Produce",
    searchPlaceholder: "Search organic tomatoes, basmati, ghee, apples, farm name...",
    moreFilters: "More Filters",
    harvested: "Harvested",
    stockLeft: "in stock",
    outOfStock: "Sold Out",
    addToCart: "Add to Cart",
    viewTraceability: "Traceability & QR",
    retailPrice: "Retail",
    save: "Save",
    orderRequested: "Order Requested",
    orderAccepted: "Order Accepted",
    orderReady: "Ready for Pickup",
    orderCompleted: "Completed",
    orderCancelled: "Cancelled",
  },
  hi: {
    safetyNotice: "🛡️ <strong>प्रोटोटाइप सूचना:</strong> भुगतान केवल डेमो है (कैश ऑन पिकअप / सीओडी / यूपीआई)। डिलीवरी किसान और खरीदार के बीच तय होती है।",
    resetDemo: "डेमो रीसेट करें",
    navMarketplace: "कृषि बाज़ार",
    navFarmer: "किसान हब",
    navBuyer: "मेरे ऑर्डर",
    navTrends: "भाव तुलना",
    navAdmin: "सत्यापन डेस्क",
    addProduce: "नई फसल जोड़ें",
    searchPlaceholder: "टमाटर, बासमती, घी, सेब, खेत का नाम खोजें...",
    moreFilters: "और फ़िल्टर",
    harvested: "कटाई",
    stockLeft: "स्टॉक में",
    outOfStock: "स्टॉक समाप्त",
    addToCart: "कार्ट में जोड़ें",
    viewTraceability: "खेत विवरण व QR",
    retailPrice: "मंडी भाव",
    save: "बचत",
    orderRequested: "ऑर्डर अनुरोध भेजा",
    orderAccepted: "किसान ने स्वीकार किया",
    orderReady: "उठाव के लिए तैयार",
    orderCompleted: "सफलतापूर्वक पूर्ण",
    orderCancelled: "रद्द किया गया",
  },
  es: {
    safetyNotice: "🛡️ <strong>Aviso del Prototipo:</strong> Pagos simulados (Pago al recoger / COD / Transferencia Demo). Entrega coordinada entre agricultor y comprador.",
    resetDemo: "Reiniciar Demo",
    navMarketplace: "Mercado Agrícola",
    navFarmer: "Panel Agricultor",
    navBuyer: "Mis Pedidos",
    navTrends: "Tendencias Precios",
    navAdmin: "Moderación",
    addProduce: "Publicar Cosecha",
    searchPlaceholder: "Buscar tomates, arroz, miel, manzanas, nombre de finca...",
    moreFilters: "Más Filtros",
    harvested: "Cosechado",
    stockLeft: "en stock",
    outOfStock: "Agotado",
    addToCart: "Añadir al Carrito",
    viewTraceability: "Trazabilidad y QR",
    retailPrice: "Precio Supermercado",
    save: "Ahorra",
    orderRequested: "Pedido Solicitado",
    orderAccepted: "Pedido Aceptado",
    orderReady: "Listo para Recoger",
    orderCompleted: "Completado",
    orderCancelled: "Cancelado",
  }
};

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {
  // Set default harvest date to today in form
  const todayStr = new Date().toISOString().split("T")[0];
  const nextWeekStr = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
  const harvestInp = document.getElementById("inpProdHarvestDate");
  const availInp = document.getElementById("inpProdAvailDate");
  if (harvestInp) harvestInp.value = todayStr;
  if (availInp) availInp.value = nextWeekStr;

  await loadUsers();
  await loadProducts();
  await loadPriceTrends();
  await loadAdminData();
  updateCartBadge();
});

// ==========================================
// USER & ROLE MANAGEMENT
// ==========================================

async function loadUsers() {
  try {
    const res = await fetch(`${API_BASE}/api/users`);
    allUsers = await res.json();
    
    // Default to Buyer (Priya Sharma, id 6) or first user
    currentUser = allUsers.find(u => u.id === 6) || allUsers[0];
    renderUserSwitcherMenu();
    updateCurrentUserUI();
  } catch (err) {
    console.error("Failed to load users:", err);
    showToast("Failed to load users", "error");
  }
}

function updateCurrentUserUI() {
  if (!currentUser) return;

  document.getElementById("currUserName").innerText = currentUser.name;
  document.getElementById("currUserLocation").innerText = currentUser.location;
  document.getElementById("currUserAvatar").src = currentUser.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100";
  
  const roleBadge = document.getElementById("currUserRoleBadge");
  roleBadge.innerText = currentUser.role.toUpperCase();
  if (currentUser.role === "farmer") {
    roleBadge.className = "text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold uppercase";
  } else if (currentUser.role === "buyer") {
    roleBadge.className = "text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold uppercase";
  } else {
    roleBadge.className = "text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold uppercase";
  }

  // Update tabs or dashboards based on current user
  if (currentUser.role === "farmer") {
    updateFarmerDashboard();
  } else if (currentUser.role === "buyer") {
    updateBuyerDashboard();
  }
}

function renderUserSwitcherMenu() {
  const farmersList = document.getElementById("farmersSwitchList");
  const buyersList = document.getElementById("buyersSwitchList");
  const adminList = document.getElementById("adminSwitchList");

  farmersList.innerHTML = "";
  buyersList.innerHTML = "";
  adminList.innerHTML = "";

  allUsers.forEach(u => {
    const item = document.createElement("div");
    item.className = `px-3 py-2 flex items-center justify-between hover:bg-slate-50 cursor-pointer rounded-lg transition ${currentUser && currentUser.id === u.id ? 'bg-emerald-50/80 font-bold' : ''}`;
    item.onclick = () => switchUser(u.id);

    const left = document.createElement("div");
    left.className = "flex items-center space-x-2";
    left.innerHTML = `
      <img src="${u.avatar_url}" class="w-6 h-6 rounded-md object-cover border border-slate-200" alt="">
      <div>
        <div class="text-xs text-slate-800 font-semibold leading-tight">${u.name}</div>
        <div class="text-[10px] text-slate-500 leading-tight">${u.farm_name || u.location}</div>
      </div>
    `;

    const right = document.createElement("span");
    right.className = `text-[9px] font-bold px-1.5 py-0.5 rounded ${u.role === 'farmer' ? 'bg-emerald-100 text-emerald-700' : u.role === 'buyer' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`;
    right.innerText = u.role.toUpperCase();

    item.appendChild(left);
    item.appendChild(right);

    if (u.role === "farmer") farmersList.appendChild(item);
    else if (u.role === "buyer") buyersList.appendChild(item);
    else adminList.appendChild(item);
  });
}

function toggleUserDropdown() {
  const menu = document.getElementById("userDropdownMenu");
  menu.classList.toggle("hidden");
}

// Close dropdown on outside click
document.addEventListener("click", (e) => {
  const menu = document.getElementById("userDropdownMenu");
  if (!menu) return;
  if (!e.target.closest("#userDropdownMenu") && !e.target.closest("[onclick*='toggleUserDropdown']")) {
    menu.classList.add("hidden");
  }
});

function switchUser(userId) {
  const target = allUsers.find(u => u.id === userId);
  if (!target) return;
  currentUser = target;
  renderUserSwitcherMenu();
  updateCurrentUserUI();
  toggleUserDropdown();

  // Smart Tab redirection on switch
  if (currentUser.role === "farmer") {
    switchTab("farmer");
    showToast(`Switched to Farmer: ${currentUser.name} (${currentUser.farm_name})`, "info");
  } else if (currentUser.role === "buyer") {
    switchTab("marketplace");
    showToast(`Switched to Buyer: ${currentUser.name}`, "info");
  } else if (currentUser.role === "admin") {
    switchTab("admin");
    showToast(`Switched to Platform Admin: ${currentUser.name}`, "info");
  }
}

// ==========================================
// TAB NAVIGATION
// ==========================================

function switchTab(tabId) {
  currentTab = tabId;

  const views = ["Marketplace", "Farmer", "Buyer", "Trends", "Admin"];
  views.forEach(v => {
    const el = document.getElementById(`view${v}`);
    const navBtn = document.getElementById(`nav${v}`);
    if (el) el.classList.add("hidden");
    if (navBtn) {
      navBtn.classList.remove("text-emerald-700", "bg-emerald-50", "font-semibold");
      navBtn.classList.add("text-slate-600", "font-medium");
    }
  });

  const activeView = document.getElementById(`view${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`);
  const activeNav = document.getElementById(`nav${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`);
  
  if (activeView) activeView.classList.remove("hidden");
  if (activeNav) {
    activeNav.classList.remove("text-slate-600", "font-medium");
    activeNav.classList.add("text-emerald-700", "bg-emerald-50", "font-semibold");
  }

  // Trigger relevant updates
  if (tabId === "marketplace") {
    loadProducts();
  } else if (tabId === "farmer") {
    updateFarmerDashboard();
  } else if (tabId === "buyer") {
    updateBuyerDashboard();
  } else if (tabId === "trends") {
    loadPriceTrends();
  } else if (tabId === "admin") {
    loadAdminData();
  }
}

// ==========================================
// PRODUCT CATALOG & FILTERING
// ==========================================

async function loadProducts() {
  try {
    const params = new URLSearchParams();
    
    const searchVal = document.getElementById("heroSearchInput") ? document.getElementById("heroSearchInput").value.trim() : "";
    if (searchVal) params.append("search", searchVal);

    if (activeCategory && activeCategory !== "All") params.append("category", activeCategory);

    const priceRangeEl = document.getElementById("priceRangeInput");
    const priceVal = priceRangeEl ? parseFloat(priceRangeEl.value) : null;
    if (priceVal && !isNaN(priceVal) && priceVal < 2000 && priceVal > 0) {
      params.append("max_price", priceVal);
    }

    const locVal = document.getElementById("locationSelect") ? document.getElementById("locationSelect").value : "All";
    if (locVal && locVal !== "All") params.append("location", locVal);

    const delVal = document.getElementById("deliverySelect") ? document.getElementById("deliverySelect").value : "All";
    if (delVal && delVal !== "All") params.append("pickup_delivery", delVal);

    const inStockEl = document.getElementById("chkInStockOnly");
    const inStock = inStockEl ? inStockEl.checked : false;
    if (inStock) params.append("in_stock_only", "true");

    const sortVal = document.getElementById("sortBySelect") ? document.getElementById("sortBySelect").value : "freshness";
    if (sortVal) params.append("sort_by", sortVal);

    // For general marketplace, only show active listings
    params.append("status", "active");

    const res = await fetch(`${API_BASE}/api/products?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }
    const data = await res.json();
    allProducts = Array.isArray(data) ? data : [];
    renderProductCards(allProducts);
  } catch (err) {
    console.error("Failed to load products:", err);
    const grid = document.getElementById("productGrid");
    if (grid) {
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center bg-white rounded-3xl border border-rose-200 p-8 space-y-3">
          <div class="text-4xl text-rose-500">⚠️</div>
          <h3 class="font-display font-bold text-slate-800 text-lg">Unable to load produce from server</h3>
          <p class="text-xs text-slate-500 max-w-sm mx-auto">Please ensure the backend server is running, or click below to retry.</p>
          <button onclick="loadProducts()" class="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition">Retry Loading Catalog</button>
        </div>
      `;
    }
  }
}

function setCategory(cat) {
  activeCategory = cat;
  document.querySelectorAll(".cat-chip").forEach(btn => {
    if (btn.getAttribute("data-cat") === cat) {
      btn.className = "cat-chip active px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-700 text-white shadow-sm transition";
    } else {
      btn.className = "cat-chip px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition";
    }
  });
  loadProducts();
}

function onSearchInput(val) {
  // Simple debounce
  clearTimeout(window._searchTimer);
  window._searchTimer = setTimeout(() => {
    loadProducts();
  }, 250);
}

function applyFilters() {
  loadProducts();
}

function resetFilters() {
  if (document.getElementById("heroSearchInput")) document.getElementById("heroSearchInput").value = "";
  if (document.getElementById("priceRangeInput")) {
    document.getElementById("priceRangeInput").value = 2000;
    document.getElementById("priceRangeVal").innerText = "₹2000";
  }
  if (document.getElementById("locationSelect")) document.getElementById("locationSelect").value = "All";
  if (document.getElementById("deliverySelect")) document.getElementById("deliverySelect").value = "All";
  if (document.getElementById("chkInStockOnly")) document.getElementById("chkInStockOnly").checked = true;
  setCategory("All");
}

function toggleFilterDrawer() {
  const drawer = document.getElementById("filterDrawer");
  drawer.classList.toggle("hidden");
}

function renderProductCards(products) {
  const grid = document.getElementById("productGrid");
  const countEl = document.getElementById("productResultCount");
  if (countEl) countEl.innerText = products.length;

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
        <div class="text-4xl">🌾</div>
        <h3 class="font-display font-bold text-slate-800 text-lg">No matching produce found</h3>
        <p class="text-xs text-slate-500 max-w-sm mx-auto">Try adjusting your filters, price range, or category search.</p>
        <button onclick="resetFilters()" class="text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl">Clear All Filters</button>
      </div>
    `;
    return;
  }

  const lang = i18n[currentLanguage];

  grid.innerHTML = products.map(p => {
    const isOutOfStock = p.available_quantity <= 0;
    const isLowStock = p.available_quantity > 0 && p.available_quantity <= 15;
    const savingsPercent = p.market_price_estimate ? Math.round(((p.market_price_estimate - p.price) / p.market_price_estimate) * 100) : 0;
    
    // Fulfillment badge
    let fulfillmentText = "🚜 Pickup & Delivery";
    if (p.pickup_delivery === "pickup_only") fulfillmentText = "🚜 Farm Pickup Only";
    else if (p.pickup_delivery === "delivery_only") fulfillmentText = "🚚 Local Delivery Only";

    // Harvest freshness
    const harvestDate = new Date(p.harvest_date);
    const daysAgo = Math.floor((new Date() - harvestDate) / 86400000);
    const freshnessStr = daysAgo === 0 ? "Harvested Today!" : daysAgo === 1 ? "Harvested Yesterday" : `${daysAgo} days fresh`;

    return `
      <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
        
        <!-- Image & Top Badges -->
        <div class="relative h-48 overflow-hidden bg-slate-100">
          <img src="${p.photo_url}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=600'">
          
          <div class="absolute top-3 left-3 flex flex-col gap-1 items-start">
            ${p.organic_certified ? '<span class="bg-emerald-700/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">🌱 Organic</span>' : ''}
            ${p.pesticide_free ? '<span class="bg-teal-700/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">Zero Pesticide</span>' : ''}
          </div>

          <div class="absolute top-3 right-3">
            <span class="bg-white/95 backdrop-blur-md text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              ${freshnessStr}
            </span>
          </div>

          ${savingsPercent > 0 ? `
            <div class="absolute bottom-2 left-3 bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">
              Save ${savingsPercent}% vs Retail
            </div>
          ` : ''}
        </div>

        <!-- Content -->
        <div class="p-5 flex-grow flex flex-col justify-between space-y-4">
          
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-[11px] text-slate-400">
              <span class="font-semibold text-emerald-800 uppercase tracking-wide">${p.category}</span>
              <span>${fulfillmentText}</span>
            </div>

            <h3 class="font-display font-bold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-emerald-700 transition">
              ${p.name}
            </h3>

            <p class="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
              ${p.description || 'Direct farm-fresh produce with verified harvest origin.'}
            </p>

            <!-- Farm / Grower Info -->
            <div class="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
              <div class="leading-tight">
                <div class="font-bold text-slate-800 flex items-center gap-1">
                  👨‍🌾 ${p.farm_name || p.farmer_name}
                </div>
                <div class="text-[10px] text-slate-500">📍 ${p.location}</div>
              </div>
              <div class="text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                ⭐ ${p.farmer_rating || 4.9}
              </div>
            </div>
          </div>

          <!-- Price, Bulk Tier & Stock Limits -->
          <div class="space-y-2 pt-2 border-t border-slate-100">
            
            <div class="flex items-baseline justify-between">
              <div>
                <span class="text-xs text-slate-400 font-medium">Farm Gate Price:</span>
                <div class="flex items-baseline space-x-1">
                  <span class="text-xl font-extrabold text-slate-900 font-display">₹${p.price.toFixed(2)}</span>
                  <span class="text-xs text-slate-500">/ ${p.unit}</span>
                </div>
              </div>

              ${p.market_price_estimate ? `
                <div class="text-right text-[11px] text-slate-400">
                  <div>Mandi est: <span class="line-through">₹${p.market_price_estimate.toFixed(2)}</span></div>
                </div>
              ` : ''}
            </div>

            <!-- Bulk Deal Indicator -->
            ${p.bulk_discount_qty > 0 ? `
              <div class="bg-emerald-50 text-emerald-800 text-[10px] px-2 py-1 rounded-lg font-semibold flex items-center justify-between">
                <span>📦 Bulk order ≥ ${p.bulk_discount_qty} ${p.unit}</span>
                <span class="font-bold text-emerald-700">${p.bulk_discount_percent}% OFF</span>
              </div>
            ` : ''}

            <!-- Stock Limit Indicator -->
            <div class="flex items-center justify-between text-[11px]">
              <span class="font-medium ${isOutOfStock ? 'text-rose-600 font-bold' : isLowStock ? 'text-amber-600 font-bold' : 'text-slate-500'}">
                ${isOutOfStock ? '❌ Sold Out' : isLowStock ? `⚠️ Only ${p.available_quantity} ${p.unit} left!` : `✅ ${p.available_quantity} ${p.unit} ${lang.stockLeft}`}
              </span>
              <button onclick="openTraceabilityModal(${p.id})" class="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5">
                <span>🔍</span>
                <span>${lang.viewTraceability}</span>
              </button>
            </div>

            <!-- Quantity & Add to Cart Controls -->
            <div class="flex items-center space-x-2 pt-2">
              <div class="flex items-center border border-slate-200 rounded-xl bg-slate-50 px-2 py-1 space-x-2 text-xs">
                <button onclick="adjustQtyInput(${p.id}, -1)" class="text-slate-500 hover:text-slate-900 font-bold px-1 text-sm">-</button>
                <input type="number" id="qtyInput_${p.id}" value="1" min="0" max="${p.available_quantity}" class="w-10 text-center bg-transparent border-0 font-bold text-slate-800 focus:outline-none p-0">
                <button onclick="adjustQtyInput(${p.id}, 1)" class="text-slate-500 hover:text-slate-900 font-bold px-1 text-sm">+</button>
              </div>

              <button 
                onclick="addToCart(${p.id})" 
                ${isOutOfStock ? 'disabled' : ''} 
                class="flex-grow py-2.5 px-3 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center space-x-1 ${isOutOfStock ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'}">
                <span>🛒</span>
                <span>${isOutOfStock ? lang.outOfStock : lang.addToCart}</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    `;
  }).join("");
}

function adjustQtyInput(prodId, delta) {
  const inp = document.getElementById(`qtyInput_${prodId}`);
  if (!inp) return;
  let val = parseFloat(inp.value);
  if (isNaN(val)) val = 0;
  val += delta;
  if (val < 0) val = 0;
  const max = parseFloat(inp.max) || 999;
  if (val > max) val = max;
  inp.value = val;
}

// ==========================================
// CART & ORDER CHECKOUT
// ==========================================

function addToCart(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const inp = document.getElementById(`qtyInput_${productId}`);
  const requestedQty = inp ? parseFloat(inp.value) || 1 : product.min_order_quantity;

  // Validation: quantity vs available stock
  if (requestedQty > product.available_quantity) {
    showToast(`Cannot order ${requestedQty} ${product.unit}. Only ${product.available_quantity} available.`, "error");
    return;
  }

  // Check if item already in cart
  const existingIndex = cart.findIndex(item => item.product.id === productId);
  if (existingIndex > -1) {
    const totalQty = cart[existingIndex].quantity + requestedQty;
    if (totalQty > product.available_quantity) {
      showToast(`Adding more exceeds total available stock (${product.available_quantity} ${product.unit}).`, "error");
      return;
    }
    cart[existingIndex].quantity = totalQty;
  } else {
    cart.push({ product, quantity: requestedQty });
  }

  updateCartBadge();
  renderCartDrawer();
  showToast(`Added ${requestedQty} ${product.unit} of ${product.name} to cart!`, "success");
}

function updateCartBadge() {
  const badge = document.getElementById("cartCountBadge");
  const count = cart.reduce((acc, i) => acc + i.quantity, 0);
  if (badge) badge.innerText = count;
}

function toggleCartDrawer(open) {
  const drawer = document.getElementById("cartDrawer");
  if (open) {
    renderCartDrawer();
    drawer.classList.remove("hidden");
  } else {
    drawer.classList.add("hidden");
  }
}

function renderCartDrawer() {
  const container = document.getElementById("cartItemsContainer");
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="py-16 text-center space-y-3">
        <div class="text-4xl text-slate-300">🛒</div>
        <p class="font-bold text-slate-700 text-sm">Your cart is empty</p>
        <p class="text-xs text-slate-400">Browse fresh produce from verified local farms and add them to your basket.</p>
      </div>
    `;
    updateCartSummary();
    return;
  }

  container.innerHTML = cart.map((item, index) => {
    const p = item.product;
    const isBulk = p.bulk_discount_qty > 0 && item.quantity >= p.bulk_discount_qty;
    const unitPrice = isBulk ? p.price * (1 - p.bulk_discount_percent / 100) : p.price;
    const itemTotal = unitPrice * item.quantity;

    return `
      <div class="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 flex items-center justify-between text-xs">
        <div class="flex items-center space-x-3">
          <img src="${p.photo_url}" class="w-12 h-12 rounded-xl object-cover border border-slate-200" alt="">
          <div>
            <div class="font-bold text-slate-800">${p.name}</div>
            <div class="text-[10px] text-slate-500">👨‍🌾 ${p.farm_name || p.farmer_name}</div>
            <div class="text-[11px] font-semibold text-slate-700 mt-0.5">
              ₹${unitPrice.toFixed(2)} / ${p.unit} 
              ${isBulk ? `<span class="text-emerald-700 text-[10px] font-bold">(${p.bulk_discount_percent}% Bulk Deal)</span>` : ''}
            </div>
          </div>
        </div>

        <div class="text-right space-y-1">
          <div class="flex items-center space-x-1.5 justify-end">
            <button onclick="changeCartQty(${index}, -1)" class="w-5 h-5 rounded bg-white border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 flex items-center justify-center">-</button>
            <span class="font-bold text-slate-800 px-1">${item.quantity}</span>
            <button onclick="changeCartQty(${index}, 1)" class="w-5 h-5 rounded bg-white border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 flex items-center justify-center">+</button>
            <button onclick="removeFromCart(${index})" class="text-rose-500 hover:text-rose-700 ml-1">✕</button>
          </div>
          <div class="font-bold text-slate-900 text-sm">₹${itemTotal.toFixed(2)}</div>
        </div>
      </div>
    `;
  }).join("");

  updateCartSummary();
}

function changeCartQty(index, delta) {
  if (!cart[index]) return;
  const p = cart[index].product;
  const newQty = cart[index].quantity + delta;

  if (newQty <= 0) {
    removeFromCart(index);
    return;
  }

  if (newQty > p.available_quantity) {
    showToast(`Cannot exceed available stock of ${p.available_quantity} ${p.unit}.`, "error");
    return;
  }

  cart[index].quantity = newQty;
  updateCartBadge();
  renderCartDrawer();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartBadge();
  renderCartDrawer();
}

function updateCartSummary() {
  const deliveryTypeEl = document.querySelector("input[name='cartDeliveryType']:checked");
  const deliveryType = deliveryTypeEl ? deliveryTypeEl.value : "pickup";
  
  const addressGroup = document.getElementById("deliveryAddressGroup");
  if (addressGroup) {
    if (deliveryType === "delivery") addressGroup.classList.remove("hidden");
    else addressGroup.classList.add("hidden");
  }

  let subtotal = 0;
  cart.forEach(item => {
    const p = item.product;
    const isBulk = p.bulk_discount_qty > 0 && item.quantity >= p.bulk_discount_qty;
    const unitPrice = isBulk ? p.price * (1 - p.bulk_discount_percent / 100) : p.price;
    subtotal += unitPrice * item.quantity;
  });

  const deliveryFee = deliveryType === "delivery" && cart.length > 0 ? 40.0 : 0.0;
  const grandTotal = subtotal + deliveryFee;

  document.getElementById("cartSubtotal").innerText = `₹${subtotal.toFixed(2)}`;
  document.getElementById("cartDeliveryFee").innerText = deliveryFee > 0 ? `₹${deliveryFee.toFixed(2)}` : "Free";
  document.getElementById("cartTotal").innerText = `₹${grandTotal.toFixed(2)}`;

  const btn = document.getElementById("btnPlaceOrder");
  if (btn) btn.disabled = cart.length === 0;
}

async function submitOrderRequest() {
  if (cart.length === 0) {
    showToast("Your cart is empty!", "error");
    return;
  }

  if (!currentUser || currentUser.role !== "buyer") {
    showToast("Please switch to a Buyer profile (e.g., Priya Sharma) to place orders.", "error");
    return;
  }

  const deliveryTypeEl = document.querySelector("input[name='cartDeliveryType']:checked");
  const deliveryType = deliveryTypeEl ? deliveryTypeEl.value : "pickup";
  const deliveryAddress = document.getElementById("cartDeliveryAddress") ? document.getElementById("cartDeliveryAddress").value.trim() : "";
  const paymentMethod = document.getElementById("cartPaymentMethod").value;

  const orderPayload = {
    buyer_id: currentUser.id,
    items: cart.map(i => ({ product_id: i.product.id, quantity: i.quantity })),
    delivery_type: deliveryType,
    delivery_address: deliveryAddress || currentUser.address || "Farm Gate Pickup Point",
    payment_method: paymentMethod,
    notes: "Ordered via AgriMarket Student Prototype"
  };

  try {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || "Failed to place order");
    }

    // Success!
    showToast("Order request sent to farmer! Inventory updated.", "success");
    cart = [];
    updateCartBadge();
    toggleCartDrawer(false);

    // Refresh products catalog to show decreased stock
    await loadProducts();

    // Switch to Buyer tab so user can watch the order status!
    switchTab("buyer");

  } catch (err) {
    console.error("Order error:", err);
    showToast(err.message, "error");
  }
}

// ==========================================
// FARMER DASHBOARD (FARMER HUB)
// ==========================================

async function updateFarmerDashboard() {
  // If current user is not a farmer, find first farmer or prompt
  let farmer = currentUser;
  if (!farmer || farmer.role !== "farmer") {
    farmer = allUsers.find(u => u.role === "farmer") || null;
  }
  if (!farmer) return;

  // Header
  document.getElementById("farmerHeroName").innerText = farmer.name;
  document.getElementById("farmerHeroFarmName").innerText = farmer.farm_name || "Organic Farm";
  document.getElementById("farmerHeroLocation").innerText = `📍 ${farmer.location} • 📞 ${farmer.phone || '8074868505'}`;
  document.getElementById("farmerHeroAvatar").src = farmer.avatar_url || "https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=200";

  // Load Farmer's Products & Orders
  try {
    const [prodsRes, ordersRes] = await Promise.all([
      fetch(`${API_BASE}/api/products?farmer_id=${farmer.id}&status=all`),
      fetch(`${API_BASE}/api/orders?farmer_id=${farmer.id}`)
    ]);

    const myProducts = await prodsRes.json();
    const myOrders = await ordersRes.json();

    // Stats
    const activeCount = myProducts.filter(p => p.status === "active").length;
    const totalStock = myProducts.filter(p => p.status === "active").reduce((acc, p) => acc + p.available_quantity, 0);
    const pendingOrders = myOrders.filter(o => o.status === "requested" || o.status === "accepted").length;
    const revenue = myOrders.filter(o => o.status !== "cancelled").reduce((acc, o) => acc + o.total_amount, 0);

    document.getElementById("statFarmerActiveProducts").innerText = activeCount;
    document.getElementById("statFarmerTotalStock").innerText = totalStock.toFixed(0);
    document.getElementById("statFarmerPendingOrders").innerText = pendingOrders;
    document.getElementById("statFarmerRevenue").innerText = `₹${revenue.toFixed(2)}`;

    // Update nav badge
    const badge = document.getElementById("farmerBadgeOrders");
    if (badge) {
      badge.innerText = pendingOrders;
      badge.className = pendingOrders > 0 ? "text-[10px] bg-amber-500 text-white px-1.5 py-0.2 rounded-full font-bold ml-1 inline-block" : "hidden";
    }

    renderFarmerOrders(myOrders);
    renderFarmerInventory(myProducts);

  } catch (err) {
    console.error("Farmer dashboard error:", err);
  }
}

function renderFarmerOrders(orders) {
  const container = document.getElementById("farmerOrdersList");
  const countBadge = document.getElementById("farmerPendingOrderCount");
  
  const pending = orders.filter(o => o.status === "requested" || o.status === "accepted").length;
  if (countBadge) countBadge.innerText = `${pending} Pending`;

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="py-10 text-center text-slate-400 text-xs">
        No orders received yet for this farm.
      </div>
    `;
    return;
  }

  container.innerHTML = orders.map(o => {
    let statusClass = "bg-amber-100 text-amber-800 border-amber-200";
    if (o.status === "accepted") statusClass = "bg-blue-100 text-blue-800 border-blue-200";
    else if (o.status === "ready") statusClass = "bg-purple-100 text-purple-800 border-purple-200";
    else if (o.status === "completed") statusClass = "bg-emerald-100 text-emerald-800 border-emerald-200";
    else if (o.status === "cancelled") statusClass = "bg-rose-100 text-rose-800 border-rose-200";

    const itemsSummary = o.items.map(i => `${i.quantity} ${i.unit} ${i.product_name} (₹${i.total_price})`).join(", ");

    return `
      <div class="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        
        <div class="space-y-1">
          <div class="flex items-center space-x-2">
            <span class="font-mono font-bold text-slate-800">#ORD-${o.id}</span>
            <span class="px-2 py-0.5 rounded-full font-bold uppercase text-[9px] border ${statusClass}">${o.status}</span>
            <span class="text-slate-400 text-[10px]">${new Date(o.created_at).toLocaleDateString()}</span>
          </div>

          <div class="text-slate-800 font-semibold">
            👤 Buyer: <span class="font-bold">${o.buyer_name}</span> (${o.buyer_phone || 'No phone'})
          </div>

          <div class="text-slate-600">
            📦 Items: <span class="font-medium text-slate-900">${itemsSummary}</span>
          </div>

          <div class="text-[11px] text-slate-500">
            ${o.delivery_type === 'pickup' ? '🚜 Farm Gate Pickup' : `🚚 Delivery to: ${o.delivery_address}`} • 
            Payment: <span class="capitalize">${o.payment_method.replace(/_/g, ' ')}</span> (${o.payment_status})
          </div>
        </div>

        <div class="flex flex-col sm:items-end justify-between space-y-2">
          <div class="text-base font-extrabold text-slate-900 font-display">
            ₹${o.total_amount.toFixed(2)}
          </div>

          <div class="flex items-center space-x-2">
            ${o.status === 'requested' ? `
              <button onclick="updateOrderStatus(${o.id}, 'accepted')" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl transition">
                Accept Order
              </button>
              <button onclick="cancelOrderPrompt(${o.id})" class="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold px-3 py-1.5 rounded-xl transition">
                Decline
              </button>
            ` : ''}

            ${o.status === 'accepted' ? `
              <button onclick="updateOrderStatus(${o.id}, 'ready')" class="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-xl transition">
                Mark Ready for Pickup
              </button>
              <button onclick="cancelOrderPrompt(${o.id})" class="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold px-3 py-1.5 rounded-xl transition">
                Cancel
              </button>
            ` : ''}

            ${o.status === 'ready' ? `
              <button onclick="updateOrderStatus(${o.id}, 'completed')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl transition">
                Mark Completed
              </button>
            ` : ''}

            ${o.status === 'completed' ? `
              <span class="text-emerald-700 font-bold flex items-center gap-1">
                <span>✓ Completed & Settled</span>
              </span>
            ` : ''}

            ${o.status === 'cancelled' ? `
              <span class="text-rose-600 font-semibold text-[11px]">
                Cancelled (${o.cancel_reason || 'By grower'}) • Stock restored
              </span>
            ` : ''}
          </div>
        </div>

      </div>
    `;
  }).join("");
}

function renderFarmerInventory(products) {
  const table = document.getElementById("farmerInventoryTable");
  if (products.length === 0) {
    table.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400">No produce listed yet. Click "+ List New Produce" to get started!</td></tr>`;
    return;
  }

  table.innerHTML = products.map(p => {
    return `
      <tr class="hover:bg-slate-50 transition">
        <td class="py-3 px-3">
          <div class="flex items-center space-x-2">
            <img src="${p.photo_url}" class="w-9 h-9 rounded-lg object-cover border border-slate-200" alt="">
            <div>
              <div class="font-bold text-slate-800">${p.name}</div>
              <div class="text-[10px] text-slate-400 font-mono">${p.batch_number}</div>
            </div>
          </div>
        </td>
        <td class="py-3 px-3 font-medium text-slate-600">${p.category}</td>
        <td class="py-3 px-3">
          <div class="flex items-center space-x-1.5">
            <span class="font-bold text-slate-900">₹${p.price.toFixed(2)} / ${p.unit}</span>
            <button onclick="adjustPricePrompt(${p.id}, ${p.price})" class="text-[10px] bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-600">Edit</button>
          </div>
        </td>
        <td class="py-3 px-3">
          <div class="flex items-center space-x-1.5">
            <span class="font-bold ${p.available_quantity <= 10 ? 'text-rose-600' : 'text-slate-800'}">${p.available_quantity} ${p.unit}</span>
            <button onclick="adjustInventoryPrompt(${p.id}, ${p.available_quantity})" class="text-[10px] bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded font-bold">Edit</button>
          </div>
        </td>
        <td class="py-3 px-3 text-slate-500">${p.harvest_date}</td>
        <td class="py-3 px-3">
          <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : p.status === 'flagged' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'}">
            ${p.status}
          </span>
        </td>
        <td class="py-3 px-3 text-right space-x-1">
          <button onclick="toggleProductStatus(${p.id}, '${p.status === 'active' ? 'paused' : 'active'}')" class="text-[10px] px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700">
            ${p.status === 'active' ? 'Pause' : 'Activate'}
          </button>
          <button onclick="deleteProductListing(${p.id})" class="text-[10px] px-2 py-1 bg-rose-50 hover:bg-rose-100 rounded font-semibold text-rose-700">
            Archive
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

async function updateOrderStatus(orderId, newStatus, reason = "") {
  try {
    const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: newStatus,
        cancel_reason: reason,
        user_id: currentUser ? currentUser.id : 1
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Status update failed");

    showToast(`Order status updated to '${newStatus}'!`, "success");
    if (currentTab === "farmer") updateFarmerDashboard();
    else if (currentTab === "buyer") updateBuyerDashboard();
  } catch (err) {
    showToast(err.message, "error");
  }
}

function cancelOrderPrompt(orderId) {
  const reason = prompt("Please enter cancellation reason (stock will be restored to inventory):", "Buyer request / Farm adjustment");
  if (reason !== null) {
    updateOrderStatus(orderId, "cancelled", reason);
  }
}

async function adjustInventoryPrompt(prodId, currentStock) {
  const newStock = prompt(`Update stock quantity for this produce (current: ${currentStock}):`, currentStock);
  if (newStock !== null && !isNaN(newStock) && newStock.trim() !== "") {
    try {
      const res = await fetch(`${API_BASE}/api/products/${prodId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available_quantity: parseFloat(newStock) })
      });
      if (!res.ok) throw new Error("Failed to update stock");
      showToast("Stock quantity updated successfully!", "success");
      updateFarmerDashboard();
      loadProducts();
    } catch (err) {
      showToast(err.message, "error");
    }
  }
}

async function adjustPricePrompt(prodId, currentPrice) {
  const newPrice = prompt(`Enter new unit price (₹) for this produce (current: ₹${currentPrice}):`, currentPrice);
  if (newPrice !== null && !isNaN(newPrice) && parseFloat(newPrice) > 0) {
    try {
      const res = await fetch(`${API_BASE}/api/products/${prodId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: parseFloat(newPrice) })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to update price");
      }
      showToast("Price updated successfully!", "success");
      updateFarmerDashboard();
      loadProducts();
    } catch (err) {
      showToast(err.message, "error");
    }
  }
}

async function toggleProductStatus(prodId, newStatus) {
  try {
    const res = await fetch(`${API_BASE}/api/products/${prodId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    if (!res.ok) throw new Error("Failed to update listing status");
    showToast(`Listing is now ${newStatus}`, "info");
    updateFarmerDashboard();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function deleteProductListing(prodId) {
  if (!confirm("Are you sure you want to archive this produce listing?")) return;
  try {
    const res = await fetch(`${API_BASE}/api/products/${prodId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to archive listing");
    showToast("Listing archived successfully", "info");
    updateFarmerDashboard();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ==========================================
// ADD PRODUCE MODAL
// ==========================================

function openAddProductModal() {
  document.getElementById("modalAddProduct").classList.remove("hidden");
}

function closeAddProductModal() {
  document.getElementById("modalAddProduct").classList.add("hidden");
}

function fillSamplePhoto() {
  const samplePhotos = [
    "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600", // Tomatoes
    "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600", // Spinach
    "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600", // Apples
    "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600", // Rice
    "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600", // Milk
    "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600", // Pepper
  ];
  const rand = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
  document.getElementById("inpProdPhoto").value = rand;
}

async function handleCreateProduct(e) {
  e.preventDefault();
  
  let farmer = currentUser;
  if (!farmer || farmer.role !== "farmer") {
    farmer = allUsers.find(u => u.role === "farmer") || allUsers[0];
  }

  const payload = {
    farmer_id: farmer.id,
    name: document.getElementById("inpProdName").value.trim(),
    category: document.getElementById("inpProdCategory").value,
    unit: document.getElementById("inpProdUnit").value,
    price: parseFloat(document.getElementById("inpProdPrice").value),
    available_quantity: parseFloat(document.getElementById("inpProdQuantity").value),
    min_order_quantity: parseFloat(document.getElementById("inpProdMOQ").value) || 1.0,
    bulk_discount_qty: parseFloat(document.getElementById("inpProdBulkQty").value) || 0,
    bulk_discount_percent: parseFloat(document.getElementById("inpProdBulkPct").value) || 0,
    harvest_date: document.getElementById("inpProdHarvestDate").value,
    availability_date: document.getElementById("inpProdAvailDate").value,
    pickup_delivery: document.getElementById("inpProdFulfillment").value,
    location: farmer.location,
    photo_url: document.getElementById("inpProdPhoto").value.trim(),
    description: document.getElementById("inpProdDesc").value.trim(),
    organic_certified: document.getElementById("inpProdOrganic").checked,
    pesticide_free: document.getElementById("inpProdPesticideFree").checked
  };

  try {
    const res = await fetch(`${API_BASE}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to create produce listing");

    closeAddProductModal();
    document.getElementById("formAddProduct").reset();

    if (data.is_duplicate) {
      showToast("Notice: Duplicate name detected! Product flagged for Admin review.", "info");
    } else {
      showToast("Produce listing published successfully!", "success");
    }

    updateFarmerDashboard();
    loadProducts();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ==========================================
// BUYER DASHBOARD (MY ORDERS)
// ==========================================

async function updateBuyerDashboard() {
  let buyer = currentUser;
  if (!buyer || buyer.role !== "buyer") {
    buyer = allUsers.find(u => u.role === "buyer") || null;
  }
  if (!buyer) return;

  try {
    const res = await fetch(`${API_BASE}/api/orders?buyer_id=${buyer.id}`);
    const orders = await res.json();
    
    // Update badge count
    const activeOrders = orders.filter(o => o.status !== "completed" && o.status !== "cancelled").length;
    const badge = document.getElementById("buyerBadgeOrders");
    if (badge) {
      badge.innerText = activeOrders;
      badge.className = activeOrders > 0 ? "text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full font-bold ml-1 inline-block" : "hidden";
    }

    renderBuyerOrders(orders);
  } catch (err) {
    console.error("Buyer dashboard error:", err);
  }
}

function renderBuyerOrders(orders) {
  const container = document.getElementById("buyerOrdersList");

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
        <div class="text-4xl text-slate-300">📦</div>
        <h3 class="font-display font-bold text-slate-800 text-lg">No orders placed yet</h3>
        <p class="text-xs text-slate-500 max-w-sm mx-auto">Browse verified local farms and place your first fresh produce order.</p>
        <button onclick="switchTab('marketplace')" class="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl">Explore Produce Market</button>
      </div>
    `;
    return;
  }

  const steps = ["requested", "accepted", "ready", "completed"];

  container.innerHTML = orders.map(o => {
    const isCancelled = o.status === "cancelled";
    const currentStepIndex = steps.indexOf(o.status);

    return `
      <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div class="flex items-center space-x-2">
              <span class="font-mono font-bold text-slate-900 text-sm">Order #ORD-${o.id}</span>
              <span class="text-xs text-slate-400">• ${new Date(o.created_at).toLocaleDateString()}</span>
            </div>
            <div class="text-xs text-slate-600 mt-0.5">
              Farm: <span class="font-bold text-emerald-800">👨‍🌾 ${o.farm_name || o.farmer_name}</span> (📍 ${o.farm_location})
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <div class="text-right">
              <div class="text-xs text-slate-400">Total Order:</div>
              <div class="text-lg font-extrabold text-slate-900 font-display">₹${o.total_amount.toFixed(2)}</div>
            </div>

            ${o.status === 'requested' ? `
              <button onclick="cancelOrderPrompt(${o.id})" class="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition">
                Cancel Request
              </button>
            ` : ''}
          </div>
        </div>

        <!-- 4-Stage Lifecycle Progress Tracker -->
        ${!isCancelled ? `
          <div class="py-2">
            <div class="grid grid-cols-4 gap-2 text-center text-[11px]">
              <div class="${currentStepIndex >= 0 ? 'text-emerald-700 font-bold' : 'text-slate-400'}">
                <div class="w-7 h-7 mx-auto rounded-full flex items-center justify-center mb-1 ${currentStepIndex >= 0 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}">1</div>
                <div>Requested</div>
              </div>
              <div class="${currentStepIndex >= 1 ? 'text-emerald-700 font-bold' : 'text-slate-400'}">
                <div class="w-7 h-7 mx-auto rounded-full flex items-center justify-center mb-1 ${currentStepIndex >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}">2</div>
                <div>Accepted</div>
              </div>
              <div class="${currentStepIndex >= 2 ? 'text-emerald-700 font-bold' : 'text-slate-400'}">
                <div class="w-7 h-7 mx-auto rounded-full flex items-center justify-center mb-1 ${currentStepIndex >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}">3</div>
                <div>Ready for Pickup</div>
              </div>
              <div class="${currentStepIndex >= 3 ? 'text-emerald-700 font-bold' : 'text-slate-400'}">
                <div class="w-7 h-7 mx-auto rounded-full flex items-center justify-center mb-1 ${currentStepIndex >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}">4</div>
                <div>Completed</div>
              </div>
            </div>
            <!-- Progress bar line -->
            <div class="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div class="bg-emerald-600 h-full transition-all duration-500" style="width: ${((currentStepIndex + 1) / 4) * 100}%"></div>
            </div>
          </div>
        ` : `
          <div class="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-2xl flex items-center space-x-2">
            <span>❌</span>
            <div>
              <strong>Order Cancelled:</strong> ${o.cancel_reason || 'Order cancelled by user'} • Reserved inventory restored.
            </div>
          </div>
        `}

        <!-- Line Items -->
        <div class="space-y-2 pt-2 border-t border-slate-100 text-xs">
          <div class="font-bold text-slate-700">Order Items:</div>
          <div class="divide-y divide-slate-100">
            ${o.items.map(item => `
              <div class="py-1.5 flex justify-between items-center text-slate-600">
                <div>
                  <span class="font-semibold text-slate-800">${item.product_name}</span>
                  <span class="text-[11px] text-slate-400">(${item.quantity} ${item.unit} @ ₹${item.unit_price} / ${item.unit})</span>
                </div>
                <div class="font-bold text-slate-900">₹${item.total_price.toFixed(2)}</div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Footer Info & Logistics Notice -->
        <div class="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
          <div>
            Fulfillment: <span class="font-bold text-slate-700">${o.delivery_type === 'pickup' ? '🚜 Farm Gate Pickup' : '🚚 Local Direct Delivery'}</span> •
            Payment: <span class="capitalize font-medium">${o.payment_method.replace(/_/g, ' ')}</span> (${o.payment_status})
          </div>
          <div class="text-emerald-700 font-semibold">
            📞 Direct Farm Contact: ${o.farmer_phone || '8074868505'}
          </div>
        </div>

      </div>
    `;
  }).join("");
}

// ==========================================
// PRICE TRENDS & BENCHMARKS
// ==========================================

async function loadPriceTrends() {
  try {
    const res = await fetch(`${API_BASE}/api/analytics/price-trends`);
    const trends = await res.json();
    renderPriceTrends(trends);
  } catch (err) {
    console.error("Trends error:", err);
  }
}

function renderPriceTrends(trends) {
  const table = document.getElementById("priceTrendsTable");
  if (!table) return;

  table.innerHTML = trends.map(t => {
    return `
      <tr class="hover:bg-slate-50 transition">
        <td class="py-3 px-3 font-bold text-slate-800">${t.name}</td>
        <td class="py-3 px-3 text-slate-500">${t.category}</td>
        <td class="py-3 px-3 text-slate-500">${t.unit}</td>
        <td class="py-3 px-3 font-extrabold text-emerald-800">₹${t.farmer_price.toFixed(2)}</td>
        <td class="py-3 px-3 text-slate-500 line-through">₹${t.retail_price.toFixed(2)}</td>
        <td class="py-3 px-3 font-bold text-emerald-700 bg-emerald-50/50">
          Save ${t.buyer_savings_percent}%
        </td>
        <td class="py-3 px-3">
          <span class="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
            Farmer gets +35% margin
          </span>
        </td>
      </tr>
    `;
  }).join("");
}

// ==========================================
// ADMIN MODERATION & PLATFORM METRICS
// ==========================================

async function loadAdminData() {
  try {
    const [metricsRes, listingsRes] = await Promise.all([
      fetch(`${API_BASE}/api/admin/metrics`),
      fetch(`${API_BASE}/api/admin/listings`)
    ]);

    const metrics = await metricsRes.json();
    const listings = await listingsRes.json();

    document.getElementById("admTotalFarmers").innerText = metrics.total_farmers;
    document.getElementById("admTotalBuyers").innerText = metrics.total_buyers;
    document.getElementById("admActiveProducts").innerText = metrics.active_products;
    document.getElementById("admFlaggedProducts").innerText = metrics.flagged_products;
    document.getElementById("admTotalOrders").innerText = metrics.total_orders;
    document.getElementById("admPlatformGMV").innerText = `₹${metrics.gross_merchandise_value.toFixed(2)}`;

    // Update nav badge
    const badge = document.getElementById("adminBadgeFlags");
    if (badge) {
      badge.innerText = metrics.flagged_products;
      badge.className = metrics.flagged_products > 0 ? "text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-bold ml-1 inline-block" : "hidden";
    }

    renderAdminTable(listings);
  } catch (err) {
    console.error("Admin data error:", err);
  }
}

function renderAdminTable(listings) {
  const table = document.getElementById("adminModerationTable");
  if (!table) return;

  table.innerHTML = listings.map(p => {
    return `
      <tr class="hover:bg-slate-50 transition ${p.is_duplicate || p.status === 'flagged' ? 'bg-rose-50/30' : ''}">
        <td class="py-3 px-3">
          <div class="font-bold text-slate-800">${p.name}</div>
          <div class="text-[10px] text-slate-400 font-mono">${p.batch_number}</div>
        </td>
        <td class="py-3 px-3">
          <div class="font-semibold text-slate-700">${p.farmer_name}</div>
          <div class="text-[10px] text-slate-400">${p.farm_name}</div>
        </td>
        <td class="py-3 px-3 font-bold text-slate-900">₹${p.price.toFixed(2)}</td>
        <td class="py-3 px-3 text-slate-600">${p.available_quantity} ${p.unit}</td>
        <td class="py-3 px-3">
          ${p.is_duplicate ? `
            <span class="text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded text-[10px]">
              ⚠️ Duplicate Title Match
            </span>
          ` : p.moderation_note ? `
            <span class="text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded text-[10px]">
              ${p.moderation_note}
            </span>
          ` : `
            <span class="text-slate-400 text-[10px]">Normal</span>
          `}
        </td>
        <td class="py-3 px-3">
          <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : p.status === 'flagged' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'}">
            ${p.status}
          </span>
        </td>
        <td class="py-3 px-3 text-right space-x-1">
          <button onclick="moderateListing(${p.id}, 'approved')" class="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded transition">
            Approve
          </button>
          <button onclick="moderateListing(${p.id}, 'flagged')" class="text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold px-2 py-1 rounded transition">
            Flag
          </button>
          <button onclick="moderateListing(${p.id}, 'rejected')" class="text-[10px] bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold px-2 py-1 rounded transition">
            Reject
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

async function moderateListing(prodId, action) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/listings/${prodId}/moderate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        admin_id: 9, // Super Admin
        action: action,
        reason: `Moderator reviewed and marked as ${action}`
      })
    });

    if (!res.ok) throw new Error("Moderation action failed");
    showToast(`Listing #${prodId} marked as ${action}!`, "success");
    loadAdminData();
    loadProducts();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ==========================================
// TRACEABILITY & PROVENANCE MODAL
// ==========================================

async function openTraceabilityModal(productId) {
  try {
    const res = await fetch(`${API_BASE}/api/products/${productId}`);
    const p = await res.json();

    const container = document.getElementById("traceabilityContent");
    container.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
          <img src="${p.photo_url}" class="w-14 h-14 rounded-xl object-cover" alt="">
          <div>
            <div class="font-bold text-slate-900 text-sm">${p.name}</div>
            <div class="text-[11px] text-emerald-800 font-semibold font-mono">Batch: ${p.batch_number}</div>
            <div class="text-[10px] text-slate-500">Category: ${p.category} • Unit: ${p.unit}</div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="p-2.5 bg-slate-50 rounded-xl">
            <div class="text-[10px] text-slate-400 font-bold uppercase">Farm of Origin</div>
            <div class="font-bold text-slate-800">${p.farm_name || p.farmer_name}</div>
            <div class="text-[10px] text-slate-500">📍 ${p.location}</div>
          </div>
          <div class="p-2.5 bg-slate-50 rounded-xl">
            <div class="text-[10px] text-slate-400 font-bold uppercase">Harvest Date</div>
            <div class="font-bold text-slate-800">${p.harvest_date}</div>
            <div class="text-[10px] text-emerald-600 font-semibold">Peak Freshness</div>
          </div>
        </div>

        <div class="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
          <div>
            <div class="font-bold text-emerald-900">Certification & Standards</div>
            <div class="text-[10px] text-emerald-700">Zero Synthetic Pesticides • Organic Farming</div>
          </div>
          <span class="text-xl">🌱</span>
        </div>

        <!-- Generated Traceability QR Code Simulation -->
        <div class="text-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Scan to Verify Provenance</div>
          <div class="inline-block p-2 bg-white rounded-xl shadow-sm border border-slate-200">
            <svg class="w-28 h-28 mx-auto" viewBox="0 0 100 100" fill="currentColor">
              <!-- Simulated Scannable QR Matrix -->
              <rect x="10" y="10" width="25" height="25" fill="#064e3b" />
              <rect x="15" y="15" width="15" height="15" fill="#ffffff" />
              <rect x="18" y="18" width="9" height="9" fill="#064e3b" />

              <rect x="65" y="10" width="25" height="25" fill="#064e3b" />
              <rect x="70" y="15" width="15" height="15" fill="#ffffff" />
              <rect x="73" y="18" width="9" height="9" fill="#064e3b" />

              <rect x="10" y="65" width="25" height="25" fill="#064e3b" />
              <rect x="15" y="70" width="15" height="15" fill="#ffffff" />
              <rect x="18" y="73" width="9" height="9" fill="#064e3b" />

              <!-- Matrix data points -->
              <circle cx="45" cy="20" r="3" fill="#064e3b" />
              <circle cx="55" cy="25" r="3" fill="#064e3b" />
              <circle cx="45" cy="45" r="4" fill="#064e3b" />
              <circle cx="55" cy="55" r="4" fill="#064e3b" />
              <circle cx="20" cy="45" r="3" fill="#064e3b" />
              <circle cx="80" cy="45" r="3" fill="#064e3b" />
              <circle cx="45" cy="75" r="3" fill="#064e3b" />
              <circle cx="70" cy="75" r="4" fill="#064e3b" />
              <circle cx="85" cy="85" r="4" fill="#064e3b" />
            </svg>
          </div>
          <div class="text-[10px] font-mono text-slate-400">UUID: ${p.batch_number}</div>
        </div>
      </div>
    `;

    document.getElementById("modalTraceability").classList.remove("hidden");
  } catch (err) {
    showToast("Failed to load traceability record", "error");
  }
}

function closeTraceabilityModal() {
  document.getElementById("modalTraceability").classList.add("hidden");
}

// ==========================================
// RESET DEMO STATE & MULTILINGUAL UI
// ==========================================

async function resetDemoData() {
  if (!confirm("Reset database to initial sample state with 5 farmers, 3 buyers, 1 admin, and 17 products?")) return;
  try {
    const res = await fetch(`${API_BASE}/api/seed/reset`, { method: "POST" });
    if (!res.ok) throw new Error("Reset failed");
    showToast("Demo database successfully reset to clean seed state!", "success");
    await loadUsers();
    await loadProducts();
    await loadAdminData();
    await loadPriceTrends();
    cart = [];
    updateCartBadge();
    switchTab("marketplace");
  } catch (err) {
    showToast(err.message, "error");
  }
}

function changeLanguage(langCode) {
  currentLanguage = langCode;
  const dict = i18n[langCode] || i18n.en;

  if (document.getElementById("txtSafetyBanner")) document.getElementById("txtSafetyBanner").innerHTML = dict.safetyNotice;
  if (document.getElementById("btnResetDemo")) document.getElementById("btnResetDemo").innerText = dict.resetDemo;
  if (document.getElementById("lblNavMarketplace")) document.getElementById("lblNavMarketplace").innerText = dict.navMarketplace;
  if (document.getElementById("lblNavFarmer")) document.getElementById("lblNavFarmer").innerText = dict.navFarmer;
  if (document.getElementById("lblNavBuyer")) document.getElementById("lblNavBuyer").innerText = dict.navBuyer;
  if (document.getElementById("lblNavTrends")) document.getElementById("lblNavTrends").innerText = dict.navTrends;
  if (document.getElementById("lblNavAdmin")) document.getElementById("lblNavAdmin").innerText = dict.navAdmin;
  if (document.getElementById("heroSearchInput")) document.getElementById("heroSearchInput").placeholder = dict.searchPlaceholder;
  if (document.getElementById("lblFilterBtn")) document.getElementById("lblFilterBtn").innerText = dict.moreFilters;
  if (document.getElementById("lblAddProduce")) document.getElementById("lblAddProduce").innerText = dict.addProduce;

  renderProductCards(allProducts);
  showToast(`Interface language switched to ${langCode.toUpperCase()}`, "info");
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  let bgClass = "bg-slate-900 text-white";
  let icon = "ℹ️";

  if (type === "success") {
    bgClass = "bg-emerald-700 text-white shadow-emerald-900/30";
    icon = "✅";
  } else if (type === "error") {
    bgClass = "bg-rose-700 text-white shadow-rose-900/30";
    icon = "❌";
  }

  toast.className = `${bgClass} text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 transition-all duration-300 transform translate-y-2 opacity-0`;
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;

  container.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.remove("translate-y-2", "opacity-0");
  }, 10);

  // Remove after 3.5s
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
