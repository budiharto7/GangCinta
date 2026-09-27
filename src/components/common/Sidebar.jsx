import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Users,
  WalletCards,
  UserPlus,
  Shield,
  Upload,
  Calendar,
  Lock,
  Sparkles,
  Info,
  LogIn,
  Palette,
  MessageSquare
} from "lucide-react";

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  mobileMenuOpen, 
  setMobileMenuOpen,
  onOpenTheme
}) {
  const { user, requireAuth } = useAuth();
  const { navStyle } = useTheme();

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard & Beranda",
      icon: <LayoutDashboard className="w-5 h-5" />,
      desc: "Informasi umum & pengumuman",
      cardBg: "bg-gradient-to-r from-emerald-100/90 via-teal-50/90 to-emerald-50/90 hover:from-emerald-200 hover:to-teal-100 border-emerald-300/90 text-emerald-950 shadow-xs",
      iconBg: "bg-emerald-500 text-white shadow-xs border border-emerald-400"
    },
    {
      id: "moments",
      label: "Galeri Momen Acara",
      icon: <ImageIcon className="w-5 h-5" />,
      desc: "Dokumentasi kegiatan gang",
      badge: user?.role === "admin" ? "Bisa Upload" : null,
      badgeColor: "bg-teal-200/90 text-teal-900 border border-teal-400 font-extrabold shadow-2xs",
      cardBg: "bg-gradient-to-r from-teal-100/90 via-cyan-50/90 to-teal-50/90 hover:from-teal-200 hover:to-cyan-100 border-teal-300/90 text-teal-950 shadow-xs",
      iconBg: "bg-teal-500 text-white shadow-xs border border-teal-400"
    },
    {
      id: "residents",
      label: "Data KK & Warga",
      icon: <Users className="w-5 h-5" />,
      desc: "Kependudukan per rumah",
      badge: user?.role === "admin" ? "Registrasi KK" : user ? "Isi KK Saya" : "Publik",
      badgeColor: "bg-emerald-200/90 text-emerald-900 border border-emerald-400 font-extrabold shadow-2xs",
      cardBg: "bg-gradient-to-r from-sky-100/90 via-blue-50/90 to-sky-50/90 hover:from-sky-200 hover:to-blue-100 border-sky-300/90 text-sky-950 shadow-xs",
      iconBg: "bg-sky-500 text-white shadow-xs border border-sky-400"
    },
    {
      id: "finance",
      label: "Laporan Keuangan",
      icon: <WalletCards className="w-5 h-5" />,
      desc: "5 Pos kas & kalender",
      badge: user?.role === "bendahara" ? "Input Bendahara" : "Transparansi",
      badgeColor: "bg-indigo-200/90 text-indigo-900 border border-indigo-400 font-extrabold shadow-2xs",
      cardBg: "bg-gradient-to-r from-indigo-100/90 via-purple-50/90 to-indigo-50/90 hover:from-indigo-200 hover:to-purple-100 border-indigo-300/90 text-indigo-950 shadow-xs",
      iconBg: "bg-indigo-500 text-white shadow-xs border border-indigo-400"
    },
    {
      id: "chat",
      label: "Obrolan & Diskusi Warga",
      icon: <MessageSquare className="w-5 h-5" />,
      desc: "Live chat guyub rukun RT 028",
      badge: "Live Room",
      badgeColor: "bg-emerald-200/90 text-emerald-900 border border-emerald-400 font-extrabold shadow-2xs",
      cardBg: "bg-gradient-to-r from-emerald-100/90 via-teal-50/90 to-emerald-50/90 hover:from-emerald-200 hover:to-teal-100 border-emerald-300/90 text-emerald-950 shadow-xs",
      iconBg: "bg-emerald-600 text-white shadow-xs border border-emerald-500"
    },
    {
      id: "guests",
      label: "Lapor Tamu Menginap",
      icon: <UserPlus className="w-5 h-5" />,
      desc: "Pelaporan privat sesuai KK",
      badge: user?.role === "admin" ? "Pantau Tamu" : user ? "Privat" : "Wajib Login",
      badgeColor: "bg-amber-200/90 text-amber-900 border border-amber-400 font-extrabold shadow-2xs",
      cardBg: "bg-gradient-to-r from-amber-100/90 via-orange-50/90 to-amber-50/90 hover:from-amber-200 hover:to-orange-100 border-amber-300/90 text-amber-950 shadow-xs",
      iconBg: "bg-amber-500 text-white shadow-xs border border-amber-400",
      requiresLogin: true
    }
  ];

  const handleSelect = (item) => {
    if (item.requiresLogin && !user) {
      requireAuth(() => {
        setActiveTab(item.id);
        if (mobileMenuOpen) setMobileMenuOpen(false);
      }, item.label);
      return;
    }

    setActiveTab(item.id);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const sidebarBgClass = navStyle === "colored"
    ? "bg-slate-900 text-white border-r border-slate-800 shadow-xl"
    : navStyle === "white"
    ? "bg-white border-r border-slate-200 shadow-xs"
    : "bg-gradient-to-b from-emerald-50/90 via-teal-50/85 to-sky-50/90 backdrop-blur-xl border-r border-emerald-200/80 shadow-xl";

  const cleanJabatan = (user?.jabatan || "").trim();
  const isKetuaGang = !!(
    user && (
      user.role === "admin" ||
      user.role === "ketua" ||
      user.username === "admin" ||
      (user.name || "").toLowerCase().trim() === "suryadi s" ||
      cleanJabatan.toLowerCase() === "ketua gang"
    )
  );

  let displayIcon = user?.icon;
  if (!displayIcon || displayIcon === "👤") {
    if (isKetuaGang) {
      displayIcon = "👑";
    } else {
      const lowerJab = (cleanJabatan || (user?.role || "")).toLowerCase();
      if (lowerJab.includes("bendahara")) displayIcon = "💰";
      else if (lowerJab.includes("keagamaan")) displayIcon = "🕌";
      else if (lowerJab.includes("humas")) displayIcon = "🤝";
      else if (lowerJab.includes("keamanan")) displayIcon = "🛡️";
      else if (lowerJab.includes("kebersihan")) displayIcon = "🧹";
      else if (lowerJab.includes("olahraga")) displayIcon = "🏆";
      else if (lowerJab.includes("sekretaris")) displayIcon = "📜";
      else if (lowerJab.includes("wakil")) displayIcon = "🎖️";
      else if (lowerJab.includes("sesepuh")) displayIcon = "👴";
      else displayIcon = user?.icon || "👤";
    }
  }

  let displayJabatan = cleanJabatan || (isKetuaGang ? "Ketua Gang" : user?.role === "bendahara" ? "Bendahara Kas" : "Warga Gang");

  return (
    <>
      {/* Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Content (Universal Drawer) */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-80 max-w-[85vw] flex flex-col justify-between transition-all duration-300 ease-in-out shadow-2xl ${sidebarBgClass} ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 space-y-5 overflow-y-auto">
          {/* Drawer Header with Close Button */}
          <div className="flex items-center justify-between pb-3 border-b border-white/15">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏡</span>
              <div>
                <h3 className="text-sm font-extrabold text-white">Menu Gang Cinta</h3>
                <p className="text-[10px] text-white/70">Perumahan Bumi Nagara Lestari</p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
              title="Tutup Menu"
            >
              <span className="text-sm font-bold">✕</span>
            </button>
          </div>

          
          {/* Active Role Status Box - Menyesuaikan Otomatis Dengan Tema Warna */}
          {user ? (
            <div className="relative overflow-hidden p-4 rounded-2xl theme-gradient-banner text-white shadow-md space-y-1.5 border border-white/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 flex items-center justify-between text-xs text-white/90 font-medium">
                <span>Status Pengguna</span>
                <span className="capitalize px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30 text-[10px] font-extrabold backdrop-blur flex items-center gap-1">
                  <span>{displayIcon}</span>
                  <span>{displayJabatan}</span>
                </span>
              </div>
              <div className="relative z-10 font-extrabold text-base text-white truncate flex items-center gap-1.5">
                <span>{displayIcon}</span>
                <span className="truncate">{user.name}</span>
              </div>
              <p className="relative z-10 text-[11px] text-slate-100 leading-tight">
                {isKetuaGang && "Ketua Gang Cinta, Perumahan Bumi Nagara Lestari RT 028 RW 005."}
                {user.role === "bendahara" && !isKetuaGang && "Wewenang mengelola 5 pos kas & pembukuan Gang Cinta."}
                {!isKetuaGang && user.role !== "bendahara" && "Warga Gang Cinta: akses kas, data KK sendiri & lapor tamu."}
              </p>
            </div>
          ) : (
            <div className="relative overflow-hidden p-4 rounded-2xl theme-gradient-banner text-white shadow-md space-y-2 border border-white/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 flex items-center justify-between text-xs text-white/90 font-medium">
                <span>Akses Pengunjung</span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold border border-white/30">
                  Tamu Warga
                </span>
              </div>
              <div className="relative z-10 font-extrabold text-base text-white">
                Gang Cinta - Bumi Nagara Lestari
              </div>
              <p className="relative z-10 text-[11px] text-slate-100">
                RT 028 RW 005. Anda dapat melihat berita & transparansi kas. Untuk kelola data KK atau lapor tamu, silakan masuk.
              </p>
              <button
                onClick={() => requireAuth(() => {}, "Masuk Akun")}
                className="relative z-10 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white text-slate-900 font-extrabold text-xs hover:bg-slate-100 transition shadow cursor-pointer active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                Masuk Akun Warga
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-2.5">
            <div className="px-3 pb-1 text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 theme-text-primary" />
              <span>Menu Utama</span>
            </div>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition duration-300 cursor-pointer ${
                    isActive
                      ? "relative overflow-hidden theme-gradient-banner text-white font-extrabold shadow-lg border border-white/30 transform scale-[1.02]"
                      : `${item.cardBg} border transition group hover:shadow-md`
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
                  )}

                  <div className={`p-2.5 rounded-xl flex-shrink-0 transition-transform duration-300 group-hover:scale-105 ${
                    isActive
                      ? "bg-white/20 border border-white/30 text-amber-300 shadow-sm"
                      : item.iconBg
                  }`}>
                    {item.icon}
                  </div>

                  <div className="flex-1 min-w-0 relative z-10 my-auto">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-xs font-extrabold leading-snug truncate ${isActive ? "text-white" : "text-slate-900 group-hover:text-black"}`}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          isActive
                            ? "bg-amber-300 text-slate-900 border border-amber-200 shadow-xs"
                            : item.badgeColor
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] mt-0.5 truncate ${isActive ? "text-white/80 font-medium" : "text-slate-600 font-medium"}`}>
                      {item.desc}
                    </p>
                  </div>
                </button>
              );
            })}

            {/* Menu Tema Tampilan Website - KHUSUS KETUA GANG */}
            {isKetuaGang && (
              <div className="pt-3">
                <button
                  onClick={() => {
                    if (onOpenTheme) onOpenTheme();
                    if (mobileMenuOpen) setMobileMenuOpen(false);
                  }}
                  className="relative overflow-hidden w-full flex items-center justify-between p-3 rounded-2xl theme-gradient-banner text-white shadow-md border border-white/20 transition active:scale-95 group cursor-pointer"
                  title="Ganti Tema & Bentuk Tampilan (Khusus Ketua Gang)"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="relative z-10 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-amber-300 bg-white/20 border border-white/30 shadow-xs group-hover:scale-105 transition">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-extrabold text-white">
                        Tema & Tampilan
                      </div>
                      <p className="text-[10px] text-white/80">Upload foto & ubah warna</p>
                    </div>
                  </div>
                  <span className="relative z-10 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-300 text-slate-900 border border-amber-200 shadow-xs">
                    Admin
                  </span>
                </button>
              </div>
            )}
          </nav>

        </div>

        {/* Footer info box */}
        <div className="p-4 border-t border-slate-200/80 bg-gradient-to-r from-emerald-50/60 via-teal-50/50 to-amber-50/60 backdrop-blur-md">
          <div className="flex items-start gap-2.5 text-xs text-slate-600">
            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-200 shadow-2xs">
              <Info className="w-3.5 h-3.5" />
            </div>
            <span className="leading-relaxed text-[11px] font-medium text-slate-600">
              <strong className="text-slate-800 font-extrabold">Gang Cinta</strong> — Perumahan Bumi Nagara Lestari, RT 028 RW 005. Guyub rukun, transparan, dan amanah.
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
