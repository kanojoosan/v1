const SIZE_SURCHARGE = { 'S': 0, 'M': 0, 'L': 0, 'XL': 50, '2XL': 100 };
const ALL_SIZES = ['S', 'M', 'L', 'XL', '2XL'];

const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };

let allProducts = [
  { id: 1, name: "Uncrowned Signature Shirt", category: "shirts", price: 1200, sizes: ALL_SIZES, image: "https://image2url.com/r2/default/images/1772616627489-ca85cae5-e9e3-4104-9c86-eed7f1c1f95a.png" },
  { id: 2, name: "Premium Crewneck Shirt", category: "shirts", price: 2800, sizes: ALL_SIZES, image: "https://image2url.com/r2/default/images/1772616781321-dc5096d1-b4b1-47e9-9843-07573b357930.png" },
  { id: 3, name: "U cant See Me- Cena Tribute", category: "shirts", price: 4500, sizes: ALL_SIZES, image: "https://image2url.com/r2/default/images/1772616833059-bcd3948a-7c37-4d31-97c6-3feba9ee504b.png" },
  { id: 4, name: "Premium Crewneck Shirt", category: "shirts", price: 1500, sizes: ALL_SIZES, image: "https://image2url.com/r2/default/images/1772616910426-eff84a2f-325c-48fe-b520-2c73db79f33e.png" },
  { id: 5, name: "Crewneck Shirt - White", category: "shirts", price: 3200, sizes: ALL_SIZES, image: "https://image2url.com/r2/default/images/1772616926529-99357e25-a78d-4036-9c7d-004abb0914fc.png" },
  { id: 6, name: "Signature Denim Pants", category: "pants", price: 1500, sizes: ALL_SIZES, image: "https://image2url.com/r2/default/images/1772687296130-88262a7a-5fe6-4152-9207-8d2db21469f5.png" },
  { id: 7, name: "Baggy Jeans Pants", category: "pants", price: 2500, sizes: ALL_SIZES, image: "https://image2url.com/r2/default/images/1772687493366-18a16328-2aca-4f31-b434-68009c34dbda.png" },
  { id: 8, name: "Gothic Retro Spider - Baggy Jeans", category: "pants", price: 2100, sizes: ALL_SIZES, image: "https://image2url.com/r2/default/images/1772687632857-3958a437-db9d-4a98-8346-7c572adc2de5.png" },
  { id: 9, name: "2125 - Divine Sweats", category: "pants", price: 1300, sizes: ALL_SIZES, image: "https://image2url.com/r2/default/images/1772687674047-b56301ed-dbde-4bf3-acfc-2bc698bdfd56.png" },
  { id: 10, name: "Aonga Y2k Sweakpants", category: "jackets", price: 1300, sizes: ALL_SIZES, image: "https://image2url.com/r2/default/images/1772687697510-5beab4ad-3b58-4355-a2b3-26b2d3d3d383.png" },
  { id: 11, name: "Vielseitige Herbst-Windbreaker Jacket", category: "jackets", price: 1500, sizes: ALL_SIZES, image: "https://image2url.com/r2/default/images/1772687951776-b553f020-c392-44ed-bea1-944d2892746c.png" },
  { id: 12, name: "POOPMOOM Y2k Jacket", category: "jackets", price: 1000, sizes: ALL_SIZES, image: "https://image2url.com/r2/default/images/1772688023426-eb7e157e-eb84-4d55-8935-37d0190a9b7c.png" },
  { id: 13, name: "Japanese Zip Up Hoodie Patagonia", category: "jackets", price: 1600, sizes: ALL_SIZES, image: "https://image2url.com/r2/default/images/1772688071488-95b3b0fa-ccb6-4313-a409-bff8d0d85ea1.png" },
];

let registeredUsers = [];
let cart = [];
let currentUser = null;
let productToDelete = null;

let allOrders = [];

document.addEventListener('DOMContentLoaded', () => {
  renderProducts(allProducts);
  updateAuthUI();
});

function getSurcharge(size) {
  return SIZE_SURCHARGE[size] || 0;
}
function getFinalPrice(basePrice, size) {
  return basePrice + getSurcharge(size);
}

