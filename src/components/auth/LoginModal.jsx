import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import GangCintaLogo from "../common/GangCintaLogo";
import { 
  X, 
  Lock, 
  User, 
  KeyRound, 
  ArrowRight, 
  HelpCircle,
  Eye,
  EyeOff
} from "lucide-react";

export default function LoginModal({ isOpen, onClose, pendingActionName }) {
  const { login, allUsers } = useAuth();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto clear login fields when modal opens
  useEffect(() => {
    if (isOpen) {
      setUsername("");
      setPassword("");
      setShowPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setIsSubmitting(true);
    const success = await login(username, password);
    setIsSubmitting(false);
    if (success) {
      setUsername("");
      setPassword("");
      onClose();
    }
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-md bg-white text-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in my-auto">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-5 theme-gradient-banner text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <GangCintaLogo size="xs" variant="badge" />
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base truncate">Masuk Akun Gang Cinta</h3>
              <p className="text-[10px] sm:text-xs text-emerald-100 truncate">
                {pendingActionName ? `Login: ${pendingActionName}` : "RT 028 RW 005"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Username atau Nama Warga
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition bg-slate-50 focus:bg-white"
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
                  placeholder="Masukkan password akun..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition bg-slate-50 focus:bg-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition focus:outline-none"
                  title={showPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Lupa Password Link Right Above Login Button */}
            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Lupa Password?</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition disabled:opacity-50 active:scale-95 mt-1"
            >
              <span>{isSubmitting ? "Memverifikasi..." : "Login ke Akun"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
