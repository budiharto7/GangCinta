import React, { useState } from "react";
import { familyService, authService } from "../../services/storageService";
import { api } from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";
import KKUploadDropzone from "../common/KKUploadDropzone";
import { X, UserPlus, Home, KeyRound, Phone, ShieldCheck, CheckCircle2, UserCheck, Sparkles, Award } from "lucide-react";

export default function RegisterKKModal({ isOpen, onClose, onKKRegistered }) {
  const { showToast, refreshUsers } = useAuth();

  const [headOfFamily, setHeadOfFamily] = useState("");
  const [block, setBlock] = useState("Blok F4");
  const [houseNumber, setHouseNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [kkNumber, setKkNumber] = useState("");
  const [members, setMembers] = useState([]);
  
  // Custom manual typing & professional RT/Gang icons
  const [selectedIcon, setSelectedIcon] = useState("👤");
  const [roleTitle, setRoleTitle] = useState("Warga Biasa");
  const [roleAccess, setRoleAccess] = useState("anggota"); // "anggota" | "admin"

  // Account creation fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("123");

  const handleKKParsed = (parsed) => {
    if (!parsed) return;
    const hasData = Boolean(parsed.headOfFamily || parsed.kkNumber || (parsed.members && parsed.members.length > 0));
    if (!hasData) {
      showToast("Foto KK tersimpan. Jika teks miring, gunakan tombol Putar Foto 90°.", "info");
      return;
    }
    if (parsed.headOfFamily) {
      setHeadOfFamily(parsed.headOfFamily);
      const cleanName = parsed.headOfFamily.toLowerCase().replace(/[^a-z0-9]/g, "");
      const houseDigits = (parsed.houseNumber || houseNumber).replace(/\D/g, "");
      const suggested = houseDigits ? `${cleanName.slice(0, 10)}${houseDigits}` : cleanName.slice(0, 12);
      setUsername(suggested);
    }
    if (parsed.block) setBlock(parsed.block);
    if (parsed.houseNumber) setHouseNumber(parsed.houseNumber);
    if (parsed.kkNumber) setKkNumber(parsed.kkNumber);
    if (parsed.phone) setPhone(parsed.phone);
    if (parsed.members && parsed.members.length > 0) setMembers(parsed.members);
    showToast(`Data KK ${parsed.headOfFamily ? `(${parsed.headOfFamily})` : ""} berhasil mengisi formulir!`, "success");
  };

  if (!isOpen) return null;

  // Professional RT & Gang Management Icons Preset
  const PRESET_ICONS = [
    { icon: "👑", title: "Ketua Gang", defaultAccess: "admin", desc: "Akses Admin Utama (1 Ketua Gang / Admin)" },
    { icon: "🎖️", title: "Wakil Ketua Gang", defaultAccess: "anggota", desc: "Akses Pengurus RT & Warga Gang Cinta" },
    { icon: "📜", title: "Sekretaris", defaultAccess: "anggota", desc: "Akses Pengurus RT & Warga Gang Cinta" },
    { icon: "💰", title: "Bendahara Kas", defaultAccess: "bendahara", desc: "Akses Bendahara Kas (Hak Kelola Pembukuan & Iuran Kas)" },
    { icon: "🛡️", title: "Seksi Keamanan", defaultAccess: "anggota", desc: "Akses Pengurus RT & Warga Gang Cinta" },
    { icon: "🧹", title: "Seksi Kebersihan", defaultAccess: "anggota", desc: "Akses Pengurus RT & Warga Gang Cinta" },
    { icon: "🤝", title: "Seksi Humas", defaultAccess: "anggota", desc: "Akses Pengurus RT & Warga Gang Cinta" },
    { icon: "🏆", title: "Seksi Olahraga", defaultAccess: "anggota", desc: "Akses Pengurus RT & Warga Gang Cinta" },
    { icon: "🕌", title: "Seksi Keagamaan", defaultAccess: "anggota", desc: "Akses Pengurus RT & Warga Gang Cinta" },
    { icon: "👴", title: "Sesepuh Gang", defaultAccess: "anggota", desc: "Akses Kehormatan Sesepuh RT & Gang Cinta" },
    { icon: "👤", title: "Warga Biasa", defaultAccess: "anggota", desc: "Akses Warga Biasa (Lapor Tamu & Obrolan Warga)" }
  ];

  // Auto populate username recommendation based on name & house number
  const handleHeadNameChange = (val) => {
    setHeadOfFamily(val);
    const cleanName = val.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (cleanName) {
      const houseDigits = houseNumber.replace(/\D/g, "");
      const suggested = houseDigits ? `${cleanName.slice(0, 10)}${houseDigits}` : cleanName.slice(0, 12);
      setUsername(suggested);
    }
  };

  const handleSelectPresetIcon = (item) => {
    setSelectedIcon(item.icon);
    setRoleTitle(item.title);
    setRoleAccess(item.defaultAccess);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!headOfFamily.trim() || !houseNumber.trim()) {
      showToast("Mohon isi Nama Warga/Kepala Keluarga dan Nomor Rumah", "error");
      return;
    }

    try {
      const cleanBlock = block.trim() || "Blok F4";
      const digits = houseNumber.replace(/\D/g, "");
      const formattedHouseNo = digits ? `No. ${digits.padStart(2, "0")}` : houseNumber.trim();

      const finalUsername = username.trim().toLowerCase() || `warga_${Date.now().toString().slice(-4)}`;
      const autoAddress = `Gang Cinta RT 028 / RW 005, Perumahan Bumi Nagara Lestari, ${cleanBlock} ${formattedHouseNo}`;
      const finalJabatan = roleTitle.trim() || "Warga Biasa";
      const isKetuaGang = finalJabatan.toLowerCase() === "ketua gang" || selectedIcon === "👑";
      const isBendahara = finalJabatan.toLowerCase().includes("bendahara") || selectedIcon === "💰";
      const computedRole = isKetuaGang ? "admin" : (isBendahara ? "bendahara" : "anggota");

      // Validate Structure Role Quota Limits (Max 2 for Wakil & specific roles, Max 1 for Ketua)
      const cleanJab = finalJabatan.toLowerCase();
      const newHeadName = headOfFamily.trim().toLowerCase();
      const existingUsers = authService.getAllUsers().filter(u => (u.name || "").trim().toLowerCase() !== newHeadName);

      const isWakil = cleanJab.includes("wakil") || selectedIcon === "🎖️";

      if (isWakil) {
        const wakilCount = existingUsers.filter(u => 
          (u.jabatan || "").toLowerCase().includes("wakil") || u.icon === "🎖️"
        ).length;
        if (wakilCount >= 2) {
          throw new Error(`Jabatan Wakil (seperti 'Wakil Ketua Gang') maksimal hanya diperbolehkan untuk 2 orang (Wakil 1 & Wakil 2). Tidak bisa menambah lebih dari 2 orang.`);
        }
      } else if (!isKetuaGang && selectedIcon !== "👤" && cleanJab !== "warga biasa" && cleanJab !== "warga") {
        const sameRoleCount = existingUsers.filter(u => 
          u.icon === selectedIcon || (u.jabatan || "").toLowerCase() === cleanJab
        ).length;
        if (sameRoleCount >= 2) {
          throw new Error(`Jabatan '${finalJabatan}' maksimal hanya diperbolehkan untuk 2 orang pengurus. Tidak bisa menambah lebih dari 2 orang.`);
        }
      }

      const userPayload = {
        name: headOfFamily.trim(),
        username: finalUsername,
        password: password || "123",
        role: computedRole,
        jabatan: finalJabatan,
        icon: selectedIcon,
        houseNo: `${cleanBlock} ${formattedHouseNo}`,
        kkNo: "-",
        phone: phone.trim()
      };

      // 1. Create User Account for the Resident (local storage + backend API)
      let newUser;
      try {
        newUser = await api.registerUser(userPayload);
        // Ensure local storage sync
        try { authService.registerUser(userPayload); } catch { /* ignore if already registered */ }
      } catch {
        // Fallback to local storage if API backend fails or offline
        newUser = authService.registerUser(userPayload);
      }

      // 2. Create Family Record
      const familyPayload = {
        kkNumber: kkNumber || "-",
        headOfFamily: headOfFamily.trim(),
        block: cleanBlock,
        houseNumber: formattedHouseNo,
        address: autoAddress,
        houseStatus: "Milik Sendiri",
        phone: phone.trim(),
        emergencyContact: "",
        assignedUserId: newUser?.id || null,
        ...(members.length > 0 ? { members, isProfileCompleted: true } : {})
      };

      let newFamily;
      try {
        newFamily = await api.createFamily(familyPayload);
        // Ensure local storage sync
        try { familyService.createFamily(familyPayload); } catch { /* ignore if already created */ }
      } catch {
        newFamily = familyService.createFamily(familyPayload);
      }

      refreshUsers?.();
      showToast(`Pendaftaran Berhasil! '${headOfFamily}' (${selectedIcon} ${finalJabatan}) terdaftar dengan username login '${newUser.username}'.`, "success");
      
      if (onKKRegistered) onKKRegistered(newFamily);
      
      // Reset form
      setHeadOfFamily("");
      setHouseNumber("");
      setPhone("");
      setUsername("");
      setPassword("123");
      setSelectedIcon("👤");
      setRoleTitle("Warga Biasa");
      setRoleAccess("anggota");

      onClose();
    } catch (err) {
      showToast(err.message || "Gagal mendaftarkan warga baru", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in my-8">
        
        {/* Header */}
        <div className="px-6 py-5 theme-gradient-banner text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Registrasi Warga Baru</h3>
              <p className="text-xs text-white/80">
                Pendaftaran data pokok warga & pembuatan akun login
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner ringkas */}
        <div className="bg-amber-50 border-b border-amber-200/80 px-6 py-3 flex items-start gap-2.5 text-xs text-amber-900">
          <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Pendaftaran Ringkas:</strong> Cukup isi nama, rumah, telfon, & kredensial login. Data KK & susunan keluarga lengkap akan diisi sendiri oleh warga saat login ke akunnya.
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Upload / Foto Scan KK Auto-Fill */}
          <KKUploadDropzone onKKParsed={handleKKParsed} title="Unggah / Foto Scan KK untuk Pendaftaran Cepat" />

          {/* Section 1: Data Utama Warga & Rumah */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <Home className="w-4 h-4 theme-text-primary" /> Data Utama Warga & Rumah
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Warga / Kepala Rumah Tangga *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Bpk. Bambang Sulistyo"
                value={headOfFamily}
                onChange={(e) => handleHeadNameChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Blok Rumah *
                </label>
                <select
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition bg-white font-semibold text-slate-800"
                >
                  <option value="Blok F4">Blok F4</option>
                  <option value="Blok F6">Blok F6</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Rumah *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 12 atau No. 12"
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor WhatsApp / No. Telepon
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="Contoh: 0812-3456-7890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Peran Pengurus RT/Gang (Ketik Manual & Ikon Profesional) */}
          <div className="pt-3 border-t border-slate-200 space-y-3.5">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 theme-text-primary" /> Struktur Kepengurusan RT / Gang & Hak Akses
            </h4>

            {/* 1. Status Peran / Jabatan (Ketik Manual) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Status Peran / Jabatan Pengurus (Ketik Manual) *
              </label>
              <div className="relative">
                <span className="text-base absolute left-3 top-1/2 -translate-y-1/2 select-none">
                  {selectedIcon}
                </span>
                <input
                  type="text"
                  required
                  placeholder="Ketik manual, misal: Ketua RT 028, Sekretaris, Bendahara Kas, Seksi Keamanan..."
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* 2. Pilih Ikon Simbol Jabatan Pengurus RT / Gang */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Pilih Ikon Simbol Jabatan Pengurus RT & Gang:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-1.5">
                {PRESET_ICONS.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => handleSelectPresetIcon(item)}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs border transition text-left ${
                      selectedIcon === item.icon
                        ? "theme-bg-light theme-border-light theme-text-primary-dark ring-2 ring-emerald-500 shadow-2xs font-extrabold"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    <span className="truncate text-[11px] font-semibold">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username Login *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Username (huruf kecil)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password Awal *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Password default"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition font-mono"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white theme-bg-primary shadow-lg hover:opacity-90 transition active:scale-95"
            >
              Simpan & Buat Akun Warga
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}


