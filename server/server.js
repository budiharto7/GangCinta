import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './database.js';
import { processKKImageOCR } from './kkOcrService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// CORS: izinkan akses dari Netlify & development lokal
app.use(cors({
  origin: process.env.FRONTEND_URL 
    ? [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173']
    : true, // development: izinkan semua
  credentials: true
}));
app.use(express.json({ limit: '15mb' }));


// --- API ROUTES ---

// Theme
app.get('/api/theme', (req, res) => {
  res.json({ theme: db.getTheme() });
});

app.post('/api/theme', (req, res) => {
  const { theme } = req.body;
  const saved = db.setTheme(theme);
  res.json({ success: true, theme: saved });
});

// Auth & Users
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.findUser(username, password);
  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(401).json({ success: false, message: 'Username atau password salah.' });
  }
});

app.get('/api/users', (req, res) => {
  res.json(db.getUsers());
});

app.put('/api/profile', (req, res) => {
  const { userId, name, phone, avatar } = req.body;
  const updated = db.updateUserProfile(userId, { name, phone, avatar });
  if (updated) {
    res.json({ success: true, user: updated });
  } else {
    res.status(404).json({ success: false, message: 'User tidak ditemukan' });
  }
});

app.put('/api/profile/password', (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;
  const result = db.changeUserPassword(userId, oldPassword, newPassword);
  if (result.success) {
    res.json({ success: true, user: result.user });
  } else {
    res.status(400).json({ success: false, message: result.message });
  }
});

app.post('/api/users', (req, res) => {
  const { name, username, password, role, houseNo, kkNo, phone } = req.body;
  const users = db.getUsers();
  const families = db.getFamilies();
  const cleanName = (name || "").trim();
  const cleanUsername = (username || "").trim().toLowerCase();

  const existingUser = users.find(
    u => u.username?.toLowerCase() === cleanUsername || u.name?.toLowerCase() === cleanName.toLowerCase()
  );

  if (existingUser) {
    const hasActiveFamily = families.some(
      f => f.assignedUserId === existingUser.id || f.headOfFamily?.toLowerCase() === cleanName.toLowerCase()
    );
    if (hasActiveFamily) {
      return res.status(400).json({ success: false, message: `Warga dengan nama '${cleanName}' atau username '${cleanUsername}' sudah terdaftar.` });
    } else {
      // User was orphaned from a deleted family KK, remove old entry first
      db.deleteUser(existingUser.id);
    }
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name: cleanName,
    username: cleanUsername,
    password: password || '123',
    role: role || 'anggota',
    jabatan: role === 'admin' ? 'Pengurus RT' : role === 'bendahara' ? 'Bendahara Kas' : 'Warga Biasa',
    icon: role === 'admin' ? '👑' : role === 'bendahara' ? '💰' : '👤',
    houseNo: houseNo || '',
    kkNo: kkNo || '',
    phone: phone || '',
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`
  };
  db.addUser(newUser);
  res.json({ success: true, user: newUser });
});

app.delete('/api/users/:id', (req, res) => {
  db.deleteUser(req.params.id);
  res.json({ success: true });
});

// Families (KK)
app.get('/api/families', (req, res) => {
  res.json(db.getFamilies());
});

app.post('/api/families', (req, res) => {
  const newFam = {
    id: `kk-${Date.now()}`,
    ...req.body,
    isProfileCompleted: false,
    members: req.body.members || [
      {
        id: `mem-${Date.now()}`,
        fullName: req.body.headOfFamily,
        nik: '',
        relation: 'Kepala Keluarga',
        gender: 'Laki-laki',
        birthPlace: '',
        birthDate: '',
        job: '',
        religion: 'Islam',
        bloodType: '-'
      }
    ]
  };
  db.addFamily(newFam);
  res.json({ success: true, family: newFam });
});

app.put('/api/families/:id', (req, res) => {
  const updated = db.updateFamily(req.params.id, req.body);
  if (updated) {
    res.json({ success: true, family: updated });
  } else {
    res.status(404).json({ success: false, message: 'Data KK tidak ditemukan' });
  }
});

app.delete('/api/families/:id', (req, res) => {
  db.deleteFamily(req.params.id);
  res.json({ success: true });
});

app.delete('/api/families/:familyId/members/:memberId', (req, res) => {
  const updated = db.deleteMemberFromFamily(req.params.familyId, req.params.memberId);
  res.json({ success: true, family: updated });
});

// Finance
app.get('/api/finance/summary/:monthKey', (req, res) => {
  const monthKey = req.params.monthKey;
  const balances = db.getMonthlyBalances();
  const monthBalanceData = balances[monthKey]?.categories || {
    sampah: 0,
    keamanan: 0,
    kas: 0,
    sosial: 0,
    olahraga: 0
  };

  const allTransactions = db.getTransactions();
  const monthTransactions = allTransactions.filter(t => t.date.startsWith(monthKey));

  const categoryBreakdown = {
    sampah: { starting: monthBalanceData.sampah || 0, income: 0, expense: 0, ending: 0, items: [] },
    keamanan: { starting: monthBalanceData.keamanan || 0, income: 0, expense: 0, ending: 0, items: [] },
    kas: { starting: monthBalanceData.kas || 0, income: 0, expense: 0, ending: 0, items: [] },
    sosial: { starting: monthBalanceData.sosial || 0, income: 0, expense: 0, ending: 0, items: [] },
    olahraga: { starting: monthBalanceData.olahraga || 0, income: 0, expense: 0, ending: 0, items: [] }
  };

  let totalStartingBalance = 0;
  let totalIncome = 0;
  let totalExpense = 0;

  Object.keys(categoryBreakdown).forEach(k => {
    totalStartingBalance += categoryBreakdown[k].starting;
  });

  const expenseList = [];
  const incomeList = [];

  monthTransactions.forEach(t => {
    const amt = Number(t.amount);
    const cat = t.category;
    if (t.type === 'income') {
      totalIncome += amt;
      incomeList.push(t);
      if (categoryBreakdown[cat]) {
        categoryBreakdown[cat].income += amt;
      }
    } else {
      totalExpense += amt;
      expenseList.push(t);
      if (categoryBreakdown[cat]) {
        categoryBreakdown[cat].expense += amt;
        categoryBreakdown[cat].items.push(t);
      }
    }
  });

  Object.keys(categoryBreakdown).forEach(k => {
    const c = categoryBreakdown[k];
    c.ending = c.starting + c.income - c.expense;
  });

  const totalEndingBalance = totalStartingBalance + totalIncome - totalExpense;

  res.json({
    monthKey,
    startingBalance: totalStartingBalance,
    totalIncome,
    totalExpense,
    endingBalance: totalEndingBalance,
    categoryBreakdown,
    expenseList,
    incomeList,
    transactions: monthTransactions
  });
});

app.get('/api/finance/transactions', (req, res) => {
  res.json(db.getTransactions());
});

app.post('/api/finance/transactions', (req, res) => {
  const newTrx = {
    id: `trx-${Date.now()}`,
    ...req.body,
    amount: Number(req.body.amount)
  };
  db.addTransaction(newTrx);
  res.json({ success: true, transaction: newTrx });
});

app.delete('/api/finance/transactions/:id', (req, res) => {
  db.deleteTransaction(req.params.id);
  res.json({ success: true });
});

app.post('/api/finance/starting-balances', (req, res) => {
  const { monthKey, categories } = req.body;
  const saved = db.setStartingBalances(monthKey, {
    sampah: Number(categories.sampah || 0),
    keamanan: Number(categories.keamanan || 0),
    kas: Number(categories.kas || 0),
    sosial: Number(categories.sosial || 0),
    olahraga: Number(categories.olahraga || 0)
  });
  res.json({ success: true, data: saved });
});

// Moments
app.get('/api/moments', (req, res) => {
  res.json(db.getMoments());
});

app.post('/api/moments', (req, res) => {
  const newMoment = {
    id: `moment-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
    likes: 0
  };
  db.addMoment(newMoment);
  res.json({ success: true, moment: newMoment });
});

