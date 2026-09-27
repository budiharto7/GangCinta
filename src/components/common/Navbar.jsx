import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import GangCintaLogo from "./GangCintaLogo";
import { 
  HeartHandshake, 
  Shield, 
  Wallet, 
  User, 
  Menu, 
  X, 
  ChevronDown, 
  Check, 
  Sparkles,
  LogOut,
  Palette,
  Camera,
  LogIn,
  ZoomIn,
  ZoomOut,
  Smartphone,
  Monitor
} from "lucide-react";

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  onOpenProfile, 
  onOpenTheme,
  onOpenLogin 
}) {
  const { user, logout } = useAuth();
  const { currentTheme, navStyle, zoomLevel, zoomIn, zoomOut, resetZoom } = useTheme();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);


  const roleConfig = {
    admin: {
      label: "Ketua Gang Cinta",
      badge: "theme-bg-light theme-text-primary-dark border theme-border-light",
      icon: <Shield className="w-3.5 h-3.5 theme-text-primary" />
    },
    bendahara: {
      label: "Bendahara Gang Cinta",
      badge: "theme-bg-light theme-text-primary-dark border theme-border-light",
      icon: <Wallet className="w-3.5 h-3.5 theme-text-primary" />
    },
    anggota: {
      label: "Warga Gang Cinta",
      badge: "theme-bg-light theme-text-primary-dark border theme-border-light",
      icon: <User className="w-3.5 h-3.5 theme-text-primary" />
    }
  };

  const currentRole = user ? (roleConfig[user.role] || roleConfig.anggota) : null;

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

  let displayJabatan = cleanJabatan || (isKetuaGang ? "Ketua Gang" : user?.role === "bendahara" ? "Bendahara Kas" : "Warga Biasa");

  const headerBgClass = "theme-gradient-banner text-white border-b border-white/15 shadow-md";

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-colors duration-300 select-none shadow-md backdrop-blur-md ${headerBgClass}`}
      style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Brand & Community Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded-lg text-white hover:bg-white/20 flex-shrink-0 transition cursor-pointer"
              aria-label="Menu Navigasi"
              title="Buka Menu Navigasi"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isKetuaGang) {
                  onOpenTheme();
                } else {
                  setActiveTab("dashboard");
                }
              }} 
              onDoubleClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isKetuaGang) {
                  onOpenTheme();
                } else {
                  setActiveTab("dashboard");
                }
              }}
              className="flex items-center gap-2 sm:gap-3 text-left group focus:outline-none min-w-0 transition hover:opacity-95"
              title={isKetuaGang ? "Klik atau Klik 2x logo untuk ganti Logo Portal (Khusus Ketua Gang)" : "Kembali ke Beranda & Dashboard Gang Cinta"}
            >
              <GangCintaLogo 
                size="sm" 
                variant="badge" 
                showText={true} 
                showSub={false} 
                isEditable={isKetuaGang}
              />
            </button>
          </div>

          {/* Center Navigation Links (Visible on Laptop & PC) */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
            {[
              { id: "dashboard", label: "Beranda" },
              { id: "moments", label: "Momen" },
              { id: "residents", label: "Data Warga" },
              { id: "finance", label: "Kas 5 Pos" },
              { id: "guests", label: "Lapor Tamu", requiresLogin: true },
              { id: "chat", label: "Obrolan" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.requiresLogin && !user) {
                    onOpenLogin();
                    return;
                  }
                  setActiveTab(tab.id);
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-white text-slate-900 shadow-md font-extrabold"
                    : "text-white/80 hover:text-white hover:bg-white/15"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right Controls (Clean, Compact, Never Overlapping) */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            
            {user ? (
              <>
                {/* Theme Switcher Button - KHUSUS KETUA GANG */}
                {isKetuaGang && (
                  <button
                    onClick={onOpenTheme}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-slate-900 text-xs font-extrabold shadow-md hover:bg-slate-100 transition active:scale-95 cursor-pointer"
                    title="Ganti Tema & Pengaturan Portal"
                  >
                    <Palette className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">Tema</span>
                  </button>
                )}

                {/* User Avatar with Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(!profileDropdownOpen);
                    }}
                    className="flex items-center gap-2 p-1 pl-2.5 bg-white/20 hover:bg-white/30 rounded-full border border-white/30 backdrop-blur transition cursor-pointer active:scale-95"
                    title={`${displayIcon} ${displayJabatan} - ${user.name}`}
                  >
                    <span className="text-sm leading-none" role="img" aria-label="Simbol Jabatan">
                      {displayIcon}
                    </span>
                    <span className="text-xs font-extrabold text-white hidden sm:inline max-w-[110px] truncate">
                      {user.name}
                    </span>
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-xs"
                    />
                  </button>

                  {profileDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in text-slate-900"
                      onMouseLeave={() => setProfileDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{displayIcon}</span>
                          <p className="text-xs font-bold text-slate-900">{user.name}</p>
                        </div>
                        <p className="text-[11px] font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
                          <span>{displayIcon}</span>
                          <span>{displayJabatan}</span>
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {user.houseNo ? `Rumah ${user.houseNo}` : "Perumahan Bumi Nagara Lestari RT 028"}
                        </p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            onOpenProfile();
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                        >
                          <Camera className="w-4 h-4 text-slate-500" />
                          Ubah Nama & Foto Profil
                        </button>

                        {isKetuaGang && (
                          <button
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              onOpenTheme();
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                          >
                            <Palette className="w-4 h-4 text-indigo-600" />
                            Ganti Logo & Tema Website
                          </button>
                        )}

                        <div className="border-t border-slate-100 my-1"></div>

                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5"
                        >
                          <LogOut className="w-4 h-4 text-rose-600" />
                          Keluar (Logout)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* GUEST MODE: Show Login Button only */
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white text-slate-900 font-extrabold text-xs shadow-md hover:bg-slate-100 transition transform active:scale-95"
              >
                <LogIn className="w-4 h-4 text-slate-800" />
                <span>Masuk / Login Warga</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
