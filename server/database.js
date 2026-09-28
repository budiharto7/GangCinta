import mongoose from 'mongoose';

// ============================================================
// MONGODB - Gantikan JSON file dengan database cloud permanen
// ============================================================
const MONGODB_URI = process.env.MONGODB_URI;

// Schema: simpan seluruh data sebagai 1 dokumen (simple & efisien untuk RT)
const GangCintaSchema = new mongoose.Schema({
  key:  { type: String, default: 'main' },
  data: { type: mongoose.Schema.Types.Mixed }
}, { minimize: false });

const GangCintaModel = mongoose.models.GangCinta
  || mongoose.model('GangCinta', GangCintaSchema);

// In-memory cache agar readDB() tetap sinkron & cepat
let _cache = null;

// Dipanggil sekali saat server start - load data dari MongoDB ke cache
export async function initDB() {
  if (!MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI tidak ada, pakai DEFAULT_DATA');
    _cache = DEFAULT_DATA;
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    const doc = await GangCintaModel.findOne({ key: 'main' });
    if (doc?.data) {
      _cache = { ...DEFAULT_DATA, ...doc.data };
      console.log('✅ MongoDB terhubung - data berhasil dimuat');
    } else {
      _cache = DEFAULT_DATA;
      await GangCintaModel.create({ key: 'main', data: DEFAULT_DATA });
      console.log('✅ MongoDB terhubung - data awal tersimpan');
    }
  } catch (err) {
    console.error('❌ MongoDB gagal konek:', err.message);
    _cache = _cache || DEFAULT_DATA;
  }
}


