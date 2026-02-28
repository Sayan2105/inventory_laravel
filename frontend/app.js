const API = "http://127.0.0.1:8000/api";

function getToken() { return localStorage.getItem('token'); }
function setToken(t) { localStorage.setItem('token', t); }
function removeToken() { localStorage.removeItem('token'); }

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": "Bearer " + getToken()
  };
}

// Auth guard
if (window.location.pathname.includes('dashboard') && !getToken()) {
  window.location = 'index.html';
}
if (window.location.pathname.includes('index') && getToken()) {
  window.location = 'dashboard.html';
}

// ── LOGIN ──────────────────────────────────────────────
async function login() {
  const btn = document.getElementById('loginBtn');
  const msg = document.getElementById('msg');
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  btn.disabled = true;
  btn.textContent = 'Authenticating...';
  msg.textContent = '';

  try {
    let r = await fetch(API + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ email, password })
    });
    let d = await r.json();
    if (d.token) {
      setToken(d.token);
      if (d.user) localStorage.setItem('user', JSON.stringify(d.user));
      window.location = "dashboard.html";
    } else {
      msg.textContent = d.message || "Invalid credentials";
      btn.disabled = false;
      btn.textContent = 'Login';
    }
  } catch (e) {
    msg.textContent = "Connection error";
    btn.disabled = false;
    btn.textContent = 'Login';
  }
}

function logout() {
  removeToken();
  localStorage.removeItem('user');
  window.location = "index.html";
}

// ── NAV ACTIVE STATE ───────────────────────────────────
function setActive(id) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

