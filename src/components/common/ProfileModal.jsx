import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { X, User, Camera, Phone, KeyRound, Lock, Eye, EyeOff, ShieldCheck, Check } from "lucide-react";

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateProfile, changePassword, showToast } = useAuth();

  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "password"

  // Profile form state
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");

  React.useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setAvatar(user.avatar || "");
    }
  }, [user, isOpen]);

  // Password form state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);

  if (!isOpen || !user) return null;

  const avatarPresets = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        showToast("Ukuran foto maksimal 3MB", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Nama tidak boleh kosong", "error");
      return;
    }

    updateProfile({
      name: name.trim(),
      phone: phone.trim(),
      avatar
    });
    onClose();
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword) {
      showToast("Mohon masukkan password lama Anda", "error");
      return;
    }
    if (!newPassword || newPassword.length < 3) {
      showToast("Password baru minimal 3 karakter", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Konfirmasi password baru tidak cocok!", "error");
      return;
    }

    setIsSubmittingPass(true);
    const res = await changePassword(oldPassword, newPassword);
    setIsSubmittingPass(false);

    if (res.success) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in my-8">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <User className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">Pengaturan Akun Anda</h3>
              <p className="text-xs text-emerald-200">Ubah profil dan kata sandi login</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-2.5 text-xs font-bold border-b-2 flex items-center justify-center gap-2 transition ${
              activeTab === "profile"
                ? "border-emerald-600 text-emerald-700 bg-white rounded-t-xl shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <User className="w-4 h-4" /> Edit Profil
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`flex-1 py-2.5 text-xs font-bold border-b-2 flex items-center justify-center gap-2 transition ${
              activeTab === "password"
                ? "border-emerald-600 text-emerald-700 bg-white rounded-t-xl shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <KeyRound className="w-4 h-4" /> Ganti Password
          </button>
        </div>

        {/* TAB 1: EDIT PROFILE */}
        {activeTab === "profile" && (
          <form onSubmit={handleProfileSubmit} className="p-6 space-y-5">
            {/* Avatar Upload & Preview */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative group">
                <img
                  src={avatar || user.avatar}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-emerald-100 shadow-md group-hover:opacity-90 transition"
                />
                <label
                  htmlFor="avatar-file"
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 shadow-md cursor-pointer transition transform active:scale-95"
                  title="Ganti Foto Profil"
                >
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    id="avatar-file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <p className="text-[11px] text-slate-500 text-center">
                Klik ikon kamera untuk upload foto dari HP / Komputer Anda
              </p>

              {/* Presets */}
              <div className="flex items-center gap-2 pt-1">
                {avatarPresets.map((preset, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setAvatar(preset)}
                    className={`w-7 h-7 rounded-full overflow-hidden border-2 transition ${
                      avatar === preset ? "border-emerald-500 scale-110" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={preset} alt="preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Lengkap Anda *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nomor WhatsApp / HP
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
              Username: <strong className="font-mono text-slate-700">{user.username}</strong> • Peran: <strong>{user.role.toUpperCase()}</strong>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md transition"
              >
                Simpan Profil
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: CHANGE PASSWORD */}
        {activeTab === "password" && (
          <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Keamanan Akun {user.name}</p>
                <p className="text-[11px] text-indigo-800 mt-0.5">
                  Masukkan password lama Anda saat ini, lalu buat password baru yang aman.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password Saat Ini (Lama) *
              </label>
              <div className="relative">
                <input
                  type={showOldPass ? "text" : "password"}
                  required
                  placeholder="Masukkan password saat ini"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPass(!showOldPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password Baru *
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? "text" : "password"}
                  required
                  minLength={3}
                  placeholder="Password baru (minimal 3 karakter)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Konfirmasi Password Baru *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? "text" : "password"}
                  required
                  minLength={3}
                  placeholder="Ketik ulang password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1">
                  ⚠️ Password baru dan konfirmasi belum cocok!
                </p>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmittingPass}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md transition disabled:opacity-50"
              >
                {isSubmittingPass ? "Menyimpan..." : "Update Password Baru"}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