// Default initial data for Gang Cinta - Perumahan Bumi Nagara Lestari (RT 028 RW 005)
const DEFAULT_DATA = {
  theme: "emerald",
  users: [
    {
      id: "user-admin-1",
      username: "admin",
      password: "123",
      name: "Suryadi S",
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      phone: "0812-3456-7890",
      houseNo: "No. 01",
      kkNo: "3201012300010001"
    },
    {
      id: "user-bendahara-1",
      username: "bendahara",
      password: "123",
      name: "Nogi",
      role: "bendahara",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      phone: "0813-8899-7711",
      houseNo: "No. 02",
      kkNo: "3201012300010002"
    },
    {
      id: "user-warga-1",
      username: "budi",
      password: "123",
      name: "Budi",
      role: "anggota",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      phone: "0852-1122-3344",
      houseNo: "No. 04",
      kkNo: "3201012300010004"
    },
    {
      id: "user-warga-2",
      username: "dedi",
      password: "123",
      name: "Dedi",
      role: "anggota",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      phone: "0857-9988-1234",
      houseNo: "No. 07",
      kkNo: "3201012300010007"
    },
    {
      id: "user-warga-3",
      username: "febri",
      password: "123",
      name: "Febri",
      role: "anggota",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      phone: "0821-4433-2211",
      houseNo: "No. 12",
      kkNo: "3201012300010012"
    }
  ],
  families: [
    {
      id: "kk-1",
      kkNumber: "3201012300010001",
      headOfFamily: "Bpk. H. Sukardi",
      houseNumber: "No. 01",
      address: "Gang Cinta, Perumahan Bumi Nagara Lestari RT 028 RW 005, Blok Anggrek No. 01",
      houseStatus: "Milik Sendiri",
      phone: "0812-3456-7890",
      emergencyContact: "0812-9988-7766 (Putra Tertua - Dimas)",
      assignedUserId: "user-admin-1",
      isProfileCompleted: true,
      members: [
        {
          id: "mem-1",
          fullName: "H. Sukardi",
          nik: "3201011504650001",
          relation: "Kepala Keluarga",
          gender: "Laki-laki",
          birthPlace: "Bandung",
          birthDate: "1965-04-15",
          job: "Pensiunan BUMN",
          religion: "Islam",
          bloodType: "O"
        },
        {
          id: "mem-2",
          fullName: "Hj. Ratna Sari",
          nik: "3201015208680002",
          relation: "Istri",
          gender: "Perempuan",
          birthPlace: "Cirebon",
          birthDate: "1968-08-12",
          job: "Ibu Rumah Tangga",
          religion: "Islam",
          bloodType: "A"
        },
        {
          id: "mem-3",
          fullName: "Dimas Sukardi",
          nik: "3201012211950003",
          relation: "Anak",
          gender: "Laki-laki",
          birthPlace: "Bandung",
          birthDate: "1995-11-22",
          job: "Karyawan Swasta",
          religion: "Islam",
          bloodType: "O"
        }
      ]
    },
    {
      id: "kk-2",
      kkNumber: "3201012300010002",
      headOfFamily: "Ibu Hj. Mariam",
      houseNumber: "No. 02",
      address: "Gang Cinta, Perumahan Bumi Nagara Lestari RT 028 RW 005, Blok Anggrek No. 02",
      houseStatus: "Milik Sendiri",
      phone: "0813-8899-7711",
      emergencyContact: "0813-1122-3344",
      assignedUserId: "user-bendahara-1",
      isProfileCompleted: true,
      members: [
        {
          id: "mem-4",
          fullName: "Hj. Mariam",
          nik: "3201014502720001",
          relation: "Kepala Keluarga",
          gender: "Perempuan",
          birthPlace: "Yogyakarta",
          birthDate: "1972-02-05",
          job: "Wiraswasta (Toko Kelontong)",
          religion: "Islam",
          bloodType: "B"
        },
        {
          id: "mem-5",
          fullName: "Rizky Fadilah",
          nik: "3201011809010002",
          relation: "Anak",
          gender: "Laki-laki",
          birthPlace: "Bandung",
          birthDate: "2001-09-18",
          job: "Mahasiswa",
          religion: "Islam",
          bloodType: "B"
        }
      ]
    },
    {
      id: "kk-3",
      kkNumber: "3201012300010004",
      headOfFamily: "Bpk. Budi Santoso",
      houseNumber: "No. 04",
      address: "Gang Cinta, Perumahan Bumi Nagara Lestari RT 028 RW 005, Blok Melati No. 04",
      houseStatus: "Milik Sendiri",
      phone: "0852-1122-3344",
      emergencyContact: "0852-4455-6677",
      assignedUserId: "user-warga-1",
      isProfileCompleted: true,
      members: [
        {
          id: "mem-6",
          fullName: "Budi Santoso",
          nik: "3201011005800001",
          relation: "Kepala Keluarga",
          gender: "Laki-laki",
          birthPlace: "Solo",
          birthDate: "1980-05-10",
          job: "Guru SMA",
          religion: "Islam",
          bloodType: "AB"
        },
        {
          id: "mem-7",
          fullName: "Siti Rahmawati",
          nik: "3201016503830002",
          relation: "Istri",
          gender: "Perempuan",
          birthPlace: "Semarang",
          birthDate: "1983-03-25",
          job: "Pegawai Negeri Sipil",
          religion: "Islam",
          bloodType: "O"
        },
        {
          id: "mem-8",
          fullName: "Annisa Rahma Santoso",
          nik: "3201015507100003",
          relation: "Anak",
          gender: "Perempuan",
          birthPlace: "Bandung",
          birthDate: "2010-07-15",
          job: "Pelajar SMP",
          religion: "Islam",
          bloodType: "AB"
        }
      ]
    },
    {
      id: "kk-4",
      kkNumber: "3201012300010007",
      headOfFamily: "Bpk. Ahmad Dahlan",
      houseNumber: "No. 07",
      address: "Gang Cinta, Perumahan Bumi Nagara Lestari RT 028 RW 005, Blok Melati No. 07",
      houseStatus: "Kontrak",
      phone: "0857-9988-1234",
      emergencyContact: "0857-8877-6655",
      assignedUserId: "user-warga-2",
      isProfileCompleted: true,
      members: [
        {
          id: "mem-9",
          fullName: "Ahmad Dahlan",
          nik: "3201011409850001",
          relation: "Kepala Keluarga",
          gender: "Laki-laki",
          birthPlace: "Surabaya",
          birthDate: "1985-09-14",
          job: "Teknisi Elektronik",
          religion: "Islam",
          bloodType: "O"
        },
        {
          id: "mem-10",
          fullName: "Nurul Aini",
          nik: "3201015212880002",
          relation: "Istri",
          gender: "Perempuan",
          birthPlace: "Malang",
          birthDate: "1988-12-12",
          job: "Karyawati",
          religion: "Islam",
          bloodType: "A"
        }
      ]
    },
    {
      id: "kk-5",
      kkNumber: "3201012300010012",
      headOfFamily: "Ibu Dewi Lestari",
      houseNumber: "No. 12",
      address: "Gang Cinta, Perumahan Bumi Nagara Lestari RT 028 RW 005, Blok Mawar No. 12",
      houseStatus: "Milik Sendiri",
      phone: "0821-4433-2211",
      emergencyContact: "0821-9988-1122",
      assignedUserId: "user-warga-3",
      isProfileCompleted: true,
      members: [
        {
          id: "mem-11",
          fullName: "Dewi Lestari",
          nik: "3201016206780001",
          relation: "Kepala Keluarga",
          gender: "Perempuan",
          birthPlace: "Bandung",
          birthDate: "1978-06-22",
          job: "Desainer Grafis Freelance",
          religion: "Islam",
          bloodType: "B"
        }
      ]
    }
  ],
  monthlyBalances: {
    "2026-09": {
      monthName: "September 2026",
      categories: {
        sampah: 0,
        keamanan: 0,
        kas: 2100000,
        sosial: 1100000,
        olahraga: 600000
      }
    },
    "2026-08": {
      monthName: "Agustus 2026",
      categories: {
        sampah: 0,
        keamanan: 0,
        kas: 1800000,
        sosial: 900000,
        olahraga: 520000
      }
    }
  },
  transactions: [
    {
      id: "trx-01",
      date: "2026-09-02",
      category: "sampah",
      type: "income",
      amount: 1250000,
      title: "Penerimaan Iuran Sampah Warga (25 KK)",
      description: "Iuran rutin sampah bulanan September dari 25 KK warga Gang Cinta @Rp 50.000",
      receiptUrl: "",
      recordedBy: "Ibu Hj. Mariam (Bendahara)"
    },
    {
      id: "trx-02",
      date: "2026-09-03",
      category: "keamanan",
      type: "income",
      amount: 1500000,
      title: "Penerimaan Iuran Keamanan / Siskamling (25 KK)",
      description: "Iuran bulanan pos ronda & penjagaan malam @Rp 60.000",
      receiptUrl: "",
      recordedBy: "Ibu Hj. Mariam (Bendahara)"
    },
    {
      id: "trx-03",
      date: "2026-09-05",
      category: "sampah",
      type: "expense",
      amount: 800000,
      title: "Honor Petugas Sampah Roda Tiga & Retribusi TPS",
      description: "Honorarium 2 petugas pengangkut sampah lingkungan per 2 pekan + retribusi armada TPS",
      receiptUrl: "",
      recordedBy: "Ibu Hj. Mariam (Bendahara)"
    },
    {
      id: "trx-04",
      date: "2026-09-07",
      category: "kas",
      type: "income",
      amount: 750000,
      title: "Iuran Kas Bulanan Warga Gang Cinta RT 028 RW 005",
      description: "Iuran kas operasional dan sosial warga Gang Cinta bulan September",
      receiptUrl: "",
      recordedBy: "Ibu Hj. Mariam (Bendahara)"
    },
    {
      id: "trx-05",
      date: "2026-09-10",
      category: "kas",
      type: "expense",
      amount: 320000,
      title: "Beli Semen & Pasir Tambal Paving Amblas",
      description: "Perbaikan 4 titik paving block jalan gang yang amblas dekat rumah No. 06",
      receiptUrl: "",
      recordedBy: "Ibu Hj. Mariam (Bendahara)"
    },
    {
      id: "trx-06",
      date: "2026-09-12",
      category: "keamanan",
      type: "expense",
      amount: 250000,
      title: "Penggantian Lampu Sorot LED Pos Ronda",
      description: "Beli 2 buah lampu sorot outdoor LED 50W pos ronda dan kabel fitting",
      receiptUrl: "",
      recordedBy: "Ibu Hj. Mariam (Bendahara)"
    },
    {
      id: "trx-07",
      date: "2026-09-14",
      category: "sosial",
      type: "expense",
      amount: 400000,
      title: "Santunan Jenguk Warga Sakit (Bpk. Joko No. 09)",
      description: "Bantuan tali asih dan buah tangan jenguk warga yang dirawat di RS",
      receiptUrl: "",
      recordedBy: "Ibu Hj. Mariam (Bendahara)"
    },
    {
      id: "trx-08",
      date: "2026-09-15",
      category: "olahraga",
      type: "income",
      amount: 500000,
      title: "Uang Kas Pemuda & Donasi Olahraga",
      description: "Donasi sukarela dari warga untuk kas lapangan bulutangkis gang",
      receiptUrl: "",
      recordedBy: "Ibu Hj. Mariam (Bendahara)"
    },
    {
      id: "trx-09",
      date: "2026-09-18",
      category: "olahraga",
      type: "expense",
      amount: 350000,
      title: "Pembelian 2 Tabung Shuttlecock & Net Bulutangkis Baru",
      description: "Alat latihan rutin bulutangkis pemuda dan warga setiap Sabtu malam",
      receiptUrl: "",
      recordedBy: "Ibu Hj. Mariam (Bendahara)"
    },
    {
      id: "trx-10",
      date: "2026-09-20",
      category: "sampah",
      type: "expense",
      amount: 150000,
      title: "Beli 3 Karung Plastik Sampah Jumbo & Sapu Lidi",
      description: "Perlengkapan rutin tong sampah umum sudut gang",
      receiptUrl: "",
      recordedBy: "Ibu Hj. Mariam (Bendahara)"
    }
  ],
  moments: [
    {
      id: "moment-1",
      title: "Kerja Bakti Akbar: Bersih Saluran Drainase & Pengecatan Gang",
      category: "Kerja Bakti",
      eventDate: "2026-09-06",
      description: "Warga Gang Cinta RT 028 RW 005 (Perumahan Bumi Nagara Lestari) bergotong royong membersihkan saluran selokan menyambut musim hujan dan mempercantik pot tanaman sepanjang gang. Suasana sangat kompak!",
      imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80",
      location: "Sepanjang Lorong Gang Cinta RT 028 RW 005",
      uploadedBy: "Bpk. H. Sukardi (Ketua Gang Cinta)",
      createdAt: "2026-09-06T11:30:00Z",
      likes: 24
    },
    {
      id: "moment-2",
      title: "Semarak Peringatan HUT Kemerdekaan RI ke-81",
      category: "HUT RI",
      eventDate: "2026-08-17",
      description: "Lomba balap karung, makan kerupuk, dan cerdas cermat anak-anak Gang Cinta RT 028 RW 005. Dilanjutkan syukuran tumpengan malam tirakatan bersama seluruh warga.",
      imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
      location: "Lapangan Pos Ronda Gang Cinta",
      uploadedBy: "Bpk. H. Sukardi (Ketua Gang Cinta)",
      createdAt: "2026-08-17T20:00:00Z",
      likes: 38
    },
    {
      id: "moment-3",
      title: "Malam Final Turnamen Tenis Meja & Badminton Antar Warga",
      category: "Olahraga",
      eventDate: "2026-08-25",
      description: "Pertandingan seru penuh tawa dan keakraban warga Gang Cinta RT 028 RW 005. Selamat kepada perwakilan No. 04 dan No. 07 yang meraih juara!",
      imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80",
      location: "Balai Warga Gang Cinta",
      uploadedBy: "Bpk. H. Sukardi (Ketua Gang Cinta)",
      createdAt: "2026-08-25T22:15:00Z",
      likes: 19
    },
    {
      id: "moment-4",
      title: "Pengajian Rutin Bulanan & Santunan Anak Yatim",
      category: "Keagamaan",
      eventDate: "2026-09-11",
      description: "Kegiatan pengajian dan tausiyah kebersamaan diiringi penyerahan santunan tali asih dari kas dana sosial warga.",
      imageUrl: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80",
      location: "Kediaman Bpk. Ketua Gang Cinta (No. 01)",
      uploadedBy: "Bpk. H. Sukardi (Ketua Gang Cinta)",
      createdAt: "2026-09-11T21:00:00Z",
      likes: 29
    }
  ],
  guestReports: [
    {
      id: "guest-1",
      reporterUserId: "user-warga-1",
      reporterName: "Bpk. Budi Santoso",
      houseNumber: "No. 04",
      guestName: "Bambang Wijaya",
      guestNik: "3302151205750005",
      guestKkNumber: "3302150101990001",
      guestAddress: "Jl. Diponegoro No. 45, RT 02/01, Banyumas, Jawa Tengah",
      relationship: "Kakak Kandung",
      startDate: "2026-09-18",
      durationDays: 4,
      endDate: "2026-09-22",
      contactPhone: "0812-7766-5544",
      reason: "Menghadiri acara wisuda keponakan dan silaturahmi keluarga",
      status: "verified",
      notesFromAdmin: "Sudah dikonfirmasi oleh Ketua Gang Cinta pada saat jaga ronda.",
      reportedAt: "2026-09-17T14:30:00Z"
    },
    {
      id: "guest-2",
      reporterUserId: "user-warga-2",
      reporterName: "Bpk. Ahmad Dahlan",
      houseNumber: "No. 07",
      guestName: "Tri Wahyuni",
      guestNik: "3578014506890002",
      guestKkNumber: "3578010102100008",
      guestAddress: "Rungkut Asri Timur No. 18, Surabaya",
      relationship: "Adik Ipar",
      startDate: "2026-09-20",
      durationDays: 3,
      endDate: "2026-09-23",
      contactPhone: "0856-1122-7788",
      reason: "Pemeriksaan kesehatan kontrol di Rumah Sakit Kota",
      status: "pending",
      notesFromAdmin: "",
      reportedAt: "2026-09-19T09:15:00Z"
    }
  ],
  chatMessages: []
};