function renderProducts(products) {
  const grid = document.getElementById('product-grid');
  grid.innerHTML = '';
  if (products.length === 0) {
    grid.innerHTML = '<p style="color:#888;grid-column:1/-1;padding:40px 0;">No products found.</p>';
    return;
  }
  products.forEach(product => {
    const sizes = (product.sizes && product.sizes.length > 0) ? product.sizes : ALL_SIZES;
    const sizeButtons = sizes.map(s => {
      const surcharge = getSurcharge(s);
      const tag = surcharge > 0 ? `<span class="size-surcharge">+₱${surcharge}</span>` : '';
      return `<button class="size-btn" onclick="selectSize(this, ${product.id})" data-size="${s}" data-base="${product.price}">${s}${tag}</button>`;
    }).join('');

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="image-container">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
      </div>
      <div class="product-info">
        <span>${product.name}</span>
        <span id="price-display-${product.id}">₱${product.price.toLocaleString()}</span>
      </div>
      <div class="product-cat">${product.category.toUpperCase()}</div>
      <div class="size-selector">
        <div class="size-label">SIZE</div>
        <div class="size-options" id="sizes-${product.id}">${sizeButtons}</div>
        <div class="size-error" id="size-err-${product.id}" style="display:none;">⚠ Please select a size</div>
      </div>
      <button class="add-btn" onclick="addToCart(${product.id})">ADD TO BAG</button>
    `;
    grid.appendChild(card);
  });
}

function selectSize(btn, productId) {
  document.querySelectorAll(`#sizes-${productId} .size-btn`).forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');

  const basePrice = parseInt(btn.dataset.base);
  const surcharge = getSurcharge(btn.dataset.size);
  const finalPrice = basePrice + surcharge;
  const priceEl = document.getElementById(`price-display-${productId}`);
  if (priceEl) {
    priceEl.innerHTML = surcharge > 0
      ? `₱${finalPrice.toLocaleString()} <span class="price-surcharge-tag">incl. +₱${surcharge} for ${btn.dataset.size}</span>`
      : `₱${finalPrice.toLocaleString()}`;
  }
  const err = document.getElementById(`size-err-${productId}`);
  if (err) err.style.display = 'none';
}

function filterProducts(category) {
  if (category === 'all') renderProducts(allProducts);
  else renderProducts(allProducts.filter(p => p.category === category));
}

function toggleCart() {
  const cartModal = document.getElementById('cart-modal');
  const overlay = document.getElementById('overlay');
  const isActive = cartModal.classList.toggle('active');
  overlay.style.display = isActive ? 'block' : 'none';
}

function addToCart(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  const selectedBtn = document.querySelector(`#sizes-${id} .size-btn.selected`);
  if (!selectedBtn) {
    const err = document.getElementById(`size-err-${id}`);
    if (err) { err.style.display = 'block'; err.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    return;
  }
  const size = selectedBtn.dataset.size;
  const finalPrice = getFinalPrice(product.price, size);
  cart.push({ ...product, size, finalPrice });
  updateCartUI();
  document.getElementById('cart-modal').classList.add('active');
  document.getElementById('overlay').style.display = 'block';
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function updateCartUI() {
  document.getElementById('cart-count').innerText = cart.length;
  const container = document.getElementById('cart-items');
  container.innerHTML = '';
  let total = 0;
  cart.forEach((item, index) => {
    total += item.finalPrice;
    const surcharge = getSurcharge(item.size);
    const surchargeTag = surcharge > 0 ? ` <span style="color:#888;font-size:0.72rem;">(+₱${surcharge} for ${item.size})</span>` : '';
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div style="flex:1;">
        <h4>${item.name}</h4>
        <p style="font-size:0.8rem;color:#888;margin:2px 0;">Size: <strong>${item.size}</strong></p>
        <p style="font-weight:700;">₱${item.finalPrice.toLocaleString()}${surchargeTag}</p>
        <small onclick="removeFromCart(${index})" style="text-decoration:underline;cursor:pointer;color:#888;">Remove</small>
      </div>
    `;
    container.appendChild(div);
  });
  document.getElementById('cart-total').innerText = `₱${total.toLocaleString()}`;
}

function checkout() {
  if (cart.length === 0) return showToast('Your bag is empty.');
  if (!currentUser) {
    document.getElementById('cart-modal').classList.remove('active');
    document.getElementById('overlay').style.display = 'none';
    showToast('Please log in to checkout.');
    setTimeout(() => openModal('login-modal'), 400);
    return;
  }
  document.getElementById('cart-modal').classList.remove('active');
  openCheckout();
}

let selectedPayMethod = 'card';
let currentStep = 1;

function openCheckout() {
  goToStep(1, true);
  selectedPayMethod = 'card';
  selectPayMethod('card');
  openModal('checkout-modal');
}

function goToStep(step, silent) {
  if (!silent && step > currentStep) {
    if (currentStep === 1 && !validateAddress()) return;
    if (currentStep === 2 && !validatePayment()) return;
  }
  if (step === 3 && !silent) buildReviewPanel();
  document.querySelectorAll('.checkout-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('checkout-step-' + step).classList.add('active');
  currentStep = step;
  updateStepIndicator(step);
}

function updateStepIndicator(step) {
  for (let i = 1; i <= 3; i++) {
    const circle = document.getElementById('step-circle-' + i);
    const label = document.getElementById('step-label-' + i);
    circle.classList.remove('active', 'done');
    label.classList.remove('active', 'done');
    if (i < step) { circle.classList.add('done'); label.classList.add('done'); circle.innerText = '✓'; }
    else if (i === step) { circle.classList.add('active'); label.classList.add('active'); circle.innerText = i; }
    else { circle.innerText = i; }
  }
  const line1 = document.getElementById('step-line-1');
  const line2 = document.getElementById('step-line-2');
  if (line1) line1.classList.toggle('done', step > 1);
  if (line2) line2.classList.toggle('done', step > 2);
}

function validateAddress() {
  const fname = document.getElementById('addr-fname').value.trim();
  const lname = document.getElementById('addr-lname').value.trim();
  const phone = document.getElementById('addr-phone').value.trim();
  const street = document.getElementById('addr-street').value.trim();
  const city = document.getElementById('addr-city').value.trim();
  const province = document.getElementById('addr-province').value.trim();
  const zip = document.getElementById('addr-zip').value.trim();
  const region = document.getElementById('addr-region').value;
  const err = document.getElementById('address-error');
  if (!fname || !lname) return showCheckError(err, 'Please enter your full name.');
  if (!phone) return showCheckError(err, 'Please enter your phone number.');
  if (!street) return showCheckError(err, 'Please enter your street address.');
  if (!city) return showCheckError(err, 'Please enter your city.');
  if (!province) return showCheckError(err, 'Please enter your province.');
  if (!zip) return showCheckError(err, 'Please enter your ZIP code.');
  if (!region) return showCheckError(err, 'Please select your region.');
  err.style.display = 'none';
  return true;
}

function validatePayment() {
  const err = document.getElementById('payment-error');
  if (selectedPayMethod === 'card') {
    const num = document.getElementById('card-number').value.replace(/\s/g, '');
    const name = document.getElementById('card-name').value.trim();
    const expiry = document.getElementById('card-expiry').value.trim();
    const cvv = document.getElementById('card-cvv').value.trim();
    if (num.length < 16) return showCheckError(err, 'Please enter a valid 16-digit card number.');
    if (!name) return showCheckError(err, 'Please enter the cardholder name.');
    if (expiry.length < 5) return showCheckError(err, 'Please enter a valid expiry date (MM/YY).');
    if (cvv.length < 3) return showCheckError(err, 'Please enter a valid CVV.');
  } else if (selectedPayMethod === 'gcash') {
    const num = document.getElementById('gcash-number').value.trim();
    if (!num) return showCheckError(err, 'Please enter your GCash mobile number.');
  }
  err.style.display = 'none';
  return true;
}

function showCheckError(el, msg) { el.innerText = msg; el.style.display = 'block'; return false; }

function buildReviewPanel() {
  const subtotal = cart.reduce((s, i) => s + i.finalPrice, 0);
  const shipping = 150;
  const total = subtotal + shipping;
  const itemsEl = document.getElementById('review-items');
  itemsEl.innerHTML = '';
  cart.forEach(item => {
    const surcharge = getSurcharge(item.size);
    const d = document.createElement('div');
    d.className = 'summary-item';
    d.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="summary-item-info">
        <strong>${item.name}</strong>
        <small>${item.category.toUpperCase()} · Size: <strong>${item.size}</strong>${surcharge > 0 ? ` (+₱${surcharge})` : ''}</small>
      </div>
      <div class="summary-item-price">₱${item.finalPrice.toLocaleString()}</div>
    `;
    itemsEl.appendChild(d);
  });
  document.getElementById('review-subtotal').innerText = `₱${subtotal.toLocaleString()}`;
  document.getElementById('review-shipping').innerText = `₱${shipping.toLocaleString()}`;
  document.getElementById('review-total').innerText = `₱${total.toLocaleString()}`;

  const fname = document.getElementById('addr-fname').value.trim();
  const lname = document.getElementById('addr-lname').value.trim();
  const phone = document.getElementById('addr-phone').value.trim();
  const street = document.getElementById('addr-street').value.trim();
  const city = document.getElementById('addr-city').value.trim();
  const province = document.getElementById('addr-province').value.trim();
  const zip = document.getElementById('addr-zip').value.trim();
  const region = document.getElementById('addr-region').value;
  document.getElementById('review-address').innerHTML =
    `<strong>${fname} ${lname}</strong><br>${phone}<br>${street}<br>${city}, ${province} ${zip}<br>${region}`;

  let payHTML = '';
  if (selectedPayMethod === 'card') {
    const rawNum = document.getElementById('card-number').value.replace(/\s/g, '');
    const masked = '•••• •••• •••• ' + rawNum.slice(-4);
    const cname = document.getElementById('card-name').value.trim();
    const expiry = document.getElementById('card-expiry').value.trim();
    payHTML = `💳 <strong>Credit / Debit Card</strong><br>${masked}<br>${cname} · Exp: ${expiry}`;
  } else if (selectedPayMethod === 'gcash') {
    payHTML = `📱 <strong>GCash</strong><br>${document.getElementById('gcash-number').value.trim()}`;
  } else {
    payHTML = `💵 <strong>Cash on Delivery</strong><br>Pay when your order arrives.`;
  }
  document.getElementById('review-payment').innerHTML = payHTML;
}

function placeOrder() {
  const subtotal = cart.reduce((s, i) => s + i.finalPrice, 0);
  const shipping = 150;
  const total = subtotal + shipping;
  const orderNum = 'UL-' + Math.random().toString(36).substr(2, 6).toUpperCase();

  const fname = document.getElementById('addr-fname').value.trim();
  const lname = document.getElementById('addr-lname').value.trim();
  const phone = document.getElementById('addr-phone').value.trim();
  const street = document.getElementById('addr-street').value.trim();
  const city = document.getElementById('addr-city').value.trim();
  const province = document.getElementById('addr-province').value.trim();
  const zip = document.getElementById('addr-zip').value.trim();
  const region = document.getElementById('addr-region').value;


  const order = {
    orderNum,
    customer: currentUser.username,
    items: cart.map(i => ({ name: i.name, size: i.size, price: i.finalPrice, image: i.image })),
    subtotal, shipping, total,
    address: { name: `${fname} ${lname}`, phone, street, city, province, zip, region },
    payment: selectedPayMethod,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  allOrders.unshift(order);

  document.getElementById('success-order-num').innerText = 'ORDER #' + orderNum;
  document.querySelectorAll('.checkout-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('checkout-success').classList.add('active');
  cart = [];
  updateCartUI();
  updateStepIndicator(4);
}

function selectPayMethod(method) {
  selectedPayMethod = method;
  ['card', 'gcash', 'cod'].forEach(m => {
    document.getElementById('pm-' + m).classList.toggle('selected', m === method);
    document.getElementById('pay-panel-' + m).classList.toggle('active', m === method);
  });
}

function formatCardNumber(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 16);
  input.value = v.replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 4);
  if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
  input.value = v;
}
function updateCardPreview() {
  const num = document.getElementById('card-number').value || '•••• •••• •••• ••••';
  const name = document.getElementById('card-name').value.toUpperCase() || 'YOUR NAME';
  const exp = document.getElementById('card-expiry').value || 'MM/YY';
  document.getElementById('card-num-display').innerText = num;
  document.getElementById('card-name-display').innerText = name;
  document.getElementById('card-exp-display').innerText = exp;
}

function openModal(id) {
  document.getElementById(id).classList.add('active');
  document.getElementById('overlay').style.display = 'block';
}
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  const anyOpen = document.querySelector('.modal.active');
  const cartOpen = document.getElementById('cart-modal').classList.contains('active');
  if (!anyOpen && !cartOpen) document.getElementById('overlay').style.display = 'none';
}
function closeAllModals() {
  document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
  document.getElementById('cart-modal').classList.remove('active');
  document.getElementById('overlay').style.display = 'none';
}
function switchModal(fromId, toId) {
  document.getElementById(fromId).classList.remove('active');
  document.getElementById(toId).classList.add('active');
}
function showError(id, msg) {
  const el = document.getElementById(id);
  el.innerText = msg; el.style.display = 'block';
}
function hideError(id) { document.getElementById(id).style.display = 'none'; }
function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast'; toast.innerText = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3500);
}

function signup() {
  hideError('signup-error');
  const username = document.getElementById('signup-username').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const ageVal = document.getElementById('signup-age').value.trim();
  const password = document.getElementById('signup-password').value;
  const agreedTerms = document.getElementById('agree-terms').checked;
  const agreedPrivacy = document.getElementById('agree-privacy').checked;

  if (!username) return showError('signup-error', 'Username is required.');
  if (!email) return showError('signup-error', 'Email is required.');
  if (!ageVal) return showError('signup-error', 'Age is required.');
  const age = parseInt(ageVal);
  if (isNaN(age) || age < 1 || age > 120) return showError('signup-error', 'Please enter a valid age.');
  if (age < 18) return showError('signup-error', '⚠️ You must be 18 or older to register.');
  if (!password) return showError('signup-error', 'Password is required.');
  if (password.length < 6) return showError('signup-error', 'Password must be at least 6 characters.');
  if (!agreedTerms) return showError('signup-error', 'Please agree to the Terms & Conditions.');
  if (!agreedPrivacy) return showError('signup-error', 'Please agree to the Privacy Policy.');
  if (registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase()))
    return showError('signup-error', 'This email is already registered.');

  const newUser = { id: registeredUsers.length + 1, username, email, password, age, role: 'customer', createdAt: new Date() };
  registeredUsers.push(newUser);
  currentUser = { username: newUser.username, role: newUser.role };
  updateAuthUI();
  closeModal('signup-modal');
  ['signup-username', 'signup-email', 'signup-age', 'signup-password'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('agree-terms').checked = false;
  document.getElementById('agree-privacy').checked = false;
  showToast(`Welcome, ${newUser.username}! Account created.`);
}

function login() {
  hideError('login-error');
  const emailOrUser = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  if (!emailOrUser) return showError('login-error', 'Please enter your email or username.');
  if (!password) return showError('login-error', 'Please enter your password.');

  if ((emailOrUser === ADMIN_CREDENTIALS.username || emailOrUser === 'admin') && password === ADMIN_CREDENTIALS.password) {
    currentUser = { username: 'Admin', role: 'admin' };
    updateAuthUI(); closeModal('login-modal');
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    showToast('Welcome back, Admin!'); return;
  }
  const user = registeredUsers.find(u =>
    (u.email.toLowerCase() === emailOrUser.toLowerCase() || u.username.toLowerCase() === emailOrUser.toLowerCase())
    && u.password === password
  );
  if (!user) return showError('login-error', 'Invalid email/username or password.');
  currentUser = { username: user.username, role: user.role };
  updateAuthUI(); closeModal('login-modal');
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
  showToast(`Welcome back, ${user.username}!`);
}

function logout() {
  currentUser = null;
  updateAuthUI();
  showToast('Logged out successfully.');
}

function updateAuthUI() {
  if (currentUser) {
    document.getElementById('auth-area').style.display = 'none';
    document.getElementById('user-area').style.display = 'flex';
    document.getElementById('user-greeting').innerText = `HI, ${currentUser.username.toUpperCase()}`;
    document.getElementById('admin-btn').style.display = currentUser.role === 'admin' ? 'inline-block' : 'none';
  } else {
    document.getElementById('auth-area').style.display = 'flex';
    document.getElementById('user-area').style.display = 'none';
  }
}

function openAdminPanel() {
  openModal('admin-modal');
  switchAdminTab('products');
}

function switchAdminTab(tab) {
  document.querySelectorAll('.admin-tab').forEach((t, i) => {
    t.classList.toggle('active',
      (tab === 'products' && i === 0) ||
      (tab === 'users' && i === 1) ||
      (tab === 'orders' && i === 2)
    );
  });
  document.getElementById('admin-products').style.display = tab === 'products' ? 'block' : 'none';
  document.getElementById('admin-users').style.display = tab === 'users' ? 'block' : 'none';
  document.getElementById('admin-orders').style.display = tab === 'orders' ? 'block' : 'none';
  if (tab === 'products') loadAdminProducts();
  else if (tab === 'users') loadAdminUsers();
  else if (tab === 'orders') loadAdminOrders();
}

function loadAdminProducts() {
  const list = document.getElementById('admin-product-list');
  list.innerHTML = '';
  const countEl = document.getElementById('product-count');
  if (countEl) countEl.innerText = allProducts.length;
  if (allProducts.length === 0) {
    list.innerHTML = '<p style="color:#888;padding:20px 0;">No products. Click "+ ADD PRODUCT".</p>';
    return;
  }
  allProducts.forEach(p => {
    const row = document.createElement('div');
    row.className = 'admin-row';
    row.innerHTML = `
      <img src="${p.image}" alt="${p.name}" style="width:50px;height:60px;object-fit:cover;flex-shrink:0;">
      <div style="flex:1;min-width:0;">
        <strong style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</strong>
        <small style="color:#888;">${p.category.toUpperCase()} — ₱${p.price.toLocaleString()}</small>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0;">
        <button class="edit-btn"   onclick="openAddProduct(${p.id})">EDIT</button>
        <button class="delete-btn" onclick="promptDelete(${p.id},'${p.name.replace(/'/g, "\\'")}')">DELETE</button>
      </div>
    `;
    list.appendChild(row);
  });
}

function loadAdminUsers() {
  const list = document.getElementById('admin-user-list');
  list.innerHTML = '';
  if (registeredUsers.length === 0) {
    list.innerHTML = '<p style="color:#888;padding:20px 0;">No registered customers yet.</p>';
    return;
  }
  registeredUsers.forEach(u => {
    const row = document.createElement('div');
    row.className = 'admin-row';
    row.innerHTML = `
      <div style="flex:1;">
        <strong>${u.username}</strong>
        <small style="display:block;color:#888;">${u.email} · Age: ${u.age}</small>
        <small style="display:block;color:#aaa;">Joined: ${new Date(u.createdAt).toLocaleDateString()}</small>
      </div>
    `;
    list.appendChild(row);
  });
}

function loadAdminOrders() {
  const list = document.getElementById('admin-order-list');
  const countEl = document.getElementById('order-count');
  list.innerHTML = '';
  if (countEl) countEl.innerText = allOrders.length;
  if (allOrders.length === 0) {
    list.innerHTML = '<p style="color:#888;padding:20px 0;">No orders yet.</p>';
    return;
  }
  allOrders.forEach((order, idx) => {
    const statusColors = { pending: '#e67e22', out_for_delivery: '#2980b9', completed: '#27ae60', cancelled: '#c0392b' };
    const statusLabels = { pending: '⏳ Pending', out_for_delivery: '🚚 Out for Delivery', completed: '✅ Completed', cancelled: '❌ Cancelled' };
    const color = statusColors[order.status] || '#888';
    const label = statusLabels[order.status] || order.status;
    const date = new Date(order.createdAt).toLocaleString();
    const itemsSummary = order.items.map(i => `${i.name} (${i.size})`).join(', ');

    const row = document.createElement('div');
    row.className = 'admin-order-row';
    row.innerHTML = `
      <div class="order-row-top">
        <div>
          <strong class="order-num">#${order.orderNum}</strong>
          <span class="order-customer">by ${order.customer}</span>
          <span class="order-date">${date}</span>
        </div>
        <span class="order-status-badge" style="background:${color};">${label}</span>
      </div>
      <div class="order-row-items">${itemsSummary}</div>
      <div class="order-row-address">📍 ${order.address.street}, ${order.address.city}, ${order.address.province} ${order.address.zip} · ${order.address.phone}</div>
      <div class="order-row-bottom">
        <span class="order-total">Total: <strong>₱${order.total.toLocaleString()}</strong> · ${order.payment.toUpperCase()}</span>
        <div class="order-actions">
          ${order.status === 'pending' ? `<button class="order-btn deliver" onclick="updateOrderStatus(${idx},'out_for_delivery')">🚚 Mark Out for Delivery</button>` : ''}
          ${order.status === 'out_for_delivery' ? `<button class="order-btn complete" onclick="updateOrderStatus(${idx},'completed')">✅ Mark Completed</button>` : ''}
          ${order.status === 'completed' ? `<span style="color:#27ae60;font-weight:700;font-size:0.8rem;">✅ Delivered</span>` : ''}
          ${order.status !== 'completed' && order.status !== 'cancelled' ? `<button class="order-btn cancel" onclick="updateOrderStatus(${idx},'cancelled')">Cancel</button>` : ''}
        </div>
      </div>
    `;
    list.appendChild(row);
  });
}

function updateOrderStatus(idx, newStatus) {
  allOrders[idx].status = newStatus;
  loadAdminOrders();
  const labels = { out_for_delivery: 'Out for Delivery', completed: 'Completed', cancelled: 'Cancelled' };
  showToast(`Order #${allOrders[idx].orderNum} → ${labels[newStatus]}`);
}

function promptDelete(id, name) {
  productToDelete = id;
  document.getElementById('delete-product-name').innerText = name;
  openModal('delete-modal');
}
function confirmDelete() {
  if (productToDelete === null) return;
  allProducts = allProducts.filter(p => p.id !== productToDelete);
  productToDelete = null;
  closeModal('delete-modal');
  renderProducts(allProducts);
  loadAdminProducts();
  showToast('Product deleted successfully.');
}

let editingProductId = null;
function openAddProduct(id) {
  editingProductId = id || null;
  hideError('add-product-error');
  document.querySelectorAll('.size-checkbox').forEach(cb => cb.checked = false);
  if (id) {
    const p = allProducts.find(p => p.id === id);
    document.getElementById('add-product-title').innerText = 'EDIT PRODUCT';
    document.getElementById('new-product-image').value = p.image;
    document.getElementById('new-product-name').value = p.name;
    document.getElementById('new-product-category').value = p.category;
    document.getElementById('new-product-price').value = p.price;
    const sizes = p.sizes && p.sizes.length > 0 ? p.sizes : ALL_SIZES;
    sizes.forEach(s => {
      const cb = document.querySelector(`.size-checkbox[data-size="${s}"]`);
      if (cb) cb.checked = true;
    });
    previewImage();
  } else {
    document.getElementById('add-product-title').innerText = 'ADD PRODUCT';
    document.getElementById('new-product-image').value = '';
    document.getElementById('new-product-name').value = '';
    document.getElementById('new-product-category').value = '';
    document.getElementById('new-product-price').value = '';
    document.getElementById('img-preview-img').style.display = 'none';
    document.getElementById('img-placeholder').style.display = 'block';
    document.getElementById('img-placeholder').innerText = 'IMAGE PREVIEW';
    document.querySelectorAll('.size-checkbox').forEach(cb => cb.checked = true);
  }
  openModal('add-product-modal');
}

function previewImage() {
  const url = document.getElementById('new-product-image').value.trim();
  const img = document.getElementById('img-preview-img');
  const ph = document.getElementById('img-placeholder');
  if (url) {
    img.src = url;
    img.onload = () => { img.style.display = 'block'; ph.style.display = 'none'; };
    img.onerror = () => { img.style.display = 'none'; ph.style.display = 'block'; ph.innerText = '⚠ Invalid image URL'; };
  } else {
    img.style.display = 'none'; ph.style.display = 'block'; ph.innerText = 'IMAGE PREVIEW';
  }
}

function saveProduct() {
  const image = document.getElementById('new-product-image').value.trim();
  const name = document.getElementById('new-product-name').value.trim();
  const category = document.getElementById('new-product-category').value;
  const priceVal = document.getElementById('new-product-price').value;
  const sizes = [...document.querySelectorAll('.size-checkbox:checked')].map(cb => cb.dataset.size);

  if (!image) return showError('add-product-error', 'Please enter an image URL.');
  if (!name) return showError('add-product-error', 'Please enter a product name.');
  if (!category) return showError('add-product-error', 'Please select a category.');
  if (!priceVal || parseInt(priceVal) < 1) return showError('add-product-error', 'Please enter a valid price.');
  if (sizes.length === 0) return showError('add-product-error', 'Please select at least one available size.');
  document.getElementById('add-product-error').style.display = 'none';

  const price = parseInt(priceVal);
  if (editingProductId !== null) {
    const idx = allProducts.findIndex(p => p.id === editingProductId);
    if (idx > -1) allProducts[idx] = { ...allProducts[idx], image, name, category, price, sizes };
    showToast(`"${name}" updated successfully.`);
  } else {
    const newId = allProducts.length > 0 ? Math.max(...allProducts.map(p => p.id)) + 1 : 1;
    allProducts.push({ id: newId, name, category, price, image, sizes });
    showToast(`"${name}" added to the store!`);
  }
  closeModal('add-product-modal');
  renderProducts(allProducts);
  loadAdminProducts();
}

function getCustomerTab(order) {
  if (order.status === 'cancelled') return null;
  if (order.status === 'pending') {

    return order.payment === 'cod' ? 'to_ship' : 'to_pay';
  }
  if (order.status === 'out_for_delivery') return 'to_receive';
  if (order.status === 'completed') return order.rated ? null : 'to_rate';
  return null;
}

let currentMyOrdersTab = 'to_pay';
let ratingTargetOrderNum = null;
let currentRating = 0;

function openMyOrders() {
  refreshMyOrdersBadges();
  switchMyOrdersTab('to_pay');
  openModal('my-orders-modal');
}

function refreshMyOrdersBadges() {
  const tabs = ['to_pay', 'to_ship', 'to_receive', 'to_rate'];
  const counts = { to_pay: 0, to_ship: 0, to_receive: 0, to_rate: 0 };
  const myOrders = allOrders.filter(o => o.customer === currentUser?.username);
  myOrders.forEach(o => {
    const tab = getCustomerTab(o);
    if (tab) counts[tab]++;
  });
  tabs.forEach(tab => {
    const el = document.getElementById('badge-' + tab);
    if (!el) return;
    el.innerText = counts[tab];
    el.classList.toggle('visible', counts[tab] > 0);
  });
}

function switchMyOrdersTab(tab) {
  currentMyOrdersTab = tab;
  document.querySelectorAll('.my-orders-tab').forEach((t, i) => {
    const tabs = ['to_pay', 'to_ship', 'to_receive', 'to_rate'];
    t.classList.toggle('active', tabs[i] === tab);
  });
  renderMyOrders(tab);
}

function renderMyOrders(tab) {
  const list = document.getElementById('my-orders-list');
  list.innerHTML = '';
  const myOrders = allOrders.filter(o => o.customer === currentUser?.username && getCustomerTab(o) === tab);

  if (myOrders.length === 0) {
    const emptyIcons = { to_pay: '💳', to_ship: '📦', to_receive: '🚚', to_rate: '⭐' };
    const emptyMsgs = {
      to_pay: 'No orders waiting for payment.',
      to_ship: 'No orders being prepared.',
      to_receive: 'No orders out for delivery.',
      to_rate: 'No completed orders to rate yet.'
    };
    list.innerHTML = `
      <div class="my-order-empty">
        <div class="empty-icon">${emptyIcons[tab]}</div>
        <p>${emptyMsgs[tab]}</p>
      </div>`;
    return;
  }

  myOrders.forEach(order => {
    const statusColors = {
      pending: '#e67e22',
      out_for_delivery: '#2980b9',
      completed: '#27ae60',
    };
    const statusLabels = {
      pending: order.payment === 'cod' ? '📦 Preparing' : '💳 Awaiting Payment',
      out_for_delivery: '🚚 Out for Delivery',
      completed: '✅ Delivered',
    };
    const color = statusColors[order.status] || '#888';
    const label = statusLabels[order.status] || order.status;
    const date = new Date(order.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });

    const itemsHTML = order.items.map(item => `
      <div class="my-order-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="my-order-item-info">
          <strong>${item.name}</strong>
          <small>Size: ${item.size}</small>
        </div>
        <div class="my-order-item-price">₱${item.price.toLocaleString()}</div>
      </div>
    `).join('');


    let actionBtn = '';
    if (tab === 'to_pay') {
      actionBtn = `<button class="my-order-action-btn primary" onclick="showToast('Redirecting to payment...')">PAY NOW</button>`;
    } else if (tab === 'to_ship') {
      actionBtn = `<button class="my-order-action-btn outline" onclick="showToast('Your order is being prepared for shipment.')">TRACK</button>`;
    } else if (tab === 'to_receive') {
      actionBtn = `<button class="my-order-action-btn primary" onclick="confirmReceived('${order.orderNum}')">ORDER RECEIVED</button>`;
    } else if (tab === 'to_rate') {
      actionBtn = `<button class="my-order-action-btn primary" onclick="openRateModal('${order.orderNum}')">RATE NOW</button>`;
    }

    const ratedHTML = order.rated
      ? `<div class="rated-stars">${'★'.repeat(order.rating)}${'☆'.repeat(5 - order.rating)}</div>${order.ratingComment ? `<div class="rated-comment">"${order.ratingComment}"</div>` : ''}`
      : '';

    const card = document.createElement('div');
    card.className = 'my-order-card';
    card.innerHTML = `
      <div class="my-order-card-top">
        <div>
          <span class="my-order-num">#${order.orderNum}</span>
          <span style="color:#aaa;font-size:0.75rem;margin-left:8px;">${date}</span>
        </div>
        <span class="my-order-status" style="background:${color};color:#fff;">${label}</span>
      </div>
      <div class="my-order-items-list">${itemsHTML}</div>
      ${ratedHTML}
      <div class="my-order-footer">
        <div class="my-order-total">Total: <strong>₱${order.total.toLocaleString()}</strong></div>
        ${actionBtn}
      </div>
    `;
    list.appendChild(card);
  });
}

function confirmReceived(orderNum) {
  const order = allOrders.find(o => o.orderNum === orderNum);
  if (!order) return;
  order.status = 'completed';
  refreshMyOrdersBadges();
  renderMyOrders('to_receive');
  showToast('Order marked as received! Please rate your purchase.');

  setTimeout(() => switchMyOrdersTab('to_rate'), 800);
}

function openRateModal(orderNum) {
  ratingTargetOrderNum = orderNum;
  currentRating = 0;
  setRating(0);
  document.getElementById('rate-comment').value = '';
  document.getElementById('rate-order-label').innerText = 'Order #' + orderNum;
  openModal('rate-modal');
}

function setRating(rating) {
  currentRating = rating;
  const stars = document.querySelectorAll('.star');
  stars.forEach((s, i) => s.classList.toggle('active', i < rating));
  const labels = ['', 'Poor 😞', 'Fair 😐', 'Good 😊', 'Great 😄', 'Excellent! 🤩'];
  document.getElementById('rate-label-text').innerText = labels[rating] || '';
}

function submitRating() {
  if (currentRating === 0) return showToast('Please select a star rating.');
  const order = allOrders.find(o => o.orderNum === ratingTargetOrderNum);
  if (!order) return;
  order.rated = true;
  order.rating = currentRating;
  order.ratingComment = document.getElementById('rate-comment').value.trim();
  closeModal('rate-modal');
  refreshMyOrdersBadges();
  switchMyOrdersTab('to_rate');
  showToast('Thank you for your rating! ⭐'.repeat(Math.min(currentRating, 3)));
}