app.delete('/api/moments/:id', (req, res) => {
  db.deleteMoment(req.params.id);
  res.json({ success: true });
});

app.post('/api/moments/:id/like', (req, res) => {
  const likes = db.likeMoment(req.params.id);
  res.json({ success: true, likes });
});

// Guest Reports (Confidential)
app.get('/api/guests', (req, res) => {
  const { userId, role } = req.query;
  const allReports = db.getGuestReports();
  if (role === 'admin') {
    return res.json(allReports);
  }
  // Filter confidential
  res.json(allReports.filter(r => r.reporterUserId === userId));
});

app.post('/api/guests', (req, res) => {
  const newReport = {
    id: `guest-${Date.now()}`,
    ...req.body,
    status: 'pending',
    notesFromAdmin: '',
    reportedAt: new Date().toISOString()
  };
  db.addGuestReport(newReport);
  res.json({ success: true, report: newReport });
});

app.put('/api/guests/:id', (req, res) => {
  const updated = db.updateGuestReport(req.params.id, req.body);
  res.json({ success: true, report: updated });
});

app.delete('/api/guests/:id', (req, res) => {
  db.deleteGuestReport(req.params.id);
  res.json({ success: true });
});

// Chat
app.get('/api/chat', (req, res) => {
  res.json(db.getChatMessages());
});

app.post('/api/chat', (req, res) => {
  const { user, message } = req.body;
  const newMsg = {
    id: `chat-${Date.now()}`,
    senderId: user.id,
    senderName: user.name,
    senderRole: user.role,
    senderAvatar: user.avatar,
    senderHouse: user.houseNo || 'RT 028 RW 005',
    message: message.trim(),
    timestamp: new Date().toISOString()
  };
  db.addChatMessage(newMsg);
  res.json({ success: true, chat: newMsg });
});

app.delete('/api/chat', (req, res) => {
  db.clearChatMessages();
  res.json({ success: true, message: 'Chat berhasil dibersihkan.' });
});

// Kartu Keluarga OCR Auto-Fill Endpoint
app.post('/api/parse-kk', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: 'File gambar KK tidak ditemukan.' });
    }
    const result = await processKKImageOCR(image);
    res.json(result);
  } catch (error) {
    console.error('Error processing KK OCR:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal memproses gambar KK: ' + (error.message || 'Kesalahan OCR.') 
    });
  }
});

// Serve static frontend in production if dist/ exists
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA client-side routing (compatible with Express 5)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  next();
});

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Gang Cinta API & Database Server running on port ${PORT}`);
  });
}

export default app;
