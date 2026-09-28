// Initial seed data for Gang Cinta - Perumahan Bumi Nagara Lestari (RT 028 RW 005) Portal
export const INITIAL_USERS = [
  {
    id: "user-admin-1",
    username: "admin",
    password: "123",
    name: "Suryadi S",
    role: "admin", // admin | bendahara | anggota
    jabatan: "Ketua Gang",
    icon: "👑",
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
    jabatan: "Bendahara Kas",
    icon: "💰",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
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
    jabatan: "Warga Biasa",
    icon: "👤",
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
    jabatan: "Seksi Keagamaan",
    icon: "🕌",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    phone: "0857-9988-1234",
    houseNo: "Blok F4 No. 07",
    kkNo: "3201012300010007"
  },
  {
    id: "user-warga-3",
    username: "febri",
    password: "123",
    name: "Febri",
    role: "anggota",
    jabatan: "Warga Biasa",
    icon: "👤",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    phone: "0821-4433-2211",
    houseNo: "No. 12",
    kkNo: "3201012300010012"
  },
  {
    id: "user-1790431976879",
    username: "udin",
    password: "123",
    name: "Udin",
    role: "admin",
    jabatan: "Pengurus RT",
    icon: "👑",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    phone: "",
    houseNo: "Blok F6 No. 08",
    kkNo: "3201012300010030"
  },
  {
    id: "user-1790433466331",
    username: "rusli",
    password: "123",
    name: "Rusli",
    role: "anggota",
    jabatan: "Warga Biasa",
    icon: "👤",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    phone: "",
    houseNo: "Blok F6 No. 01",
    kkNo: "3201012300010031"
  },
  {
    id: "user-1790435683163",
    username: "yani",
    password: "123",
    name: "Yani",
    role: "admin",
    jabatan: "Pengurus RT",
    icon: "👑",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    phone: "",
    houseNo: "Blok F6 No. 02",
    kkNo: "3201012300010032"
  },
  {
    id: "user-1790439460209",
    username: "adoy",
    password: "123",
    name: "Adoy",
    role: "anggota",
    jabatan: "Warga Biasa",
    icon: "👤",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    phone: "",
    houseNo: "Blok F4 No. 21",
    kkNo: "3201012300010033"
  },
  {
    id: "user-1790439500480",
    username: "fatma",
    password: "123",
    name: "Fatma",
    role: "anggota",
    jabatan: "Warga Biasa",
    icon: "👤",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    phone: "",
    houseNo: "Blok F6 No. 08",
    kkNo: "3201012300010034"
  },
  {
    id: "user-1790606275834",
    name: "Edi",
    username: "edi",
    password: "123",
    role: "anggota",
    jabatan: "Warga Biasa",
    icon: "👤",
    houseNo: "Blok F6 No. 07",
    kkNo: "-",
    phone: "",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
  }
];

