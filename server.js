const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function saveToFile(filename, data) {
  const filepath = path.join(DATA_DIR, filename);
  let entries = [];
  if (fs.existsSync(filepath)) {
    try { entries = JSON.parse(fs.readFileSync(filepath, 'utf-8')); }
    catch (e) { entries = []; }
  }
  const entry = { ...data, id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5), timestamp: new Date().toISOString() };
  entries.push(entry);
  fs.writeFileSync(filepath, JSON.stringify(entries, null, 2));
  return entry;
}

function readFile(filename) {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) return [];
  try { return JSON.parse(fs.readFileSync(filepath, 'utf-8')); }
  catch (e) { return []; }
}

function writeFile(filename, data) {
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

function generateCustomerId() {
  const prefix = 'CCW';
  const num = String(Math.floor(10000 + Math.random() * 90000));
  return prefix + '-' + num;
}

function generateMemberToken() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 16);
}

app.get('/api/status', (req, res) => {
  res.json({ status: 'online', name: 'ToughYuff', version: '1.0.0' });
});

// ===== MEMBERSHIP / CUSTOMER ACCOUNT =====

app.post('/api/members/signup', (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }
    const members = readFile('members.json');
    const existing = members.find(m => m.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ success: false, error: 'A member with this email already exists.' });
    }
    const customerId = generateCustomerId();
    // Ensure unique customer ID
    while (members.find(m => m.customerId === customerId)) {
      // regenerate if collision (extremely rare)
    }
    const token = generateMemberToken();
    const member = {
      name, email: email.toLowerCase(), phone: phone || '', password, customerId, token,
      createdAt: new Date().toISOString()
    };
    members.push(member);
    writeFile('members.json', members);
    res.json({ success: true, message: 'Account created!', customerId, token, name });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

app.post('/api/members/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }
    const members = readFile('members.json');
    const member = members.find(m => m.email.toLowerCase() === email.toLowerCase() && m.password === password);
    if (!member) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }
    // Generate a fresh token on each login
    const token = generateMemberToken();
    member.token = token;
    writeFile('members.json', members);
    res.json({ success: true, message: 'Login successful!', customerId: member.customerId, token, name: member.name, email: member.email, phone: member.phone });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

app.get('/api/members/account', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }
    const token = authHeader.split(' ')[1];
    const members = readFile('members.json');
    const member = members.find(m => m.token === token);
    if (!member) {
      return res.status(401).json({ success: false, error: 'Invalid session. Please log in again.' });
    }
    // Fetch member's orders
    const orders = readFile('orders.json').filter(o => o.customerId === member.customerId);
    res.json({
      success: true,
      member: { name: member.name, email: member.email, phone: member.phone, customerId: member.customerId, createdAt: member.createdAt },
      orders: orders.reverse()
    });
  } catch (err) {
    console.error('Account error:', err);
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

// ===== ORDERS — Members Only =====

app.post('/api/orders', (req, res) => {
  try {
    const { items, customerId, token } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ success: false, error: 'Cart is empty.' });
    }
    if (!customerId || !token) {
      return res.status(401).json({ success: false, error: 'Members only. Please sign up or log in to place an order.' });
    }
    // Verify membership
    const members = readFile('members.json');
    const member = members.find(m => m.customerId === customerId && m.token === token);
    if (!member) {
      return res.status(401).json({ success: false, error: 'Invalid member session. Please log in again.' });
    }
    // Calculate totals with 8% sales tax
    const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const taxRate = 0.08;
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;
    const entry = saveToFile('orders.json', {
      customerId: member.customerId,
      memberName: member.name,
      memberEmail: member.email,
      items,
      subtotal,
      tax,
      taxRate: '8%',
      total,
      status: 'received'
    });
    res.json({ success: true, message: 'Order placed! Thank you for your purchase.', id: entry.id, subtotal, tax, total });
  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

// ===== OLD / UNCHANGED ROUTES BELOW =====

app.post('/api/repair-quote', (req, res) => {
  try {
    const { name, email, phone, device, deviceModel, issue, message } = req.body;
    if (!name || !email || !device) {
      return res.status(400).json({ success: false, error: 'Name, email, and device are required.' });
    }
    const entry = saveToFile('repair-quotes.json', { name, email, phone: phone || '', device, deviceModel: deviceModel || '', issue: issue || '', message: message || '', status: 'pending' });
    res.json({ success: true, message: 'Quote received! We will contact you within 1 hour.', id: entry.id });
  } catch (err) {
    console.error('Quote error:', err);
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

// Orders endpoint moved above — members-only with 8% tax

app.post('/api/contact', (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
    }
    const entry = saveToFile('contacts.json', { name, email, subject: subject || 'General Inquiry', message, status: 'unread' });
    res.json({ success: true, message: 'Message received!', id: entry.id });
  } catch (err) {
    console.error('Contact error:', err);
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

app.get('/api/admin/repair-quotes', (req, res) => {
  const filepath = path.join(DATA_DIR, 'repair-quotes.json');
  if (!fs.existsSync(filepath)) return res.json([]);
  try {
    const entries = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    res.json(entries.reverse().slice(0, 100));
  } catch (e) { res.json([]); }
});

app.get('/api/admin/orders', (req, res) => {
  const filepath = path.join(DATA_DIR, 'orders.json');
  if (!fs.existsSync(filepath)) return res.json([]);
  try {
    const entries = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    res.json(entries.reverse().slice(0, 100));
  } catch (e) { res.json([]); }
});

app.get('/api/admin/contacts', (req, res) => {
  const filepath = path.join(DATA_DIR, 'contacts.json');
  if (!fs.existsSync(filepath)) return res.json([]);
  try {
    const entries = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    res.json(entries.reverse().slice(0, 100));
  } catch (e) { res.json([]); }
});

app.get('/api/admin/stats', (req, res) => {
  const types = ['repair-quotes', 'orders', 'contacts'];
  const stats = {};
  types.forEach(type => {
    const filepath = path.join(DATA_DIR, type + '.json');
    if (fs.existsSync(filepath)) {
      try {
        const entries = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
        stats[type] = entries.length;
      } catch (e) { stats[type] = 0; }
    } else { stats[type] = 0; }
  });
  res.json(stats);
});

// Fallback - serve index.html for all non-API routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log('========================================');
  console.log('  ToughYuff Backend');
  console.log('  Server: http://localhost:' + PORT);
  console.log('  API:    http://localhost:' + PORT + '/api/status');
  console.log('========================================');
});
