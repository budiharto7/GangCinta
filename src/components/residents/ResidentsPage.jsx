import React, { useState, useEffect } from "react";
import { familyService } from "../../services/storageService";
import { api } from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";
import { usePolling } from "../../hooks/usePolling";
import { 
  Users, 
  Home, 
  UserPlus, 
  Search, 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  Trash2, 
  Lock,
  ShieldCheck,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import RegisterKKModal from "./RegisterKKModal";
import EditMyKKModal from "./EditMyKKModal";
import GangCintaLogo from "../common/GangCintaLogo";

export default function ResidentsPage({ isRegisterOpen, setIsRegisterOpen }) {
  const { user, allUsers, refreshUsers, showToast } = useAuth();
  const [families, setFamilies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [expandedKkId, setExpandedKkId] = useState(null);
  const [editModalFamily, setEditModalFamily] = useState(null);
  const [sortBy, setSortBy] = useState("houseAsc"); // houseAsc | nameAsc | nameDesc | houseDesc
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const adminUser = (allUsers || []).find(u => u.role === "admin");
  const adminName = adminUser ? adminUser.name : "Ketua Gang";

  const refreshFamilies = async () => {
    try {
      const apiFams = await api.getFamilies();
      if (Array.isArray(apiFams) && apiFams.length > 0) {
        setFamilies(apiFams);
        return;
      }
    } catch {}
    setFamilies(familyService.getFamilies());
  };

  useEffect(() => {
    refreshFamilies();
  }, []);

  useEffect(() => {
    refreshFamilies();
    const handleDataChange = () => {
      refreshFamilies();
    };

    window.addEventListener("families-data-changed", handleDataChange);
    window.addEventListener("storage", handleDataChange);
    window.addEventListener("focus", handleDataChange);

    return () => {
      window.removeEventListener("families-data-changed", handleDataChange);
      window.removeEventListener("storage", handleHeaderChange => {});
      window.removeEventListener("focus", handleDataChange);
    };
  }, []);

  // Auto-polling: data warga otomatis update setiap 8 detik di semua HP
  usePolling(refreshFamilies, 8000);

  // Find user's own family
  const myFamily = user ? (families.find(f => f.assignedUserId === user.id) || null) : null;

  const parseHouseNum = (houseStr) => {
    if (!houseStr) return 0;
    const num = houseStr.replace(/\D/g, "");
    return parseInt(num, 10) || 0;
  };

  const getCleanHouseNumber = (houseNumStr, addressStr = "") => {
    if (!houseNumStr && !addressStr) return "01";
    const str = `${houseNumStr} ${addressStr}`;
    const match = str.match(/\d+/);
    return match ? match[0].padStart(2, "0") : houseNumStr || "01";
  };

  const formatCleanHouseLocation = (houseNumStr, addressStr = "", customBlock = "") => {
    const num = getCleanHouseNumber(houseNumStr, addressStr);
    const blk = (customBlock || "").trim() || "Blok F4";
    const cleanBlk = blk.toLowerCase().startsWith("blok") ? blk : `Blok ${blk}`;
    return `${cleanBlk} No. ${num}`;
  };

  const normalizeBlock = (f) => {
    const str = `${f.block || ""} ${f.address || ""}`.toLowerCase();
    if (str.includes("f6")) return "Blok F6";
    return "Blok F4";
  };

  const filteredFamilies = families.filter((f) => {
    let matchesStatus = true;
    if (statusFilter === "Blok F4") {
      const blk = (f.block || f.address || "Blok F4").toLowerCase();
      matchesStatus = blk.includes("f4") || (!blk.includes("f6"));
    } else if (statusFilter === "Blok F6") {
      const blk = (f.block || f.address || "").toLowerCase();
      matchesStatus = blk.includes("f6");
    } else if (statusFilter !== "Semua") {
      matchesStatus = f.houseStatus === statusFilter;
    }

    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (f.headOfFamily || "").toLowerCase().includes(q) ||
      (f.houseNumber || "").toLowerCase().includes(q) ||
      (f.block && f.block.toLowerCase().includes(q)) ||
      (user?.role === "admin" && (f.kkNumber || "").includes(q)) ||
      (user?.role === "admin" && (f.members || []).some(m => (m?.fullName || "").toLowerCase().includes(q)));
    return matchesStatus && matchesSearch;
  });

  // Sort families by selected sorting criteria
  const sortedFamilies = [...filteredFamilies].sort((a, b) => {
    if (sortBy === "houseAsc" || sortBy === "houseDesc") {
      const blockA = normalizeBlock(a);
      const blockB = normalizeBlock(b);
      if (blockA !== blockB) {
        const cmp = blockA.localeCompare(blockB);
        return sortBy === "houseAsc" ? cmp : -cmp;
      }
      const numA = parseHouseNum(a.houseNumber);
      const numB = parseHouseNum(b.houseNumber);
      return sortBy === "houseAsc" ? numA - numB : numB - numA;
    } else if (sortBy === "nameAsc") {
      return a.headOfFamily.localeCompare(b.headOfFamily, "id", { sensitivity: "base" });
    } else if (sortBy === "nameDesc") {
      return b.headOfFamily.localeCompare(a.headOfFamily, "id", { sensitivity: "base" });
    }
    return 0;
  });

  const totalItems = sortedFamilies.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const paginatedFamilies = sortedFamilies.slice(startIndex, startIndex + itemsPerPage);

  const handleDeleteKK = (familyId, headName, e) => {
    e.stopPropagation();
    if (window.confirm(`Hapus data Kartu Keluarga atas nama ${headName}? Seluruh data anggota, akun pengguna, pesan obrolan, dan catatan iuran yang bersangkutan akan dibersihkan tuntas.`)) {
      familyService.deleteFamily(familyId);
      api.deleteFamily(familyId).catch(() => {});
      refreshFamilies();
      if (refreshUsers) refreshUsers();
      showToast(`Data KK ${headName} dan seluruh data terkait telah dihapus tuntas.`, "info");
    }
  };

  const handleDeleteMember = (familyId, member, e) => {
    e.stopPropagation();
    if (!member) return;
    const memberName = member.fullName || "Anggota ini";
    if (window.confirm(`Hapus data anggota "${memberName}" beserta seluruh data yang bersangkutan? Seluruh akun pengguna, pesan obrolan, dan data terkait akan dibersihkan tuntas tanpa sisa.`)) {
      familyService.deleteMember(familyId, member.id, member.fullName);
      api.deleteMember(familyId, member.id, member.fullName).catch(() => {});
      refreshFamilies();
      if (refreshUsers) refreshUsers();
      showToast(`Data anggota ${memberName} dan seluruh data terkait telah dibersihkan tuntas.`, "success");
    }
  };

  const toggleExpand = (id) => {
    setExpandedKkId(expandedKkId === id ? null : id);
  };

  return (
    <div className="space-y-6 pb-24 sm:pb-12">
      
      {/* Header Banner - Menyesuaikan Otomatis dengan Tema Warna */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl theme-gradient-banner text-white p-4 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-6 -bottom-6 opacity-20 pointer-events-none z-0 hidden sm:block">
          <GangCintaLogo size="xl" variant="plain" />
        </div>

        <div className="relative z-10 space-y-3.5 max-w-3xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <GangCintaLogo size="sm" variant="badge" />
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-2xs">
              <Users className="w-3.5 h-3.5 text-amber-300" />
              Data Warga Gang Cinta
            </div>
            <span className="text-xs px-3.5 py-1.5 rounded-full bg-white/15 font-extrabold text-white border border-white/20 backdrop-blur-md shadow-2xs">
              RT 028 RW 005
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-xs">
            Data Warga Blok F4 & F6 Gang Cinta
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed opacity-95">
            Lingkungan Gang Cinta terdiri dari <strong>Blok F4</strong> dan <strong>Blok F6</strong>. Sesuai aturan, rincian susunan anggota keluarga & NIK <strong>hanya dapat dilihat oleh Ketua Gang ({adminName})</strong>. Selain Ketua Gang hanya dapat melihat Nama Kepala Rumah Tangga & No. Rumah.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2 sm:gap-2.5">
          {user?.role === "admin" && (
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full font-extrabold text-[11px] sm:text-xs bg-white text-slate-900 shadow-lg hover:bg-slate-100 transition transform active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
              Daftarkan KK Baru
            </button>
          )}

          {user?.role === "anggota" && myFamily && (
            <button
              onClick={() => setEditModalFamily(myFamily)}
              className="flex items-center gap-1.5 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full font-extrabold text-[11px] sm:text-xs bg-white text-slate-900 shadow-lg hover:bg-slate-100 transition transform active:scale-95 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
              Lengkapi / Edit KK Saya
            </button>
          )}

          <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs bg-white/10 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/20">
            <div className="flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-amber-300" />
              <span className="font-extrabold text-white">{families.length} KK</span>
            </div>
            <span className="w-px h-3.5 bg-white/20"></span>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-300" />
              <span className="font-extrabold text-white">{familyService.getTotalJiwa()} Jiwa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Citizen Personal KK Banner if role is Anggota */}
      {user?.role === "anggota" && myFamily && (
        <div className="relative overflow-hidden rounded-3xl theme-gradient-banner text-white p-6 shadow-xl transition-all border border-white/20">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-md flex-shrink-0 bg-white/20 backdrop-blur-md border border-white/30 text-amber-300">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-base text-white">
                    Kartu Keluarga Anda: {myFamily.headOfFamily}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-extrabold bg-white/20 text-white border border-white/30 backdrop-blur-md">
                    {formatCleanHouseLocation(myFamily.houseNumber, myFamily.address, myFamily.block)}
                  </span>
                </div>
                <p className="text-xs mt-1 text-white/90">
                  Nomor KK: <span className="font-mono font-bold text-amber-300">{myFamily.kkNumber}</span> • {(myFamily?.members || []).length} Anggota Keluarga Terdaftar
                </p>
                <div className="flex items-center gap-1.5 text-[11px] font-medium mt-1 text-white/80">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
                  <span>Privat: Hanya akun Anda ({user.name}) dan Ketua Gang yang dapat melihat & mengedit data keluarga ini secara lengkap.</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditModalFamily(myFamily)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-extrabold text-white bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 transition shadow-sm self-start sm:self-auto active:scale-95 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                <span>Perbarui Data Keluarga</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search, Filter & Sort Controls */}
      <div className="relative overflow-hidden flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-2xl theme-gradient-banner text-white shadow-lg border border-white/20 transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        
        {/* Status Filter Pills */}
        <div className="relative z-10 flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {["Semua", "Blok F4", "Blok F6", "Milik Sendiri", "Kontrak"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition backdrop-blur-md ${
                statusFilter === status
                  ? "bg-amber-300 text-slate-900 shadow-md border border-amber-200"
                  : "bg-white/15 text-white border border-white/20 hover:bg-white/25"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Sort Dropdown & Search Input */}
        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          
          {/* Sort Selector */}
          <div className="relative flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-xs font-bold text-white transition">
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none text-xs font-extrabold text-white focus:outline-none cursor-pointer pr-1 [&>option]:bg-slate-900 [&>option]:text-white"
            >
              <option value="houseAsc">🔢 Urut No. Rumah (01 → 99)</option>
              <option value="nameAsc">🔤 Urut Nama Warga (A → Z)</option>
              <option value="nameDesc">🔤 Urut Nama Warga (Z → A)</option>
              <option value="houseDesc">🔢 Urut No. Rumah (99 → 01)</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-white/80 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, no rumah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-white/30 text-xs text-white placeholder-white/70 bg-white/20 backdrop-blur-md focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 focus:ring-2 focus:ring-amber-300 focus:outline-none transition shadow-inner"
            />
          </div>

        </div>
      </div>

      {/* Families List Accordion */}
      <div className="space-y-4">
        {paginatedFamilies.length === 0 ? (
          <div className="relative overflow-hidden text-center py-16 theme-gradient-banner text-white rounded-3xl border border-white/20 p-8 space-y-3 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto text-amber-300">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-base font-extrabold text-white">Data Rumah Tidak Ditemukan</h3>
            <p className="text-xs text-white/80 max-w-sm mx-auto">
              Tidak ada data kepala rumah tangga atau nomor rumah yang cocok dengan kriteria pencarian/filter.
            </p>
          </div>
        ) : (
          paginatedFamilies.map((fam) => {
            const isExpanded = expandedKkId === fam.id;
            const isMyOwn = user ? fam.assignedUserId === user.id : false;
            const canViewFullKK = user?.role === "admin" || isMyOwn;
            const canEdit = user?.role === "admin" || isMyOwn;

            return (
              <div
                key={fam.id}
                className={`group relative overflow-hidden rounded-3xl theme-gradient-banner text-white shadow-md hover:shadow-2xl transition-all duration-300 border ${
                  isMyOwn ? "border-amber-300 ring-2 ring-amber-300/60" : "border-white/20"
                }`}
              >
                {/* Accordion Header */}
                <div
                  onClick={() => toggleExpand(fam.id)}
                  className="p-3.5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 cursor-pointer hover:bg-white/10 transition select-none bg-white/5"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-sm sm:text-base shadow-md flex-shrink-0 bg-white/20 backdrop-blur-md border border-white/30 text-amber-300">
                      {getCleanHouseNumber(fam.houseNumber, fam.address)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/70">Kepala Rumah Tangga:</span>
                        <h3 className="font-extrabold text-base text-white group-hover:text-amber-300 transition">
                          {fam.headOfFamily}
                        </h3>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30 backdrop-blur-md">
                          {formatCleanHouseLocation(fam.houseNumber, fam.address, fam.block)}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/15 text-white/90 border border-white/20">
                          {fam.houseStatus}
                        </span>
                        {isMyOwn && (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-300 text-slate-900 border border-amber-200 shadow-sm">
                            ✓ Rumah Anda (Akses Lengkap)
                          </span>
                        )}
                        {!canViewFullKK && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/15 text-white/80 border border-white/20 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-amber-300" />
                            Data Privat (Khusus Ketua Gang)
                          </span>
                        )}
                      </div>

                      <p className="text-xs mt-1 text-white/80">
                        Lokasi: <strong className="text-white">{formatCleanHouseLocation(fam.houseNumber, fam.address, fam.block)}</strong> • Gang Cinta RT 028 RW 005
                        {canViewFullKK && (
                          <>
                            {" • "}
                            No. KK: <span className="font-mono font-semibold text-amber-300">{fam.kkNumber}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto" onClick={(e) => e.stopPropagation()}>
                    {canEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditModalFamily(fam);
                        }}
                        className="p-2 rounded-xl border border-white/30 bg-white/20 hover:bg-white/30 text-white transition backdrop-blur-md cursor-pointer"
                        title="Edit Data Kartu Keluarga"
                      >
                        <Edit3 className="w-4 h-4 text-amber-300" />
                      </button>
                    )}

                    {user?.role === "admin" && (
                      <button
                        onClick={(e) => handleDeleteKK(fam.id, fam.headOfFamily, e)}
                        className="p-2 rounded-xl bg-rose-500/30 text-rose-200 border border-rose-400/30 hover:bg-rose-500/40 transition cursor-pointer"
                        title="Hapus Data KK"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <div onClick={() => toggleExpand(fam.id)} className="p-2 rounded-xl cursor-pointer text-white/80 hover:text-white">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-amber-300" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Section */}
                {isExpanded && (
                  <div className="p-6 bg-white/10 backdrop-blur-md border-t border-white/20 space-y-4 animate-fade-in text-white">
                    
                    {/* IF NOT KETUA GANG & NOT OWNER: SHOW LOCKED NOTICE AND DO NOT SHOW MEMBERS TABLE */}
                    {!canViewFullKK ? (
                      <div className="p-5 rounded-2xl bg-amber-500/20 backdrop-blur-md border border-amber-300/30 text-white text-xs flex items-center gap-3 shadow-sm">
                        <Lock className="w-5 h-5 text-amber-300 flex-shrink-0" />
                        <div>
                          <p className="font-extrabold text-sm text-white">
                            Akses Rincian KK Dilindungi Privasi
                          </p>
                          <p className="mt-0.5 text-white/90 leading-relaxed">
                            Tabel rincian susunan anggota keluarga, NIK, dan tanggal lahir <strong>hanya dapat dilihat oleh Ketua Gang ({adminName})</strong> dan pemilik KK. Selain Ketua Gang hanya dapat melihat Nama Kepala Rumah Tangga (<strong>{fam.headOfFamily}</strong>) dan Nomor Rumah (<strong>{formatCleanHouseLocation(fam.houseNumber, fam.address, fam.block)}</strong>).
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* ONLY KETUA GANG & OWNER CAN SEE THIS TABLE (SUSUNAN ANGGOTA KELUARGA) */
                      <>
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-extrabold uppercase text-white/90 tracking-wider">
                            SUSUNAN ANGGOTA KELUARGA (KK: {fam.kkNumber})
                          </h4>
                          
                          {canEdit && (
                            <button
                              onClick={() => setEditModalFamily(fam)}
                              className="text-xs font-bold text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl border border-white/30 backdrop-blur-md shadow-2xs cursor-pointer"
                            >
                              + Tambah / Edit Data Anggota
                            </button>
                          )}
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-white/20 bg-black/20 backdrop-blur-md shadow-inner">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-white/20 text-white font-extrabold border-b border-white/20">
                              <tr>
                                <th className="p-3">Nama Lengkap</th>
                                <th className="p-3">NIK</th>
                                <th className="p-3">Hubungan</th>
                                <th className="p-3">Jenis Kelamin</th>
                                <th className="p-3">Tempat, Tgl Lahir</th>
                                <th className="p-3">Pekerjaan</th>
                                <th className="p-3">Gol. Darah</th>
                                {canEdit && <th className="p-3 text-center">Aksi</th>}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                              {(fam.members || []).map((m, idx) => (
                                <tr key={m?.id || idx} className="hover:bg-white/15 transition text-white">
                                  <td className="p-3 font-extrabold text-white">{m?.fullName || "-"}</td>
                                  <td className="p-3 font-mono text-white/80 text-[11px]">{m?.nik || "-"}</td>
                                  <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                      m?.relation === "Kepala Keluarga"
                                        ? "bg-emerald-500/30 text-emerald-200 border-emerald-300/40"
                                        : "bg-white/20 text-white border-white/30"
                                    }`}>
                                      {m?.relation || "-"}
                                    </span>
                                  </td>
                                  <td className="p-3 text-white/90">{m?.gender || "-"}</td>
                                  <td className="p-3 text-white/90">
                                    {m?.birthPlace ? `${m.birthPlace}, ` : ""}
                                    {m?.birthDate || "-"}
                                  </td>
                                  <td className="p-3 text-white/90">{m?.job || "-"}</td>
                                  <td className="p-3 text-amber-300 font-extrabold">{m?.bloodType || "-"}</td>
                                  {canEdit && (
                                    <td className="p-3 text-center">
                                      <button
                                        type="button"
                                        onClick={(e) => handleDeleteMember(fam.id, m, e)}
                                        className="p-1.5 rounded-lg bg-rose-500/30 hover:bg-rose-500/50 text-rose-200 border border-rose-400/40 transition active:scale-95 cursor-pointer inline-flex items-center justify-center"
                                        title={`Hapus data anggota ${m?.fullName || ''} & bersihkan seluruh data terkait`}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {fam.emergencyContact && (
                          <p className="text-[11px] text-white/80">
                            📞 Kontak Darurat: <span className="font-semibold text-white">{fam.emergencyContact}</span>
                          </p>
                        )}
                      </>
                    )}

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {sortedFamilies.length > 0 && (
        <div className="relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl theme-gradient-banner text-white shadow-lg border border-white/20 text-xs transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          {/* Info & Items Per Page */}
          <div className="relative z-10 flex flex-wrap items-center gap-2">
            <span>
              Menampilkan <strong>{startIndex + 1}</strong> - <strong>{Math.min(startIndex + itemsPerPage, totalItems)}</strong> dari <strong>{totalItems}</strong> Rumah
            </span>
            <span className="text-white/40 hidden sm:inline">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-white/80">Tampilkan:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-white/20 border border-white/30 rounded-lg px-2 py-1 text-xs font-bold text-white focus:outline-none cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white"
              >
                <option value={5}>5 / hal</option>
                <option value={10}>10 / hal</option>
                <option value={20}>20 / hal</option>
                <option value={999}>Semua</option>
              </select>
            </div>
          </div>

          {/* Page Buttons */}
          {totalPages > 1 && (
            <div className="relative z-10 flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={validCurrentPage === 1}
                className="p-1.5 rounded-xl border border-white/20 bg-white/15 hover:bg-white/25 disabled:opacity-40 disabled:cursor-not-allowed transition text-white"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-extrabold transition backdrop-blur-md ${
                    validCurrentPage === pageNum
                      ? "bg-amber-300 text-slate-900 shadow-md border border-amber-200"
                      : "bg-white/15 text-white border border-white/20 hover:bg-white/25"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={validCurrentPage === totalPages}
                className="p-1.5 rounded-xl border border-white/20 bg-white/15 hover:bg-white/25 disabled:opacity-40 disabled:cursor-not-allowed transition text-white"
                title="Halaman Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      )}

      {/* Modals */}
      <RegisterKKModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onKKRegistered={refreshFamilies}
      />

      <EditMyKKModal
        isOpen={!!editModalFamily}
        family={editModalFamily}
        onClose={() => setEditModalFamily(null)}
        onFamilyUpdated={refreshFamilies}
      />

    </div>
  );
}