// Safe Database operations
// readDB() - sinkron, baca dari cache (cepat)
function readDB() {
  return _cache || DEFAULT_DATA;
}

// writeDB() - update cache + simpan ke MongoDB async (tidak block response)
function writeDB(data) {
  _cache = data;
  if (MONGODB_URI && mongoose.connection.readyState === 1) {
    GangCintaModel.findOneAndUpdate(
      { key: 'main' },
      { data },
      { upsert: true, new: true }
    ).catch(err => console.error('MongoDB write error:', err.message));
  }
}

export const db = {
  getData() {
    return readDB();
  },
  
  // Theme
  getTheme() {
    return readDB().theme || "emerald";
  },
  setTheme(themeId) {
    const data = readDB();
    data.theme = themeId;
    writeDB(data);
    return themeId;
  },

  // Users & Auth
  getUsers() {
    return readDB().users || [];
  },
  findUser(username, password) {
    const users = this.getUsers();
    const cleanUser = (username || "").toLowerCase().trim();
    const cleanPass = String(password || "").trim();
    return users.find(u => 
      ((u.username || "").toLowerCase().trim() === cleanUser || (u.name || "").toLowerCase().trim() === cleanUser) &&
      String(u.password || "").trim() === cleanPass
    );
  },
  updateUserProfile(userId, updates) {
    const data = readDB();
    const index = data.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      data.users[index] = { ...data.users[index], ...updates };
      
      // Sync with family
      const famIndex = data.families.findIndex(f => f.assignedUserId === userId);
      if (famIndex !== -1) {
        if (updates.name) data.families[famIndex].headOfFamily = updates.name;
        if (updates.phone) data.families[famIndex].phone = updates.phone;
      }

      writeDB(data);
      return data.users[index];
    }
    return null;
  },
  changeUserPassword(userId, oldPassword, newPassword) {
    const data = readDB();
    const index = data.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      if (data.users[index].password !== oldPassword) {
        return { success: false, message: "Password lama Anda tidak sesuai" };
      }
      data.users[index].password = newPassword;
      writeDB(data);
      return { success: true, user: data.users[index] };
    }
    return { success: false, message: "Pengguna tidak ditemukan" };
  },
  addUser(newUser) {
    const data = readDB();
    data.users.push(newUser);
    writeDB(data);
    return newUser;
  },

  // Families
  getFamilies() {
    return readDB().families || [];
  },
  addFamily(newFam) {
    const data = readDB();
    data.families.unshift(newFam);
    writeDB(data);
    return newFam;
  },
  updateFamily(id, updates) {
    const data = readDB();
    const index = data.families.findIndex(f => f.id === id);
    if (index !== -1) {
      data.families[index] = { ...data.families[index], ...updates };
      writeDB(data);
      return data.families[index];
    }
    return null;
  },
  deleteFamily(id) {
    const data = readDB();
    const targetFam = data.families.find(f => f.id === id);
    data.families = (data.families || []).filter(f => f.id !== id);

    if (targetFam) {
      const assignedId = targetFam.assignedUserId;
      const cleanHead = (targetFam.headOfFamily || "").toLowerCase().trim();
      const memberNames = (targetFam.members || []).map(m => (m?.fullName || "").toLowerCase().trim()).filter(Boolean);

      // Cascade delete user account (for head of family AND any member)
      data.users = (data.users || []).filter(u => {
        if (u.id === "user-admin-1" || u.id === "user-bendahara-1") return true;
        if (assignedId && u.id === assignedId) return false;
        const uName = (u.name || "").toLowerCase().trim();
        if (cleanHead && uName === cleanHead) return false;
        if (memberNames.includes(uName)) return false;
        return true;
      });

      // Cascade delete chat messages
      if (Array.isArray(data.chatMessages)) {
        data.chatMessages = data.chatMessages.filter(c => {
          if (assignedId && c.senderId === assignedId) return false;
          const sName = (c.senderName || "").toLowerCase().trim();
          if (cleanHead && sName === cleanHead) return false;
          if (memberNames.includes(sName)) return false;
          return true;
        });
      }

      // Cascade delete guest reports
      if (Array.isArray(data.guestReports)) {
        data.guestReports = data.guestReports.filter(r => {
          if (assignedId && r.reporterUserId === assignedId) return false;
          const rName = (r.reporterName || "").toLowerCase().trim();
          if (cleanHead && rName === cleanHead) return false;
          if (memberNames.includes(rName)) return false;
          return true;
        });
      }

      // Cascade delete financial transactions
      if (Array.isArray(data.transactions)) {
        data.transactions = data.transactions.filter(t => {
          if (t.familyId && t.familyId === id) return false;
          const tTitle = (t.title || "").toLowerCase();
          if (cleanHead && tTitle.includes(cleanHead)) return false;
          if (memberNames.some(mn => mn && tTitle.includes(mn))) return false;
          return true;
        });
      }
    }

    writeDB(data);
  },

  deleteMemberFromFamily(familyId, memberId) {
    const data = readDB();
    const targetFam = (data.families || []).find(f => f.id === familyId);
    if (!targetFam) return null;

    const targetMember = (targetFam.members || []).find(m => m.id === memberId);
    const cleanName = (targetMember?.fullName || "").toLowerCase().trim();

    targetFam.members = (targetFam.members || []).filter(m => m.id !== memberId);
    if (cleanName && targetFam.headOfFamily?.toLowerCase().trim() === cleanName) {
      if (targetFam.members.length > 0) {
        targetFam.headOfFamily = targetFam.members[0].fullName;
      }
    }

    if (cleanName) {
      // Cascade delete users
      data.users = (data.users || []).filter(u => {
        if (u.id === "user-admin-1" || u.id === "user-bendahara-1") return true;
        const uName = (u.name || "").toLowerCase().trim();
        return uName !== cleanName;
      });

      // Cascade delete chat messages
      if (Array.isArray(data.chatMessages)) {
        data.chatMessages = data.chatMessages.filter(c => {
          const sName = (c.senderName || "").toLowerCase().trim();
          return sName !== cleanName;
        });
      }

      // Cascade delete guest reports
      if (Array.isArray(data.guestReports)) {
        data.guestReports = data.guestReports.filter(r => {
          const rName = (r.reporterName || "").toLowerCase().trim();
          return rName !== cleanName;
        });
      }

      // Cascade delete transactions
      if (Array.isArray(data.transactions)) {
        data.transactions = data.transactions.filter(t => {
          const tTitle = (t.title || "").toLowerCase();
          return !tTitle.includes(cleanName);
        });
      }
    }

    writeDB(data);
    return targetFam;
  },

  deleteUser(userId) {
    const data = readDB();
    const targetUser = (data.users || []).find(u => u.id === userId);
    data.users = (data.users || []).filter(u => u.id !== userId);

    if (targetUser) {
      const cleanName = (targetUser.name || "").toLowerCase().trim();

      // Cascade delete linked family or remove member from families
      data.families = (data.families || []).filter(f => {
        if (f.assignedUserId && f.assignedUserId === userId) return false;
        if (cleanName && f.headOfFamily && f.headOfFamily.toLowerCase().trim() === cleanName && (!f.members || f.members.length <= 1)) return false;
        return true;
      });

      // Purge from members array in remaining families
      data.families.forEach(f => {
        if (Array.isArray(f.members)) {
          f.members = f.members.filter(m => {
            const mName = (m.fullName || "").toLowerCase().trim();
            return mName !== cleanName;
          });
        }
      });

      // Cascade delete chats
      if (Array.isArray(data.chatMessages)) {
        data.chatMessages = data.chatMessages.filter(c => {
          if (c.senderId === userId) return false;
          if (cleanName && c.senderName && c.senderName.toLowerCase().trim() === cleanName) return false;
          return true;
        });
      }

      // Cascade delete guest reports
      if (Array.isArray(data.guestReports)) {
        data.guestReports = data.guestReports.filter(r => {
          if (r.reporterUserId === userId) return false;
          if (cleanName && r.reporterName && r.reporterName.toLowerCase().trim() === cleanName) return false;
          return true;
        });
      }

      // Cascade delete transactions
      if (Array.isArray(data.transactions)) {
        data.transactions = data.transactions.filter(t => {
          const tTitle = (t.title || "").toLowerCase();
          return !tTitle.includes(cleanName);
        });
      }
    }

    writeDB(data);
  },

  // Finance
  getTransactions() {
    return readDB().transactions || [];
  },
  addTransaction(newTrx) {
    const data = readDB();
    data.transactions.unshift(newTrx);
    writeDB(data);
    return newTrx;
  },
  deleteTransaction(id) {
    const data = readDB();
    data.transactions = data.transactions.filter(t => t.id !== id);
    writeDB(data);
  },
  getMonthlyBalances() {
    return readDB().monthlyBalances || {};
  },
  setStartingBalances(monthKey, categoriesObj) {
    const data = readDB();
    const d = new Date(`${monthKey}-01`);
    const monthName = d.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    data.monthlyBalances[monthKey] = {
      monthName,
      categories: categoriesObj
    };
    writeDB(data);
    return data.monthlyBalances[monthKey];
  },

  // Moments
  getMoments() {
    return readDB().moments || [];
  },
  addMoment(moment) {
    const data = readDB();
    data.moments.unshift(moment);
    writeDB(data);
    return moment;
  },
  deleteMoment(id) {
    const data = readDB();
    data.moments = data.moments.filter(m => m.id !== id);
    writeDB(data);
  },
  likeMoment(id) {
    const data = readDB();
    const m = data.moments.find(item => item.id === id);
    if (m) {
      m.likes = (m.likes || 0) + 1;
      writeDB(data);
      return m.likes;
    }
    return 0;
  },

  // Guest Reports
  getGuestReports() {
    return readDB().guestReports || [];
  },
  addGuestReport(report) {
    const data = readDB();
    data.guestReports.unshift(report);
    writeDB(data);
    return report;
  },
  updateGuestReport(id, updates) {
    const data = readDB();
    const index = data.guestReports.findIndex(r => r.id === id);
    if (index !== -1) {
      data.guestReports[index] = { ...data.guestReports[index], ...updates };
      writeDB(data);
      return data.guestReports[index];
    }
    return null;
  },
  deleteGuestReport(id) {
    const data = readDB();
    data.guestReports = data.guestReports.filter(r => r.id !== id);
    writeDB(data);
  },

  // Chat
  getChatMessages() {
    const data = readDB();
    const messages = data.chatMessages || [];
    const users = data.users || [];
    return messages.map(msg => {
      const user = users.find(u => u.id === msg.senderId);
      if (user) {
        return {
          ...msg,
          senderName: user.name,
          senderRole: user.role,
          senderAvatar: user.avatar,
          senderHouse: user.houseNo || msg.senderHouse
        };
      }
      return msg;
    });
  },
  addChatMessage(msg) {
    const data = readDB();
    data.chatMessages = data.chatMessages || [];
    data.chatMessages.push(msg);
    writeDB(data);
    return msg;
  },
  clearChatMessages() {
    const data = readDB();
    data.chatMessages = [];
    writeDB(data);
    return [];
  }
};