export const INITIAL_FAMILIES = [
  {
    id: "kk-1",
    kkNumber: "3201012300010001",
    headOfFamily: "Suryadi S",
    houseNumber: "No. 01",
    address: "Gang Cinta, Perumahan Bumi Nagara Lestari RT 028 RW 005, Blok F4 No. 01",
    houseStatus: "Milik Sendiri",
    phone: "0812-3456-7890",
    emergencyContact: "0812-9988-7766 (Putra Tertua - Dimas)",
    assignedUserId: "user-admin-1",
    isProfileCompleted: true,
    members: [
      {
        id: "mem-1",
        fullName: "Suryadi S",
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
    headOfFamily: "Nogi",
    houseNumber: "No. 02",
    address: "Gang Cinta, Perumahan Bumi Nagara Lestari RT 028 RW 005, Blok F4 No. 02",
    houseStatus: "Milik Sendiri",
    phone: "0813-8899-7711",
    emergencyContact: "0813-1122-3344",
    assignedUserId: "user-bendahara-1",
    isProfileCompleted: true,
    members: [
      {
        id: "mem-4",
        fullName: "Nogi",
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
    headOfFamily: "Budi",
    houseNumber: "No. 04",
    address: "Gang Cinta, Perumahan Bumi Nagara Lestari RT 028 RW 005, Blok F4 No. 04",
    houseStatus: "Milik Sendiri",
    phone: "0852-1122-3344",
    emergencyContact: "0852-4455-6677",
    assignedUserId: "user-warga-1",
    isProfileCompleted: true,
    members: [
      {
        id: "mem-6",
        fullName: "Budi",
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
    headOfFamily: "Dedi",
    houseNumber: "No. 07",
    address: "Gang Cinta, Perumahan Bumi Nagara Lestari RT 028 RW 005, Blok F4 No. 07",
    houseStatus: "Kontrak",
    phone: "0857-9988-1234",
    emergencyContact: "0857-8877-6655",
    assignedUserId: "user-warga-2",
    isProfileCompleted: true,
    members: [
      {
        id: "mem-9",
        fullName: "Dedi",
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
    headOfFamily: "Febri",
    houseNumber: "No. 12",
    address: "Gang Cinta, Perumahan Bumi Nagara Lestari RT 028 RW 005, Blok F4 No. 12",
    houseStatus: "Milik Sendiri",
    phone: "0821-4433-2211",
    emergencyContact: "0821-9988-1122",
    assignedUserId: "user-warga-3",
    isProfileCompleted: true,
    members: [
      {
        id: "mem-11",
        fullName: "Febri",
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
  },
  {
    id: "kk-rusli-1",
    kkNumber: "3201012300010031",
    headOfFamily: "Rusli",
    block: "Blok F6",
    houseNumber: "No. 01",
    address: "Gang Cinta, Perumahan Bumi Nagara Lestari RT 028 RW 005, Blok F6 No. 01",
    houseStatus: "Milik Sendiri",
    phone: "",
    emergencyContact: "",
    assignedUserId: "user-1790433466331",
    isProfileCompleted: true,
    members: [
      {
        id: "mem-rusli-1",
        fullName: "Rusli",
        nik: "3201011504800031",
        relation: "Kepala Keluarga",
        gender: "Laki-laki",
        birthPlace: "Bandung",
        birthDate: "1980-04-15",
        job: "Wiraswasta",
        religion: "Islam",
        bloodType: "B"
      }
    ]
  },
  {
    id: "kk-yani-1",
    kkNumber: "3201012300010032",
    headOfFamily: "Yani",
    block: "Blok F6",
    houseNumber: "No. 02",
    address: "Gang Cinta, Perumahan Bumi Nagara Lestari RT 028 RW 005, Blok F6 No. 02",
    houseStatus: "Milik Sendiri",
    phone: "",
    emergencyContact: "",
    assignedUserId: "user-1790435683163",
    isProfileCompleted: true,
    members: [
      {
        id: "mem-yani-1",
        fullName: "Yani",
        nik: "3201011504820032",
        relation: "Kepala Keluarga",
        gender: "Laki-laki",
        birthPlace: "Cirebon",
        birthDate: "1982-06-20",
        job: "Karyawan Swasta",
        religion: "Islam",
        bloodType: "O"
      }
    ]
  },
  {
    id: "kk-adoy-1",
    kkNumber: "3201012300010033",
    headOfFamily: "Adoy",
    block: "Blok F4",
    houseNumber: "No. 21",
    address: "Gang Cinta, Perumahan Bumi Nagara Lestari RT 028 RW 005, Blok F4 No. 21",
    houseStatus: "Milik Sendiri",
    phone: "",
    emergencyContact: "",
    assignedUserId: "user-1790439460209",
    isProfileCompleted: true,
    members: [
      {
        id: "mem-adoy-1",
        fullName: "Adoy",
        nik: "3201011504850033",
        relation: "Kepala Keluarga",
        gender: "Laki-laki",
        birthPlace: "Bandung",
        birthDate: "1985-08-10",
        job: "Karyawan Swasta",
        religion: "Islam",
        bloodType: "A"
      }
    ]
  },
  {
    id: "kk-fatma-1",
    kkNumber: "3201012300010034",
    headOfFamily: "Fatma",
    block: "Blok F6",
    houseNumber: "No. 08",
    address: "Gang Cinta, Perumahan Bumi Nagara Lestari RT 028 RW 005, Blok F6 No. 08",
    houseStatus: "Milik Sendiri",
    phone: "",
    emergencyContact: "",
    assignedUserId: "user-1790439500480",
    isProfileCompleted: true,
    members: [
      {
        id: "mem-fatma-1",
        fullName: "Fatma",
        nik: "3201015504880034",
        relation: "Kepala Keluarga",
        gender: "Perempuan",
        birthPlace: "Bogor",
        birthDate: "1988-03-14",
        job: "Ibu Rumah Tangga",
        religion: "Islam",
        bloodType: "AB"
      }
    ]
  },
  {
    id: "kk-udin-1",
    kkNumber: "3201012300010030",
    headOfFamily: "Udin",
    block: "Blok F6",
    houseNumber: "No. 08",
    address: "Gang Cinta, Perumahan Bumi Nagara Lestari RT 028 RW 005, Blok F6 No. 08",
    houseStatus: "Milik Sendiri",
    phone: "",
    emergencyContact: "",
    assignedUserId: "user-1790431976879",
    isProfileCompleted: true,
    members: [
      {
        id: "mem-udin-1",
        fullName: "Udin",
        nik: "3201011504780030",
        relation: "Kepala Keluarga",
        gender: "Laki-laki",
        birthPlace: "Bandung",
        birthDate: "1978-05-12",
        job: "Wiraswasta",
        religion: "Islam",
        bloodType: "O"
      }
    ]
  },
  {
    id: "kk-1790606276131",
    kkNumber: "-",
    headOfFamily: "Edi",
    block: "Blok F6",
    houseNumber: "No. 07",
    address: "Gang Cinta RT 028 / RW 005, Perumahan Bumi Nagara Lestari, Blok F6 No. 07",
    houseStatus: "Milik Sendiri",
    phone: "",
    emergencyContact: "",
    assignedUserId: "user-1790606275834",
    isProfileCompleted: false,
    members: [
      {
        id: "mem-1790606276131",
        fullName: "Edi",
        nik: "",
        relation: "Kepala Keluarga",
        gender: "Laki-laki",
        birthPlace: "",
        birthDate: "",
        job: "",
        religion: "Islam",
        bloodType: "-"
      }
    ]
  }
];

export const FINANCIAL_CATEGORIES = [
  {
    id: "sampah",
    name: "Iuran Sampah",
    description: "Pengelolaan kebersihan lingkungan, honor petugas roda tiga & TPS",
    color: "emerald",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-300",
    icon: "Trash2"
  },
  {
    id: "keamanan",
    name: "Iuran Keamanan",
    description: "Operasional pos ronda siskamling, perawatan portal & lampu keamanan",
    color: "indigo",
    badgeBg: "theme-bg-light theme-text-primary-dark theme-border-light",
    icon: "ShieldCheck"
  },
  {
    id: "kas",
    name: "Kas Gang",
    description: "Pemeliharaan fasilitas umum jalan paving, cat gapura, dan administrasi RT",
    color: "blue",
    badgeBg: "theme-bg-light theme-text-primary-dark theme-border-light",
    icon: "Home"
  },
  {
    id: "sosial",
    name: "Dana Sosial",
    description: "Santunan duka cita, bantuan jenguk warga sakit, dan bantuan sosial darurat",
    color: "amber",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-300",
    icon: "HeartHandshake"
  },
  {
    id: "olahraga",
    name: "Dana Olahraga",
    description: "Pengadaan alat tenis meja, net bulutangkis, bola voli & kegiatan pemuda",
    color: "rose",
    badgeBg: "bg-rose-100 text-rose-800 border-rose-300",
    icon: "Trophy"
  }
];

// Starting balances broken down per category for 100% transparency
export const INITIAL_MONTHLY_BALANCES = {
  "2026-09": {
    monthName: "September 2026",
    categories: {
      sampah: 0,
      keamanan: 0,
      kas: 0,
      sosial: 0,
      olahraga: 0
    }
  },
  "2026-08": {
    monthName: "Agustus 2026",
    categories: {
      sampah: 0,
      keamanan: 0,
      kas: 0,
      sosial: 0,
      olahraga: 0
    }
  }
};

export const INITIAL_TRANSACTIONS = [
  {
    id: "trx-01",
    date: "2026-09-05",
    category: "kas",
    type: "income",
    amount: 55000,
    title: "Penerimaan Iuran Bulanan - Suryadi S (No. 01)",
    description: "Iuran rutin kas warga Gang Cinta RT 028 RW 005",
    familyId: "kk-1",
    receiptUrl: "",
    recordedBy: "Nogi (Bendahara Kas)"
  }
];

export const INITIAL_MOMENTS = [
  {
    id: "moment-1",
    title: "Kerja Bakti Akbar: Bersih Saluran Drainase & Pengecatan Gang",
    category: "Kerja Bakti",
    eventDate: "2026-09-06",
    description: "Warga Gang Cinta RT 028 RW 005 (Perumahan Bumi Nagara Lestari) bergotong royong membersihkan saluran selokan menyambut musim hujan dan mempercantik pot tanaman sepanjang gang. Suasana sangat kompak!",
    imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80",
    location: "Sepanjang Lorong Gang Cinta RT 028 RW 005",
    uploadedBy: "Suryadi S (Ketua Gang)",
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
    uploadedBy: "Suryadi S (Ketua Gang)",
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
    uploadedBy: "Suryadi S (Ketua Gang)",
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
    uploadedBy: "Suryadi S (Ketua Gang)",
    createdAt: "2026-09-11T21:00:00Z",
    likes: 29
  }
];

export const INITIAL_GUEST_REPORTS = [
  {
    id: "guest-1",
    reporterUserId: "user-warga-1",
    reporterName: "Budi",
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
    reporterName: "Dedi",
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
];

// Initial Chat messages for community chat
export const INITIAL_CHAT_MESSAGES = [];
