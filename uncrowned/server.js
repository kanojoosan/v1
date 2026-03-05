const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());

app.use(express.static(__dirname));

let products = [
  { id: 1, name: "Heavyweight Box Tee", category: "shirts", price: 1200, sizes: ["S", "M", "L", "XL", "2XL"], image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=80" },
  { id: 2, name: "Tactical Cargo Pants", category: "pants", price: 2800, sizes: ["S", "M", "L", "XL", "2XL"], image: "https://images.unsplash.com/photo-1517445312582-5e48d29b23b3?auto=format&fit=crop&w=600&q=80" },
  { id: 3, name: "Varsity Bomber Jacket", category: "jackets", price: 4500, sizes: ["S", "M", "L", "XL"], image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80" },
  { id: 4, name: "Nylon Utility Shorts", category: "shorts", price: 1500, sizes: ["S", "M", "L", "XL", "2XL"], image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80" },
  { id: 5, name: "Oversized Hoodie", category: "jackets", price: 3200, sizes: ["M", "L", "XL", "2XL"], image: "https://images.unsplash.com/photo-1556906781-9a412961d289?auto=format&fit=crop&w=600&q=80" },
  { id: 6, name: "Graphic Street Tee", category: "shirts", price: 1100, sizes: ["S", "M", "L", "XL", "2XL"], image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=600&q=80" }
];

const ADMIN = { username: 'admin', password: 'admin123' };
let users = [];
let sessions = {};
let orders = [];

function genToken() {
  return Math.random().toString(36).substr(2) + Date.now().toString(36);
}

function requireAuth(req, res, next) {
  const token = req.headers['authorization'];
  if (!sessions[token]) return res.status(401).json({ error: 'Please log in.' });
  req.session = sessions[token];
  next();
}

function requireAdmin(req, res, next) {
  const token = req.headers['authorization'];
  if (!sessions[token] || sessions[token].role !== 'admin')
    return res.status(403).json({ error: 'Admin access required.' });
  req.session = sessions[token];
  next();
}

app.get('/api/products', (req, res) => res.json(products));

app.post('/api/products', requireAdmin, (req, res) => {
  const { name, category, price, image, sizes } = req.body;
  if (!name || !category || !price || !image)
    return res.status(400).json({ error: 'All fields are required.' });
  const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
  const product = { id: newId, name, category, price: parseInt(price), sizes: sizes || [], image };
  products.push(product);
  console.log('[ADMIN] Added product:', name);
  res.json({ status: 'success', product });
});

app.put('/api/products/:id', requireAdmin, (req, res) => {
  const idx = products.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Product not found.' });
  const { name, category, price, image, sizes } = req.body;
  products[idx] = { ...products[idx], name, category, price: parseInt(price), image, sizes: sizes || [] };
  console.log('[ADMIN] Updated product:', name);
  res.json({ status: 'success', product: products[idx] });
});

app.delete('/api/products/:id', requireAdmin, (req, res) => {
  const idx = products.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Product not found.' });
  const [removed] = products.splice(idx, 1);
  console.log('[ADMIN] Deleted product:', removed.name);
  res.json({ status: 'success', message: 'Product deleted.' });
});

app.post('/api/signup', (req, res) => {
  const { username, email, password, age, agreedToTerms, agreedToPrivacy } = req.body;
  if (!username || !email || !password || !age)
    return res.status(400).json({ error: 'All fields are required.' });
  if (parseInt(age) < 18)
    return res.status(403).json({ error: 'You must be 18 or older.' });
  if (!agreedToTerms || !agreedToPrivacy)
    return res.status(400).json({ error: 'Please agree to Terms and Privacy Policy.' });
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
    return res.status(409).json({ error: 'Email already registered.' });

  const user = { id: users.length + 1, username, email, password, age: parseInt(age), role: 'customer', createdAt: new Date() };
  users.push(user);
  const token = genToken();
  sessions[token] = { userId: user.id, username: user.username, role: user.role };
  console.log('[SIGNUP]', username);
  res.json({ status: 'success', token, username: user.username, role: user.role });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

  if ((email === ADMIN.username || email === 'admin') && password === ADMIN.password) {
    const token = genToken();
    sessions[token] = { username: 'Admin', role: 'admin' };
    console.log('[LOGIN] Admin');
    return res.json({ status: 'success', token, username: 'Admin', role: 'admin' });
  }

  const user = users.find(u =>
    (u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === email.toLowerCase())
    && u.password === password
  );
  if (!user) return res.status(401).json({ error: 'Invalid credentials.' });

  const token = genToken();
  sessions[token] = { userId: user.id, username: user.username, role: user.role };
  console.log('[LOGIN]', user.username);
  res.json({ status: 'success', token, username: user.username, role: user.role });
});

app.post('/api/logout', (req, res) => {
  delete sessions[req.headers['authorization']];
  res.json({ status: 'success' });
});

app.get('/api/admin/users', requireAdmin, (req, res) => {
  res.json(users.map(u => ({ id: u.id, username: u.username, email: u.email, age: u.age, createdAt: u.createdAt })));
});

app.get('/api/admin/orders', requireAdmin, (req, res) => res.json(orders));

app.post('/api/checkout', requireAuth, (req, res) => {
  const { cart, total, address, paymentMethod } = req.body;
  if (!cart || cart.length === 0) return res.status(400).json({ error: 'Cart is empty.' });

  const orderNum = 'UL-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  orders.push({ orderNum, user: req.session.username, cart, total, address, paymentMethod, status: 'confirmed', createdAt: new Date() });
  console.log(`[ORDER] ${orderNum} by ${req.session.username} — P${total}`);
  res.json({ status: 'success', orderNum, message: `Order ${orderNum} confirmed!` });
});

app.listen(PORT, () => {
  console.log('\n=======================================');
  console.log('  UNCROWNED is running!');
  console.log('  Open: http://localhost:' + PORT);
  console.log('  Admin: admin / admin123');
  console.log('=======================================\n');
});