import React, { useState, useEffect } from "react";
import { usePolling } from "../../hooks/usePolling";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { 
  familyService, 
  financeService, 
  momentService, 
  guestReportService,
  welcomeService 
} from "../../services/storageService";
import { api } from "../../services/apiService";
import { 
  Users, 
  Home, 
  Wallet, 
  Camera, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldCheck, 
  Trash2, 
  HeartHandshake, 
  Trophy, 
  Calendar as CalendarIcon, 
  UserPlus, 
  PlusCircle, 
  Sparkles, 
  ChevronRight,
  Radio,
  FileSpreadsheet,
  LogIn,
  Lock,
  Edit2,
  Check,
  X,
  Bold,
  Italic,
  Underline,
  Type,
  Baseline
} from "lucide-react";
import OnlineResidents from "./OnlineResidents";
import { MessageSquare } from "lucide-react";
import GangCintaLogo from "../common/GangCintaLogo";
import RichTextEditor from "../common/RichTextEditor";

import { formatRupiah, formatRupiahParts } from "../../utils/numberUtils";

export default function Dashboard({ 
  setActiveTab, 
  onOpenUploadMoment, 
  onOpenNewTransaction, 
  onOpenRegisterKK,
  onOpenChat 
}) {
  const { user, allUsers, requireAuth, showToast } = useAuth();
  const { currentTheme } = useTheme();
  
  const currentMonthKey = "2026-09";
  const [families, setFamilies] = useState([]);
  const [summary, setSummary] = useState(null);
  const [moments, setMoments] = useState([]);
  const [guestReports, setGuestReports] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);

  // Editable Admin Welcome Description & Rich Text State
  const [adminWelcomeConfig, setAdminWelcomeConfig] = useState({ text: "" });
  const [isEditingWelcome, setIsEditingWelcome] = useState(false);
  const [tempWelcomeText, setTempWelcomeText] = useState("");

  const isKetuaGang = !!(
    user && (
      user.username === "admin" ||
      (user.name || "").toLowerCase().trim() === "suryadi s" ||
      (user.jabatan || "").toLowerCase().trim() === "ketua gang"
    )
  );

  const loadAllData = () => {
    // Always use financeService & familyService to guarantee 100% real-time sync with actual data
    setSummary(financeService.getMonthlySummary(currentMonthKey));
    setFamilies(familyService.getFamilies());

    api.getMoments()
      .then(m => setMoments(m))
      .catch(() => setMoments(momentService.getMoments()));

    api.getChatMessages()
      .then(c => setChatMessages(c))
      .catch(() => setChatMessages(chatService.getMessages()));

    if (user) {
      api.getGuestReports(user)
        .then(g => setGuestReports(g))
        .catch(() => setGuestReports(guestReportService.getGuestReports(user)));
    } else {
      setGuestReports([]);
    }
  };

  useEffect(() => {
    loadAllData();
    setAdminWelcomeConfig(welcomeService.getAdminWelcomeConfig());

    const handleDataChange = () => {
      setSummary(financeService.getMonthlySummary(currentMonthKey));
      setFamilies(familyService.getFamilies());
      setAdminWelcomeConfig(welcomeService.getAdminWelcomeConfig());
    };

    window.addEventListener("finance-data-changed", handleDataChange);
    window.addEventListener("families-data-changed", handleDataChange);
    window.addEventListener("admin-welcome-changed", handleDataChange);
    window.addEventListener("storage", handleDataChange);
    window.addEventListener("focus", handleDataChange);

    return () => {
      window.removeEventListener("finance-data-changed", handleDataChange);
      window.removeEventListener("families-data-changed", handleDataChange);
      window.removeEventListener("admin-welcome-changed", handleDataChange);
      window.removeEventListener("storage", handleDataChange);
      window.removeEventListener("focus", handleDataChange);
    };
  }, [user, currentMonthKey]);

  // Auto-polling: semua data dashboard update otomatis setiap 10 detik
  usePolling(loadAllData, 10000);

  if (!summary) return null;

  const totalCitizens = familyService.getTotalJiwa();

  const categories = financeService.getCategories();

  const getReporterName = (report) => {
    if (!report) return "";
    const userObj = (allUsers || []).find(u => u.id === report.reporterUserId);
    if (userObj?.name) return userObj.name;

    const normHouse = (report.houseNumber || "").replace(/[^0-9]/g, "");
    if (normHouse) {
      const userByHouse = (allUsers || []).find(u => (u.houseNo || "").replace(/[^0-9]/g, "") === normHouse);
      if (userByHouse?.name) return userByHouse.name;
      const famByHouse = (families || []).find(f => (f.houseNumber || "").replace(/[^0-9]/g, "") === normHouse);
      if (famByHouse?.headOfFamily) return famByHouse.headOfFamily;
    }
    return report.reporterName || "Warga Gang Cinta";
  };

  const getSenderName = (m) => {
    if (!m) return "";
    const userObj = (allUsers || []).find(u => u.id === m.senderId);
    if (userObj?.name) return userObj.name;
    return m.senderName || "Warga Gang Cinta";
  };

  const getSenderAvatar = (m) => {
    if (!m) return "";
    const userObj = (allUsers || []).find(u => u.id === m.senderId);
    if (userObj?.avatar) return userObj.avatar;
    return m.senderAvatar;
  };

  const getCategoryIcon = (catId) => {
    switch (catId) {
      case "sampah": return <Trash2 className="w-4 h-4 text-emerald-600" />;
      case "keamanan": return <ShieldCheck className="w-4 h-4 text-indigo-600" />;
      case "kas": return <Home className="w-4 h-4 text-blue-600" />;
      case "sosial": return <HeartHandshake className="w-4 h-4 text-amber-600" />;
      case "olahraga": return <Trophy className="w-4 h-4 text-rose-600" />;
      default: return <Wallet className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="relative space-y-6 pb-12 min-h-[80vh]">
      
      {/* Large Translucent Watermark Logo in the Middle of Dashboard */}
      <GangCintaLogo variant="watermark" size="watermark" />

      {/* Welcome & Role Banner */}
      <div className="relative overflow-hidden rounded-3xl theme-gradient-banner text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-6 -bottom-6 opacity-20 pointer-events-none z-0 hidden sm:block">
          <GangCintaLogo size="xl" variant="plain" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <GangCintaLogo size="sm" variant="badge" />
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Gang Cinta • Perumahan Bumi Nagara Lestari
              </div>
              <span className="text-xs px-3.5 py-1.5 rounded-full bg-white/15 font-extrabold text-white border border-white/20 backdrop-blur-md shadow-2xs">
                RT 028 RW 005
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-xs">
              {user ? `Selamat Datang, ${user.name}` : "Portal Warga Gang Cinta - Bumi Nagara Lestari"}
            </h1>
            <div className="text-slate-200 text-xs sm:text-sm max-w-3xl leading-relaxed opacity-95">
              {isKetuaGang ? (
                isEditingWelcome ? (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!tempWelcomeText.trim()) return;
                      const updated = { ...adminWelcomeConfig, text: tempWelcomeText };
                      welcomeService.setAdminWelcomeConfig(updated);
                      setAdminWelcomeConfig(updated);
                      setIsEditingWelcome(false);
                      showToast("Teks deskripsi Ketua Gang berhasil disimpan!", "success");
                    }}
                    className="space-y-3 my-2"
                  >
                    <RichTextEditor
                      value={tempWelcomeText}
                      onChange={(val) => setTempWelcomeText(val)}
                      placeholder="Tuliskan teks deskripsi wewenang Ketua Gang..."
                      minHeight="90px"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Simpan Perubahan
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingWelcome(false)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/30 transition active:scale-95 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        Batal
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="inline-block relative group/edit">
                    <span 
                      className="leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: adminWelcomeConfig.text || "Sebagai Ketua Gang Cinta (Perumahan Bumi Nagara Lestari RT 028 RW 005), Anda berwenang mengelola dokumentasi momen kegiatan, registrasi KK & nomor rumah, persetujuan ijin tamu menginap, serta tema website."
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setTempWelcomeText(adminWelcomeConfig.text || "Sebagai Ketua Gang Cinta (Perumahan Bumi Nagara Lestari RT 028 RW 005), Anda berwenang mengelola dokumentasi momen kegiatan, registrasi KK & nomor rumah, persetujuan ijin tamu menginap, serta tema website.");
                        setIsEditingWelcome(true);
                      }}
                      className="inline-flex items-center justify-center p-1.5 ml-2 rounded-lg bg-white/20 hover:bg-white/35 text-white border border-white/30 backdrop-blur transition active:scale-95 shadow-2xs cursor-pointer align-middle"
                      title="Ubah Deskripsi Ketua Gang"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-300" />
                    </button>
                  </div>
                )
              ) : user?.role === "bendahara" ? (
                <p>Sebagai Bendahara Kas Gang Cinta, Anda berwenang penuh atas pencatatan 5 pos saldo awal, pengeluaran buat apa saja, pemasukan, dan kalender kas.</p>
              ) : user?.role === "anggota" ? (
                <p>Sebagai Warga Gang Cinta Perumahan Bumi Nagara Lestari, Anda dapat melihat transparansi kas 5 pos, dokumentasi acara, mengupdate data KK Anda sendiri, dan melapor tamu menginap.</p>
              ) : (
                <p>Portal guyub warga Gang Cinta - Perumahan Bumi Nagara Lestari RT 028 RW 005: silakan pantau berita kegiatan, transparansi pembukuan kas 5 pos, dan dokumentasi acara gang. Masuk akun untuk melengkapi KK atau lapor tamu.</p>
              )}
            </div>
          </div>

          {/* Action Buttons (Pill-shaped as in screenshot) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {user?.role === "admin" && (
              <>
                <button
                  onClick={onOpenUploadMoment}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-900 font-extrabold text-xs transition shadow-lg hover:bg-slate-100 active:scale-95"
                >
                  <Camera className="w-4 h-4 text-slate-800" />
                  Upload Foto Acara
                </button>
                <button
                  onClick={onOpenRegisterKK}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold backdrop-blur transition border border-white/25 active:scale-95 shadow-2xs"
                >
                  <UserPlus className="w-4 h-4" />
                  Daftarkan KK Baru
                </button>
              </>
            )}

            {user?.role === "bendahara" && (
              <>
                <button
                  onClick={onOpenNewTransaction}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-900 font-extrabold text-xs transition shadow-lg hover:bg-slate-100 active:scale-95"
                >
                  <PlusCircle className="w-4 h-4 text-slate-800" />
                  Catat Transaksi Kas
                </button>
                <button
                  onClick={() => setActiveTab("finance")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold backdrop-blur transition border border-white/25 active:scale-95 shadow-2xs"
                >
                  <CalendarIcon className="w-4 h-4" />
                  Kalender Kas
                </button>
              </>
            )}

            {user?.role === "anggota" && (
              <>
                <button
                  onClick={() => setActiveTab("residents")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 font-extrabold text-xs transition shadow-lg hover:bg-slate-100 active:scale-95"
                >
                  <Users className="w-4 h-4 text-slate-800" />
                  Isi Data KK Saya
                </button>
                <button
                  onClick={() => setActiveTab("guests")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur transition border border-white/30 active:scale-95 shadow-2xs"
                >
                  <UserPlus className="w-4 h-4" />
                  Lapor Tamu Menginap
                </button>
              </>
            )}

            {!user && (
              <>
                <button
                  onClick={() => requireAuth(() => {}, "Masuk Akun Warga")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-extrabold text-xs transition shadow-lg hover:bg-slate-100 active:scale-95"
                >
                  <LogIn className="w-4 h-4 text-slate-800" />
                  Masuk Akun Warga
                </button>
                <button
                  onClick={() => setActiveTab("finance")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur transition border border-white/30 active:scale-95 shadow-2xs"
                >
                  <Wallet className="w-4 h-4" />
                  Transparansi Kas 5 Pos
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Online Residents Floating Bar */}
      <OnlineResidents />

      {/* 4 Quick Stat Cards - Rich Colorful Gradients */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Total KK */}
        <div 
          onClick={() => setActiveTab("residents")}
          className="relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 cursor-pointer group"
        >
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:scale-110 transition shadow-xs">
              <Home className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
            </div>
            <span className="text-[10px] sm:text-xs font-extrabold bg-white/20 backdrop-blur-md text-white border border-white/30 px-2.5 py-0.5 rounded-full shadow-2xs">
              RT 028
            </span>
          </div>
          <div className="relative z-10 mt-3 sm:mt-4">
            <div className="text-xl sm:text-2xl font-black text-white drop-shadow-xs">{families.length} KK</div>
            <p className="text-[11px] sm:text-xs text-emerald-100 opacity-95 mt-0.5 truncate">Kepala Keluarga</p>
          </div>
        </div>

        {/* Card 2: Total Jiwa */}
        <div 
          onClick={() => setActiveTab("residents")}
          className="relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 cursor-pointer group"
        >
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:scale-110 transition shadow-xs">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
            </div>
            <span className="text-[10px] sm:text-xs font-extrabold bg-white/20 backdrop-blur-md text-white border border-white/30 px-2.5 py-0.5 rounded-full shadow-2xs">
              Penduduk
            </span>
          </div>
          <div className="relative z-10 mt-3 sm:mt-4">
            <div className="text-xl sm:text-2xl font-black text-white drop-shadow-xs">{totalCitizens} Jiwa</div>
            <p className="text-[11px] sm:text-xs text-blue-100 opacity-95 mt-0.5 truncate">{families.length} KK • {totalCitizens} Jiwa Terdaftar</p>
          </div>
        </div>

        {/* Card 3: Saldo Kas */}
        <div 
          onClick={() => setActiveTab("finance")}
          className="relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 cursor-pointer group"
        >
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:scale-110 transition shadow-xs">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
            </div>
            <span className="text-[10px] sm:text-xs font-extrabold bg-white/20 backdrop-blur-md text-white border border-white/30 px-2.5 py-0.5 rounded-full shadow-2xs">
              Kas Bersih
            </span>
          </div>
          <div className="relative z-10 mt-3 sm:mt-4">
            <div className="text-base sm:text-xl font-black text-white drop-shadow-xs truncate">
              {formatRupiah(summary.endingBalance)}
            </div>
            <p className="text-[11px] sm:text-xs text-amber-100 opacity-95 mt-0.5 truncate">Saldo Akhir Sept 2026</p>
          </div>
        </div>

        {/* Card 4: Momen Acara */}
        <div 
          onClick={() => setActiveTab("moments")}
          className="relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-rose-600 via-pink-600 to-purple-700 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 cursor-pointer group"
        >
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:scale-110 transition shadow-xs">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
            </div>
            <span className="text-[10px] sm:text-xs font-extrabold bg-white/20 backdrop-blur-md text-white border border-white/30 px-2.5 py-0.5 rounded-full shadow-2xs">
              Foto Acara
            </span>
          </div>
          <div className="relative z-10 mt-3 sm:mt-4">
            <div className="text-xl sm:text-2xl font-black text-white drop-shadow-xs">{moments.length} Acara</div>
            <p className="text-[11px] sm:text-xs text-rose-100 opacity-95 mt-0.5 truncate">Momen Kegiatan</p>
          </div>
        </div>

      </div>

      {/* SECTION: Transparansi Keuangan Kas Lengkap (Saldo Awal, Masuk, Keluar, Saldo Akhir 5 Pos) */}
      <div className="relative overflow-hidden rounded-3xl theme-gradient-banner text-white p-5 sm:p-7 shadow-xl space-y-6 transition-all">
        {/* Glowing Background Orbs & Translucent Watermark Logo */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none transform -rotate-12 select-none">
          <GangCintaLogo size="xl" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 pb-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-300 shadow-sm animate-pulse"></span>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                Transparansi Pembukuan Kas Gang Cinta - Perumahan Bumi Nagara Lestari (RT 028 RW 005)
              </h2>
            </div>
            <p className="text-xs text-white/80 mt-1">
              Transparansi saldo awal dan pengeluaran tiap pos agar seluruh warga dapat memantau kas lingkungan secara terbuka.
            </p>
          </div>

          <button
            onClick={() => setActiveTab("finance")}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-white bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 transition shadow-sm self-start sm:self-auto active:scale-95"
          >
            <span>Buka Kalender & Detail Kas</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Summary Balances Grid - Theme Infused & Glassmorphic */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-md flex flex-col justify-between min-h-[115px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-white/90 uppercase tracking-wider">Total Saldo Awal</span>
              <Wallet className="w-4 h-4 text-amber-300 flex-shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-black text-white my-1 tabular-nums tracking-tight">
              {formatRupiah(summary.startingBalance)}
            </div>
            <span className="text-[11px] text-white/70 font-medium">Total awal 5 pos per 1 Sept</span>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-500/25 backdrop-blur-md border border-emerald-300/30 shadow-md flex flex-col justify-between min-h-[115px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-200 uppercase tracking-wider">Total Pemasukan</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-300 flex-shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-200 my-1 tabular-nums tracking-tight">
              {formatRupiah(summary.totalIncome, "+")}
            </div>
            <span className="text-[11px] text-emerald-200/90 font-bold">Iuran rutin 25 KK & kas</span>
          </div>

          <div className="p-5 rounded-2xl bg-rose-500/25 backdrop-blur-md border border-rose-300/30 shadow-md flex flex-col justify-between min-h-[115px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-rose-200 uppercase tracking-wider">Total Pengeluaran</span>
              <ArrowDownRight className="w-4 h-4 text-rose-300 flex-shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-black text-rose-200 my-1 tabular-nums tracking-tight">
              {formatRupiah(summary.totalExpense, "-")}
            </div>
            <span className="text-[11px] text-rose-200/90 font-bold">{summary.expenseList.length} transaksi peruntukan</span>
          </div>

          <div className="p-5 rounded-2xl bg-amber-500/25 backdrop-blur-md border border-amber-300/30 shadow-md flex flex-col justify-between min-h-[115px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-200 uppercase tracking-wider">Total Saldo Akhir</span>
              <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
            </div>
            <div className="text-lg sm:text-xl font-black text-amber-200 my-1 tabular-nums tracking-tight">
              {formatRupiah(summary.endingBalance)}
            </div>
            <span className="text-[11px] text-amber-200/90 font-extrabold">Kas bersih per hari ini</span>
          </div>
        </div>

        {/* Tabel Rapi Transparansi Saldo Awal & Akhir 5 Pos Terpisah - Theme Infused */}
        <div className="relative z-10 w-full max-w-full overflow-hidden">
          <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
            <h3 className="text-xs font-extrabold uppercase text-white/90 tracking-wider flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-amber-300" />
              Tabel Saldo Awal & Akhir (5 Pos Anggaran)
            </h3>
            <span className="text-[11px] text-white/70">
              <span className="sm:hidden text-amber-300 font-semibold">👉 Geser tabel &gt;</span>
              <span className="hidden sm:inline font-medium">Periode: September 2026</span>
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/20 shadow-md bg-white/10 backdrop-blur-md scrollbar-thin">
            <table className="w-full text-left text-xs min-w-[520px]">
              <thead className="bg-white/20 text-white font-extrabold border-b border-white/20">
                <tr>
                  <th className="p-3 sm:p-3.5">Pos Anggaran</th>
                  <th className="p-3 sm:p-3.5 text-right">Saldo Awal</th>
                  <th className="p-3 sm:p-3.5 text-right">Pemasukan</th>
                  <th className="p-3 sm:p-3.5 text-right">Pengeluaran</th>
                  <th className="p-3 sm:p-3.5 text-right">Saldo Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {categories.map((cat) => {
                  const data = summary.categoryBreakdown[cat.id] || { starting: 0, income: 0, expense: 0, ending: 0 };
                  const starting = formatRupiahParts(data.starting);
                  const income = formatRupiahParts(data.income, data.income > 0 ? "+" : "");
                  const expense = formatRupiahParts(data.expense, data.expense > 0 ? "-" : "");
                  const ending = formatRupiahParts(data.ending);

                  return (
                    <tr key={cat.id} className="hover:bg-white/15 transition text-white">
                      <td className="p-3 sm:p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-white/20 border border-white/30 text-white">{getCategoryIcon(cat.id)}</span>
                          <span className="font-extrabold text-white">{cat.name}</span>
                        </div>
                      </td>
                      <td className="p-3 sm:p-3.5 whitespace-nowrap font-mono">
                        <div className="flex items-center justify-between gap-2 max-w-[130px] ml-auto">
                          <span className="text-white/70 font-semibold text-left">{starting.symbol}</span>
                          <span className="font-bold text-white text-right tabular-nums">{starting.digits}</span>
                        </div>
                      </td>
                      <td className="p-3 sm:p-3.5 whitespace-nowrap font-mono">
                        <div className="flex items-center justify-between gap-2 max-w-[130px] ml-auto text-emerald-300">
                          <span className="font-bold text-left">{income.symbol}</span>
                          <span className="font-extrabold text-right tabular-nums">{income.digits}</span>
                        </div>
                      </td>
                      <td className="p-3 sm:p-3.5 whitespace-nowrap font-mono">
                        <div className="flex items-center justify-between gap-2 max-w-[130px] ml-auto text-rose-300">
                          <span className="font-bold text-left">{expense.symbol}</span>
                          <span className="font-extrabold text-right tabular-nums">{expense.digits}</span>
                        </div>
                      </td>
                      <td className="p-3 sm:p-3.5 whitespace-nowrap font-mono">
                        <div className="flex items-center justify-between gap-2 max-w-[130px] ml-auto text-amber-300">
                          <span className="font-extrabold text-left">{ending.symbol}</span>
                          <span className="font-black text-right tabular-nums">{ending.digits}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pengeluaran Buat Apa Aja */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase text-white/80 tracking-wider">
              Daftar Pengeluaran Terkini ("Buat Apa Saja")
            </h3>
            <span className="text-xs text-white/70 font-medium">Terbuka & Transparan</span>
          </div>

          <div className="divide-y divide-white/10 border border-white/20 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md">
            {summary.expenseList.slice(0, 3).map((item) => {
              const catObj = categories.find(c => c.id === item.category);
              return (
                <div key={item.id} className="p-3.5 bg-white/5 hover:bg-white/15 flex items-start justify-between gap-4 transition">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/30 text-rose-200 border border-rose-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ArrowDownRight className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-white">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-white/20 text-white border-white/30">
                          {catObj?.name || item.category}
                        </span>
                      </div>
                      <p className="text-xs text-white/80 mt-1 max-w-2xl">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-white/60 mt-1.5">
                        <span>📅 {new Date(item.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span>•</span>
                        <span>Pencatat: {item.recordedBy}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 font-mono">
                    {(() => {
                      const parts = formatRupiahParts(item.amount, "-");
                      return (
                        <div className="flex items-center justify-between gap-2 w-28 text-xs sm:text-sm font-bold text-rose-300">
                          <span className="text-left font-bold">{parts.symbol}</span>
                          <span className="text-right font-extrabold tabular-nums">{parts.digits}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* SECTION: Pintasan Live Chat Warga & Momen Acara Terkini */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card Pintasan Live Chat Warga */}
        <div className="relative overflow-hidden rounded-3xl theme-gradient-banner text-white p-6 shadow-xl flex flex-col justify-between space-y-4 transition-all">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/20 border border-white/30 text-amber-300">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Obrolan Guyub Rukun Warga
                  </h3>
                  <p className="text-[11px] text-white/80">
                    Kanal silaturahmi & info cepat antar warga Gang Cinta RT 028 RW 005
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-300/40 flex items-center gap-1.5 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Live Room
              </span>
            </div>

            {/* Cuplikan Pesan Terkini */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Pesan Terbaru dari Tetangga:
                </span>
                <button 
                  onClick={onOpenChat}
                  className="text-xs font-bold text-amber-300 hover:text-amber-200 transition"
                >
                  Buka Room &gt;
                </button>
              </div>

              {chatMessages.length === 0 ? (
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center text-xs text-white/70">
                  Memuat obrolan warga...
                </div>
              ) : (
                chatMessages.slice(-2).map((m) => (
                  <div 
                    key={m.id} 
                    onClick={onOpenChat}
                    className="p-3 rounded-2xl bg-white/15 border border-white/20 hover:bg-white/25 backdrop-blur-md transition cursor-pointer flex items-start gap-3 group"
                    title="Klik untuk membuka obrolan lengkap"
                  >
                    <img
                      src={getSenderAvatar(m)}
                      alt={getSenderName(m)}
                      className="w-8 h-8 rounded-full object-cover border border-white/40 flex-shrink-0 mt-0.5 shadow-2xs group-hover:scale-105 transition"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white truncate">{getSenderName(m)}</span>
                        <span className="text-[10px] text-amber-300 font-mono">
                          {new Date(m.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-xs text-white/80 line-clamp-1 mt-0.5">
                        {m.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="relative z-10 space-y-2 pt-3 border-t border-white/20">
            <button
              onClick={onOpenChat}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-extrabold text-xs shadow-md border border-white/30 transition transform active:scale-98"
            >
              <MessageSquare className="w-4 h-4 text-amber-300" />
              <span>Buka Live Chat Warga (Pojok Bawah)</span>
            </button>
            <p className="text-[11px] text-center text-white/80">
              💬 Obrolan warga melayang di pojok kanan bawah, bisa dibuka kapan saja dari halaman mana pun.
            </p>
          </div>
        </div>

        {/* Galeri Momen Acara Terbaru */}
        <div className="relative overflow-hidden rounded-3xl theme-gradient-banner text-white p-6 shadow-xl flex flex-col justify-between space-y-4 transition-all">
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-white/20 border border-white/30 text-amber-300">
                  <Camera className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-white">Dokumentasi Momen Gang Cinta</h3>
              </div>
              <button
                onClick={() => setActiveTab("moments")}
                className="text-xs font-bold text-amber-300 hover:text-amber-200 transition"
              >
                Lihat Semua
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {moments.slice(0, 2).map((m) => (
                <div 
                  key={m.id}
                  onClick={() => setActiveTab("moments")}
                  className="rounded-2xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-md cursor-pointer group hover:bg-white/20 hover:shadow-lg transition"
                >
                  <div className="aspect-video relative overflow-hidden bg-black/20">
                    <img src={m.imageUrl} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <span className="absolute top-2 left-2 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-black/60 text-amber-300 backdrop-blur-md border border-white/20">
                      {m.category}
                    </span>
                  </div>
                  <div className="p-3">
                    <h5 className="font-bold text-xs text-white line-clamp-1 group-hover:text-amber-300 transition">
                      {m.title}
                    </h5>
                    <p className="text-[11px] text-white/70 mt-1">
                      {new Date(m.eventDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-[11px] text-white/80">
            📸 Dokumentasi foto acara diunggah oleh Admin untuk menyimpan kenangan guyub warga.
          </div>
        </div>

      </div>

      {/* SECTION: Laporan Tamu Menginap & Wewenang Ijin Ketua Gang */}
      <div className="relative overflow-hidden rounded-3xl theme-gradient-banner text-white p-5 sm:p-7 shadow-xl space-y-4 transition-all">
        {/* Background Glows & Watermark Logo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none transform -rotate-12 select-none">
          <GangCintaLogo size="xl" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-white/20 border border-white/30 text-amber-300">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  {user?.role === "admin" 
                    ? "Wewenang Ijin Tamu Menginap (Khusus Ketua Gang Cinta)" 
                    : "Pelaporan Tamu Menginap 1x24 Jam Gang Cinta"}
                </h3>
                {user?.role === "admin" && (
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-300/30 text-amber-200 border border-amber-300/40">
                    Ketua Gang Cinta
                  </span>
                )}
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                {user?.role === "admin"
                  ? "Hanya Ketua Gang yang berwenang memberikan ijin ('Ijinkan Tamu') atau menolak ('Tidak Diijinkan')."
                  : "Data tamu bersifat privat, hanya Anda dan Ketua Gang yang dapat melihat status ijinnya."}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab("guests")}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-white bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 transition shadow-sm self-start sm:self-auto active:scale-95"
          >
            {user?.role === "admin" ? "Buka Kelola Ijin Tamu" : "Buka Menu Lapor Tamu"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {guestReports.length === 0 ? (
          <div className="relative z-10 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center text-xs text-white/80 space-y-2">
            <p>Belum ada riwayat tamu menginap yang dilaporkan.</p>
            <button
              onClick={() => setActiveTab("guests")}
              className="text-xs font-bold text-amber-300 hover:underline"
            >
              + Lapor Tamu / Keluarga Baru Sekarang
            </button>
          </div>
        ) : (
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-3">
            {guestReports.slice(0, 2).map((report) => {
              const isApproved = report.status === "approved" || report.status === "verified";
              const isRejected = report.status === "rejected";
              const isPending = !isApproved && !isRejected;

              return (
                <div 
                  key={report.id}
                  onClick={() => setActiveTab("guests")}
                  className="p-4 rounded-2xl bg-white/15 backdrop-blur-md hover:bg-white/25 border border-white/20 transition cursor-pointer space-y-2.5 group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white group-hover:text-amber-300 transition">
                        {report.guestName}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                        {report.relationship}
                      </span>
                    </div>

                    {isApproved && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-300/40">
                        ✓ Diijinkan Ketua Gang
                      </span>
                    )}
                    {isRejected && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-300/40">
                        ✕ Tidak Diijinkan
                      </span>
                    )}
                    {isPending && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-300/40">
                        ⏳ Menunggu Keputusan
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-white/90 line-clamp-1">
                    Tuan Rumah: <strong className="text-white">{getReporterName(report)}</strong> ({report.houseNumber}) • Jadwal: {report.startDate} ({report.durationDays} hari)
                  </p>

                  {report.notesFromAdmin && (
                    <div className="text-[11px] text-white/90 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20 line-clamp-1">
                      💬 <em>{report.notesFromAdmin}</em>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