// ── TOAST ──────────────────────────────────────────────
function toast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── PRODUCTS ───────────────────────────────────────────
async function loadProducts() {
  setActive('nav-products');
  const content = document.getElementById('content');
  content.innerHTML = `<div class="loading">Loading...</div>`;

  const [prodRes, catRes] = await Promise.all([
    fetch(API + "/products", { headers: authHeaders() }),
    fetch(API + "/categories", { headers: authHeaders() })
  ]);
  const products = await prodRes.json();
  const categories = await catRes.json();

  const catMap = {};
  categories.forEach(c => catMap[c.id] = c.name);

  const catOptions = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

  content.innerHTML = `
    <div class="page-header">
      <div>
        <h2 class="page-title">Products</h2>
        <p class="page-sub">${products.length} items in inventory</p>
      </div>
      <button onclick="showAddProduct()" class="btn btn-primary">+ Add Product</button>
    </div>

    <div id="product-form" class="card form-card hidden">
      <h3 class="form-title">New Product</h3>
      <div class="form-grid">
        <div class="form-group">
          <label>Name</label>
          <input id="pName" placeholder="Product name" class="input">
        </div>
        <div class="form-group">
          <label>SKU</label>
          <input id="pSku" placeholder="SKU-001" class="input">
        </div>
        <div class="form-group">
          <label>Category</label>
          <select id="pCat" class="input">${catOptions}</select>
        </div>
        <div class="form-group">
          <label>Price (₹)</label>
          <input id="pPrice" type="number" placeholder="0.00" class="input">
        </div>
        <div class="form-group">
          <label>Initial Stock</label>
          <input id="pQty" type="number" placeholder="0" class="input">
        </div>
      </div>
      <div class="form-actions">
        <button onclick="addProduct()" class="btn btn-primary">Save Product</button>
        <button onclick="hideForm('product-form')" class="btn btn-ghost">Cancel</button>
      </div>
    </div>

    <div class="card table-card">
      <table class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(p => `
            <tr>
              <td class="id-cell">${p.id}</td>
              <td class="name-cell">${p.name}</td>
              <td><span class="badge">${p.sku}</span></td>
              <td>${catMap[p.category_id] || '—'}</td>
              <td><span class="stock-badge ${p.quantity < 10 ? 'low' : ''}">${p.quantity}</span></td>
              <td class="price-cell">₹${parseFloat(p.price).toLocaleString('en-IN')}</td>
              <td>
                <button onclick="showMove(${p.id}, '${p.name}')" class="btn-sm btn-blue">Move Stock</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function showAddProduct() {
  document.getElementById('product-form').classList.remove('hidden');
  document.getElementById('product-form').scrollIntoView({ behavior: 'smooth' });
}

function hideForm(id) {
  document.getElementById(id).classList.add('hidden');
}

async function addProduct() {
  const body = {
    name: document.getElementById('pName').value,
    sku: document.getElementById('pSku').value,
    category_id: document.getElementById('pCat').value,
    price: document.getElementById('pPrice').value,
    quantity: document.getElementById('pQty').value,
  };
  const r = await fetch(API + "/products", {
    method: "POST", headers: authHeaders(), body: JSON.stringify(body)
  });
  const d = await r.json();
  if (r.ok) { toast('Product added!'); loadProducts(); }
  else toast(d.message || 'Error adding product', 'error');
}

// ── STOCK MOVE ─────────────────────────────────────────
function showMove(id, name) {
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="page-header">
      <div>
        <h2 class="page-title">Stock Movement</h2>
        <p class="page-sub">Adjusting: <strong>${name}</strong></p>
      </div>
      <button onclick="loadProducts()" class="btn btn-ghost">← Back</button>
    </div>
    <div class="card" style="max-width:480px">
      <div class="form-group">
        <label>Type</label>
        <div class="toggle-group">
          <button id="btn-in" onclick="setType('in')" class="toggle-btn active">Stock IN</button>
          <button id="btn-out" onclick="setType('out')" class="toggle-btn">Stock OUT</button>
        </div>
      </div>
      <input type="hidden" id="moveType" value="in">
      <div class="form-group">
        <label>Quantity</label>
        <input id="moveQty" type="number" min="1" placeholder="Enter quantity" class="input">
      </div>
      <div class="form-group">
        <label>Note <span style="opacity:0.5">(optional)</span></label>
        <input id="moveNote" placeholder="Reason / reference..." class="input">
      </div>
      <div class="form-actions">
        <button onclick="moveStock(${id})" class="btn btn-primary">Confirm Move</button>
      </div>
      <p id="moveRes" class="move-result"></p>
    </div>
  `;
}

function setType(t) {
  document.getElementById('moveType').value = t;
  document.getElementById('btn-in').classList.toggle('active', t === 'in');
  document.getElementById('btn-out').classList.toggle('active', t === 'out');
}

async function moveStock(id) {
  const r = await fetch(API + "/stock/move", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      product_id: id,
      quantity: parseInt(document.getElementById('moveQty').value),
      type: document.getElementById('moveType').value,
      note: document.getElementById('moveNote').value
    })
  });
  const d = await r.json();
  const el = document.getElementById('moveRes');
  if (d.message) {
    el.textContent = `✓ ${d.message} — Current stock: ${d.current_stock}`;
    el.className = 'move-result success';
    toast(d.message);
  } else {
    el.textContent = d.error || 'Error';
    el.className = 'move-result error';
    toast(d.error || 'Error', 'error');
  }
}

// ── CATEGORIES ─────────────────────────────────────────
async function loadCategories() {
  setActive('nav-categories');
  const content = document.getElementById('content');
  content.innerHTML = `<div class="loading">Loading...</div>`;
  const r = await fetch(API + "/categories", { headers: authHeaders() });
  const cats = await r.json();

  content.innerHTML = `
    <div class="page-header">
      <div>
        <h2 class="page-title">Categories</h2>
        <p class="page-sub">${cats.length} categories</p>
      </div>
      <button onclick="showAddCategory()" class="btn btn-primary">+ Add Category</button>
    </div>

    <div id="cat-form" class="card form-card hidden">
      <h3 class="form-title">New Category</h3>
      <div class="form-grid">
        <div class="form-group">
          <label>Name</label>
          <input id="catName" placeholder="Category name" class="input">
        </div>
        <div class="form-group">
          <label>Description</label>
          <input id="catDesc" placeholder="Optional description" class="input">
        </div>
      </div>
      <div class="form-actions">
        <button onclick="addCategory()" class="btn btn-primary">Save</button>
        <button onclick="hideForm('cat-form')" class="btn btn-ghost">Cancel</button>
      </div>
    </div>

    <div class="cat-grid">
      ${cats.map(c => `
        <div class="cat-card">
          <div class="cat-icon">◈</div>
          <div class="cat-name">${c.name}</div>
          <div class="cat-count">${c.products_count} products</div>
          <div class="cat-desc">${c.description || 'No description'}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function showAddCategory() {
  document.getElementById('cat-form').classList.remove('hidden');
}

async function addCategory() {
  const r = await fetch(API + "/categories", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      name: document.getElementById('catName').value,
      description: document.getElementById('catDesc').value
    })
  });
  const d = await r.json();
  if (r.ok) { toast('Category added!'); loadCategories(); }
  else toast(d.message || 'Error', 'error');
}

// ── MOVEMENTS ──────────────────────────────────────────
async function loadMovements() {
  setActive('nav-movements');
  const content = document.getElementById('content');
  content.innerHTML = `<div class="loading">Loading...</div>`;

  const [movRes, prodRes] = await Promise.all([
    fetch(API + "/movements", { headers: authHeaders() }),
    fetch(API + "/products", { headers: authHeaders() })
  ]);
  const data = await movRes.json();
  const products = await prodRes.json();

  const productOptions = products.map(p =>
    `<option value="${p.id}">${p.name} (Stock: ${p.quantity})</option>`
  ).join('');

  content.innerHTML = `
    <div class="page-header">
      <div>
        <h2 class="page-title">Stock Movements</h2>
        <p class="page-sub">${data.length} records</p>
      </div>
      <button onclick="toggleMovePanel()" class="btn btn-primary" id="move-toggle-btn">
        + New Movement
      </button>
    </div>

    <!-- Inline Move Panel -->
    <div id="move-panel" class="card form-card hidden">
      <h3 class="form-title">New Stock Movement</h3>
      <div class="form-grid">
        <div class="form-group">
          <label>Product</label>
          <select id="movePid" class="input">${productOptions}</select>
        </div>
        <div class="form-group">
          <label>Quantity</label>
          <input id="moveQty" type="number" min="1" placeholder="Enter quantity" class="input">
        </div>
        <div class="form-group">
          <label>Note <span style="opacity:0.5">(optional)</span></label>
          <input id="moveNote" placeholder="Reason / reference..." class="input">
        </div>
      </div>
      <div class="form-group">
        <label>Type</label>
        <div class="toggle-group" style="max-width:240px">
          <button id="btn-in" onclick="setMoveType('in')" class="toggle-btn active">Stock IN</button>
          <button id="btn-out" onclick="setMoveType('out')" class="toggle-btn">Stock OUT</button>
        </div>
      </div>
      <input type="hidden" id="moveType" value="in">
      <div class="form-actions" style="margin-top:1rem">
        <button onclick="submitMove()" class="btn btn-primary">Confirm</button>
        <button onclick="toggleMovePanel()" class="btn btn-ghost">Cancel</button>
      </div>
      <p id="moveRes" class="move-result"></p>
    </div>

    <!-- Movements Table -->
    <div class="card table-card">
      <table class="table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Type</th>
            <th>Qty</th>
            <th>By</th>
            <th>Note</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody id="movements-tbody">
          ${data.map(m => movementRow(m)).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function movementRow(m) {
  return `
    <tr>
      <td class="name-cell">${m.product?.name || '—'}</td>
      <td><span class="type-badge ${m.type}">${m.type.toUpperCase()}</span></td>
      <td style="font-family:var(--mono)">${m.quantity}</td>
      <td>${m.user?.name || '—'}</td>
      <td style="opacity:0.5;font-size:0.8rem">${m.note || '—'}</td>
      <td style="opacity:0.4;font-size:0.78rem">${new Date(m.created_at).toLocaleString('en-IN')}</td>
    </tr>
  `;
}

function toggleMovePanel() {
  const panel = document.getElementById('move-panel');
  panel.classList.toggle('hidden');
  const btn = document.getElementById('move-toggle-btn');
  btn.textContent = panel.classList.contains('hidden') ? '+ New Movement' : '✕ Cancel';
}

function setMoveType(t) {
  document.getElementById('moveType').value = t;
  document.getElementById('btn-in').classList.toggle('active', t === 'in');
  document.getElementById('btn-out').classList.toggle('active', t === 'out');
}

async function submitMove() {
  const pid = document.getElementById('movePid').value;
  const qty = parseInt(document.getElementById('moveQty').value);
  const type = document.getElementById('moveType').value;
  const note = document.getElementById('moveNote').value;
  const res = document.getElementById('moveRes');

  if (!qty || qty < 1) {
    res.textContent = 'Enter a valid quantity';
    res.className = 'move-result error';
    return;
  }

  const r = await fetch(API + "/stock/move", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ product_id: pid, quantity: qty, type, note })
  });

  const d = await r.json();

  if (d.message) {
    res.textContent = `✓ ${d.message} — Current stock: ${d.current_stock}`;
    res.className = 'move-result success';
    toast(d.message);

    // Reload movements list without full page reload
    const movRes = await fetch(API + "/movements", { headers: authHeaders() });
    const newData = await movRes.json();
    document.getElementById('movements-tbody').innerHTML = newData.map(m => movementRow(m)).join('');

    // Reset form
    document.getElementById('moveQty').value = '';
    document.getElementById('moveNote').value = '';
  } else {
    res.textContent = d.error || 'Something went wrong';
    res.className = 'move-result error';
    toast(d.error || 'Error', 'error');
  }
}

// ── DASHBOARD HOME ─────────────────────────────────────
async function loadDashboard() {
  setActive('nav-dashboard');
  const content = document.getElementById('content');
  content.innerHTML = `<div class="loading">Loading...</div>`;

  const [prodRes, movRes] = await Promise.all([
    fetch(API + "/products", { headers: authHeaders() }),
    fetch(API + "/movements", { headers: authHeaders() })
  ]);
  const products = await prodRes.json();
  const movements = await movRes.json();

  const totalStock = products.reduce((s, p) => s + p.quantity, 0);
  const totalValue = products.reduce((s, p) => s + (p.quantity * p.price), 0);
  const lowStock = products.filter(p => p.quantity < 10);
  const recent = movements.slice(0, 5);

  content.innerHTML = `
    <div class="page-header">
      <div>
        <h2 class="page-title">Dashboard</h2>
        <p class="page-sub">Overview of your warehouse</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Products</div>
        <div class="stat-value">${products.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Stock Units</div>
        <div class="stat-value">${totalStock.toLocaleString()}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Inventory Value</div>
        <div class="stat-value">₹${totalValue.toLocaleString('en-IN')}</div>
      </div>
      <div class="stat-card ${lowStock.length > 0 ? 'alert' : ''}">
        <div class="stat-label">Low Stock Alerts</div>
        <div class="stat-value">${lowStock.length}</div>
      </div>
    </div>

    ${lowStock.length > 0 ? `
    <div class="card alert-card">
      <h3 class="section-title">⚠ Low Stock Items</h3>
      <div class="alert-list">
        ${lowStock.map(p => `
          <div class="alert-item">
            <span>${p.name}</span>
            <span class="stock-badge low">${p.quantity} left</span>
          </div>
        `).join('')}
      </div>
    </div>` : ''}

    <div class="card">
      <h3 class="section-title">Recent Movements</h3>
      <table class="table">
        <thead><tr><th>Product</th><th>Type</th><th>Qty</th><th>By</th></tr></thead>
        <tbody>
          ${recent.map(m => `
            <tr>
              <td>${m.product?.name || '—'}</td>
              <td><span class="type-badge ${m.type}">${m.type.toUpperCase()}</span></td>
              <td>${m.quantity}</td>
              <td>${m.user?.name || '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}