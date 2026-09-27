import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import GangCintaLogo from "../common/GangCintaLogo";
import { useTheme } from "../../context/ThemeContext";
import { 
  HeartHandshake, 
  ShieldCheck, 
  Lock, 
  User, 
  ArrowRight, 
  KeyRound, 
  HelpCircle,
  Eye,
  EyeOff
} from "lucide-react";

export default function LoginPage() {
  const { login, allUsers } = useAuth();
  const { currentTheme } = useTheme();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto clear login fields when LoginPage mounts
  useEffect(() => {
    setUsername("");
    setPassword("");
    setShowPassword(false);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setIsSubmitting(true);
    setTimeout(() => {
      login(username, password);
      setIsSubmitting(false);
    }, 300);
  };

  const handleForgotPassword = () => {
    // Find admin user or Ketua Gang contact number
    const adminUser = (allUsers || []).find(u => u.role === "admin") || 
                      (allUsers || []).find(u => (u.jabatan || "").toLowerCase().includes("ketua"));
    
    const adminPhoneRaw = adminUser?.phone || "0812-3456-7890";
    let cleanPhone = adminPhoneRaw.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    }
    if (!cleanPhone) cleanPhone = "6281234567890";

    const userMsg = username.trim() 
      ? `Halo Admin / Ketua Gang Cinta (RT 028 RW 005),\nSaya warga dengan Username: *${username.trim()}* lupa password akun login portal website.\n\nMohon bantuan untuk mengecek dan menginfokan/mengingatkan kembali password asli akun saya. Terima kasih!`
      : `Halo Admin / Ketua Gang Cinta (RT 028 RW 005),\nSaya warga Gang Cinta lupa password akun login portal website.\n\nMohon bantuan untuk mengecek dan menginfokan kembali password akun saya. Terima kasih!`;

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(userMsg)}`;
    window.open(waUrl, "_blank");
  };

  const getRoleBadge = (userObj) => {
    const icon = userObj.icon || (userObj.role === "admin" ? "👑" : userObj.role === "bendahara" ? "💰" : "👤");
    const title = userObj.jabatan || (userObj.role === "admin" ? "Ketua Gang" : userObj.role === "bendahara" ? "Bendahara" : "Warga");

    let badgeStyle = "bg-amber-100 text-amber-800 border-amber-300";
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes("ketua") && !lowerTitle.includes("wakil")) {
      badgeStyle = "bg-emerald-100 text-emerald-800 border-emerald-300";
    } else if (lowerTitle.includes("wakil")) {
      badgeStyle = "bg-teal-100 text-teal-800 border-teal-300";
    } else if (lowerTitle.includes("sesepuh")) {
      badgeStyle = "bg-purple-100 text-purple-800 border-purple-300";
    } else if (lowerTitle.includes("bendahara")) {
      badgeStyle = "bg-indigo-100 text-indigo-800 border-indigo-300";
    } else if (userObj.role === "admin") {
      badgeStyle = "bg-sky-100 text-sky-800 border-sky-300";
    }

    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 whitespace-nowrap ${badgeStyle}`}>
        <span>{icon}</span> {title}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Large Translucent Watermark Logo */}
      <GangCintaLogo variant="watermark" size="watermark" />

      {/* Background Decorative Lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 right-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center px-4">
        
        {/* Brand Header */}
        <div className="flex justify-center mb-4">
          <GangCintaLogo size="xl" variant="badge" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Gang Cinta
        </h1>
        <p className="mt-1 text-sm font-semibold text-emerald-300">
          Perumahan Bumi Nagara Lestari • RT 028 RW 005
        </p>
        <p className="mt-1 text-xs text-slate-300">
          Portal Pelayanan Warga, Transparansi Kas & Dokumentasi Kegiatan
        </p>

        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur border border-white/15">
          <Lock className="w-3.5 h-3.5" />
          Akses Masuk Privat & Terproteksi
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-white/20 space-y-6">
          
          {/* Form Login Mandiri */}
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Username Akun Warga / Pengurus
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username Anda..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>

              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password Anda..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition bg-slate-50 focus:bg-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 transition focus:outline-none"
                  title={showPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Lupa Password Link Right Above Login Button */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Lupa Password?</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-lg shadow-emerald-700/30 transition transform active:scale-98 disabled:opacity-50 mt-1"
            >
              <span>{isSubmitting ? "Memverifikasi..." : "Login"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Privacy Security Guarantee */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Sistem Keamanan Data Privat:
            </div>
            <p>
              • <strong>Warga:</strong> Hanya dapat mengedit data KK miliknya dan hanya dapat melihat laporan tamu miliknya.
            </p>
            <p>
              • <strong>Bendahara:</strong> Mengelola pembukuan 5 pos anggaran & kalender kas.
            </p>
            <p>
              • <strong>Admin:</strong> Upload foto kegiatan gang & pendaftaran akun warga baru.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 Pengurus Gang Cinta, Perumahan Bumi Nagara Lestari (RT 028 RW 005). Terwujudnya warga yang rukun, aman, dan transparan.
        </p>
      </div>

    </div>
  );
}
