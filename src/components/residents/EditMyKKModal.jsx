import React, { useState, useEffect, useRef } from "react";
import { familyService, authService } from "../../services/storageService";
import { api } from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";
import { 
  X, Users, UserPlus, Trash2, Home, Check, Plus, Edit2, ShieldAlert, 
  Award, KeyRound, Phone, ShieldCheck 
} from "lucide-react";

export default function EditMyKKModal({ isOpen, onClose, family, onFamilyUpdated }) {
  const { showToast, refreshUsers, allUsers, user } = useAuth();
  const memberFormRef = useRef(null);

  const isAdmin = user?.role === "admin";

  // Find assigned user account for this family
  const assignedUser = (allUsers || []).find(
    u => family && (u.id === family.assignedUserId || 
    (u.name && u.name.toLowerCase() === (family.headOfFamily || "").toLowerCase()) ||
    (u.houseNo && family.houseNumber && u.houseNo.includes(family.houseNumber)))
  );

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

  const [formData, setFormData] = useState({
    kkNumber: family?.kkNumber || "",
    headOfFamily: family?.headOfFamily || "",
    block: family?.block || "Blok F4",
    houseNumber: family?.houseNumber || "",
    address: family?.address || "",
    houseStatus: family?.houseStatus || "Milik Sendiri",
    phone: family?.phone || "",
    emergencyContact: family?.emergencyContact || "",
    members: family?.members || []
  });

  // Account & Kepengurusan fields
  const [roleTitle, setRoleTitle] = useState(assignedUser?.jabatan || "Warga Biasa");
  const [selectedIcon, setSelectedIcon] = useState(assignedUser?.icon || "👤");
  const [roleAccess, setRoleAccess] = useState(assignedUser?.role || "anggota");
  const [username, setUsername] = useState(assignedUser?.username || "");
  const [password, setPassword] = useState(assignedUser?.password || "123");

  useEffect(() => {
    if (isOpen && family) {
      setFormData({
        kkNumber: family.kkNumber || "",
        headOfFamily: family.headOfFamily || "",
        block: family.block || "Blok F4",
        houseNumber: family.houseNumber || "",
        address: family.address || "",
        houseStatus: family.houseStatus || "Milik Sendiri",
        phone: family.phone || "",
        emergencyContact: family.emergencyContact || "",
        members: family.members || []
      });

      // Get authoritative user account directly from storage
      const usersList = authService.getAllUsers();
      const cleanHead = (family.headOfFamily || "").trim().toLowerCase();

      const realUser = usersList.find(
        x => !x.id.startsWith("derived-") && (
          (family.assignedUserId && x.id === family.assignedUserId) ||
          (cleanHead && (x.name || "").trim().toLowerCase() === cleanHead)
        )
      );

      const u = realUser || usersList.find(
        x => (family.assignedUserId && x.id === family.assignedUserId) ||
             (cleanHead && (x.name || "").trim().toLowerCase() === cleanHead)
      );

      if (u) {
        const defaultJab = u.role === "admin" ? "Ketua Gang" : (u.role === "bendahara" ? "Bendahara Kas" : "Warga Biasa");
        const defaultIcon = u.role === "admin" ? "👑" : (u.role === "bendahara" ? "💰" : "👤");

        setRoleTitle(u.jabatan || defaultJab);
        setSelectedIcon(u.icon || defaultIcon);
        setRoleAccess(u.role || "anggota");
        setUsername(u.username || "");
        setPassword(u.password || "123");
      }
    }
  }, [isOpen, family?.id]);

  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState({
    fullName: "",
    nik: "",
    relation: "Anak",
    gender: "Laki-laki",
    birthPlace: "",
    birthDate: "",
    job: "",
    religion: "Islam",
    bloodType: "-"
  });

  if (!isOpen || !family) return null;

  const handleSelectPresetIcon = (item) => {
    setSelectedIcon(item.icon);
    setRoleTitle(item.title);
    setRoleAccess(item.defaultAccess);
  };

  const handleOpenAddMember = () => {
    setEditingMember("NEW");
    setMemberForm({
      fullName: "",
      nik: "",
      relation: "Anak",
      gender: "Laki-laki",
      birthPlace: "",
      birthDate: "",
      job: "",
      religion: "Islam",
      bloodType: "-"
    });
    setTimeout(() => {
      memberFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  };

  const handleOpenEditMember = (member, index) => {
    setEditingMember(index);
    setMemberForm({ ...member });
    setTimeout(() => {
      memberFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  };

  const handleSaveMember = () => {
    if (!memberForm.fullName.trim()) {
      showToast("Nama anggota keluarga harus diisi", "error");
      return;
    }

    const updatedMembers = [...(formData.members || [])];
    let newHead = formData.headOfFamily;

    if (editingMember === "NEW") {
      if (memberForm.relation === "Kepala Keluarga") {
        newHead = memberForm.fullName.trim();
      }
      updatedMembers.push({
        id: `mem-${Date.now()}`,
        ...memberForm
      });
    } else {
      if (memberForm.relation === "Kepala Keluarga") {
        newHead = memberForm.fullName.trim();
      }
      updatedMembers[editingMember] = {
        ...updatedMembers[editingMember],
        ...memberForm
      };
    }

    setFormData({ ...formData, headOfFamily: newHead, members: updatedMembers });
    setEditingMember(null);
    showToast("Data anggota keluarga diperbarui pada daftar form", "info");
  };

  const handleDeleteMember = (index) => {
    const targetMember = (formData.members || [])[index];
    const memberName = targetMember?.fullName || "Anggota ini";

    if (targetMember && family?.id) {
      try {
        familyService.deleteMember(family.id, targetMember.id, targetMember.fullName);
        api.deleteMember(family.id, targetMember.id, targetMember.fullName).catch(() => {});
      } catch (err) {
        console.warn("Delete member warning:", err);
      }
    }

    const updatedMembers = (formData.members || []).filter((_, i) => i !== index);
    let newHead = formData.headOfFamily;
    if (targetMember && targetMember.fullName?.toLowerCase().trim() === (formData.headOfFamily || "").toLowerCase().trim()) {
      if (updatedMembers.length > 0) {
        newHead = updatedMembers[0].fullName;
      }
    }
    setFormData({ ...formData, headOfFamily: newHead, members: updatedMembers });
    showToast(`Data anggota "${memberName}" berhasil dihapus dari daftar KK.`, "info");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const cleanBlock = formData.block ? formData.block.trim() : "Blok F4";
      const digits = formData.houseNumber.replace(/\D/g, "");
      const formattedHouseNo = digits ? `No. ${digits.padStart(2, "0")}` : formData.houseNumber.trim();
      const payload = {
        ...formData,
        block: cleanBlock,
        houseNumber: formattedHouseNo,
        address: formData.address || `Gang Cinta RT 028 / RW 005, Perumahan Bumi Nagara Lestari, ${cleanBlock} ${formattedHouseNo}`
      };

      // 1. Update Family Record in local storage immediately
      let updated = familyService.updateFamily(family.id, payload);

      // 2. Sync to Backend API so phones and other devices get it live
      try {
        const apiUpdated = await api.updateFamily(family.id, payload);
        if (apiUpdated) updated = apiUpdated;
      } catch (apiErr) {
        console.warn("API update family fallback:", apiErr);
      }

      // 3. Update Associated User Account Kepengurusan & Login Credentials
      const realUser = (allUsers || []).find(
        x => !x.id.startsWith("derived-") && (
          x.id === family.assignedUserId || 
          (x.name && x.name.toLowerCase().trim() === (formData.headOfFamily || "").toLowerCase().trim())
        )
      );

      const targetUserId = realUser?.id || family.assignedUserId || `derived-${family.id}`;
      const finalJabatan = roleTitle.trim() || "Warga Biasa";
      const isKetuaGang = finalJabatan.toLowerCase() === "ketua gang" || selectedIcon === "👑";
      const isBendahara = finalJabatan.toLowerCase().includes("bendahara") || selectedIcon === "💰";
      const computedRole = isKetuaGang ? "admin" : (isBendahara ? "bendahara" : "anggota");

      // Validate Structure Role Quota Limits (Max 2 for Wakil & specific roles, Max 1 for Ketua)
      const cleanJab = finalJabatan.toLowerCase();
      const currentHeadName = formData.headOfFamily.trim().toLowerCase();
      const otherUsers = (allUsers || []).filter(u => (u.name || "").trim().toLowerCase() !== currentHeadName);

      const isWakil = cleanJab.includes("wakil") || selectedIcon === "🎖️";

      if (isWakil) {
        const wakilCount = otherUsers.filter(u => 
          (u.jabatan || "").toLowerCase().includes("wakil") || u.icon === "🎖️"
        ).length;
        if (wakilCount >= 2) {
          throw new Error(`Jabatan Wakil (seperti 'Wakil Ketua Gang') maksimal hanya diperbolehkan untuk 2 orang (Wakil 1 & Wakil 2). Tidak bisa menambah lebih dari 2 orang.`);
        }
      } else if (!isKetuaGang && selectedIcon !== "👤" && cleanJab !== "warga biasa" && cleanJab !== "warga") {
        const sameRoleCount = otherUsers.filter(u => 
          u.icon === selectedIcon || (u.jabatan || "").toLowerCase() === cleanJab
        ).length;
        if (sameRoleCount >= 2) {
          throw new Error(`Jabatan '${finalJabatan}' maksimal hanya diperbolehkan untuk 2 orang pengurus. Tidak bisa menambah lebih dari 2 orang.`);
        }
      }

      const userUpdates = {
        name: formData.headOfFamily.trim(),
        jabatan: finalJabatan,
        icon: selectedIcon,
        role: computedRole,
        username: username.trim().toLowerCase() || realUser?.username || `warga_${family.id}`,
        password: password || realUser?.password || "123",
        phone: formData.phone.trim(),
        houseNo: `${cleanBlock} ${formattedHouseNo}`
      };

      const updatedUser = authService.updateUserAccount(targetUserId, userUpdates);
      try {
        await api.updateUser(targetUserId, userUpdates);
      } catch (uErr) {
        console.warn("API update user fallback:", uErr);
      }

      if (updatedUser && updatedUser.id) {
        familyService.updateFamily(family.id, { assignedUserId: updatedUser.id });
        api.updateFamily(family.id, { assignedUserId: updatedUser.id }).catch(() => {});
      }

      // Broadcast changes across tabs & window
      window.dispatchEvent(new CustomEvent("families-data-changed"));
      window.dispatchEvent(new CustomEvent("users-data-changed"));

      refreshUsers?.();
      showToast("Data KK, susunan keluarga, dan akun login berhasil disimpan & disinkronkan!", "success");
      if (onFamilyUpdated) onFamilyUpdated(updated);
      onClose();
    } catch (err) {
      showToast(err.message || "Gagal menyimpan perubahan", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in my-2 sm:my-6">
        
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 theme-gradient-banner text-white flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/15 flex items-center justify-center backdrop-blur flex-shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base truncate">Lengkapi & Perbarui Data Keluarga (KK)</h3>
              <p className="text-[10px] sm:text-xs text-white/80 truncate">
                Pengisian data diri per KK, susunan anggota & akun login
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition flex-shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-5 space-y-3 sm:space-y-4 max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
          
          {/* Section 1: Informasi Rumah & KK */}
          <div className="bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 space-y-2.5 sm:space-y-3">
            <h4 className="text-[11px] sm:text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 theme-text-primary flex-shrink-0" /> Informasi Pokok Kartu Keluarga & Rumah
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
              <div className="col-span-2 sm:col-span-2">
                <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-0.5 sm:mb-1">
                  Nomor KK (16 Digit) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.kkNumber}
                  onChange={(e) => setFormData({ ...formData, kkNumber: e.target.value })}
                  placeholder="3201xxxxxxxxxxxx"
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-2">
                <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-0.5 sm:mb-1">
                  Nama Kepala Keluarga *
                </label>
                <input
                  type="text"
                  required
                  value={formData.headOfFamily}
                  onChange={(e) => {
                    const newHead = e.target.value;
                    const oldHead = formData.headOfFamily;
                    const updatedMembers = (formData.members || []).map(m => {
                      if (m?.relation === "Kepala Keluarga" || m?.fullName === oldHead) {
                        return { ...m, fullName: newHead };
                      }
                      return m;
                    });
                    setFormData({ ...formData, headOfFamily: newHead, members: updatedMembers });
                  }}
                  placeholder="Nama Kepala Keluarga"
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-0.5 sm:mb-1">
                  Blok Rumah
                </label>
                <select
                  value={formData.block || "Blok F4"}
                  onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                  className="w-full px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="Blok F4">Blok F4</option>
                  <option value="Blok F6">Blok F6</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-0.5 sm:mb-1">
                  Nomor Rumah *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: No. 01"
                  value={formData.houseNumber}
                  onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-0.5 sm:mb-1">
                  Status Rumah
                </label>
                <select
                  value={formData.houseStatus}
                  onChange={(e) => setFormData({ ...formData, houseStatus: e.target.value })}
                  className="w-full px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="Milik Sendiri">Milik Sendiri</option>
                  <option value="Kontrak">Kontrak</option>
                  <option value="Sewa / Kost">Sewa / Kost</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-0.5 sm:mb-1">
                  No. WhatsApp / HP
                </label>
                <input
                  type="text"
                  placeholder="0812-xxxx-xxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-0.5 sm:mb-1">
                  Kontak Darurat
                </label>
                <input
                  type="text"
                  placeholder="Nama & No. HP darurat"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-0.5 sm:mb-1">
                  Alamat Lengkap
                </label>
                <input
                  type="text"
                  placeholder="Gang Cinta, RT 028 RW 005..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Peran Kepengurusan RT / Gang & Hak Akses Akun (HANYA UNTUK ADMIN) */}
          {isAdmin && (
            <div className="bg-amber-50/60 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-amber-200/80 space-y-2.5 sm:space-y-3">
              <h4 className="text-[11px] sm:text-xs font-bold uppercase text-amber-900 tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" /> Struktur Kepengurusan RT / Gang & Akun Login
              </h4>

              {/* Status Peran / Jabatan (Ketik Manual) */}
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-0.5 sm:mb-1">
                  Status Peran / Jabatan Pengurus (Ketik Manual) *
                </label>
                <div className="relative">
                  <span className="text-sm sm:text-base absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 select-none">
                    {selectedIcon}
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Ketua RT, Sekretaris, Bendahara, Seksi..."
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    className="w-full pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white transition"
                  />
                </div>
              </div>

              {/* Pilih Ikon Simbol Jabatan Pengurus RT & Gang */}
              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Pilih Ikon Simbol Jabatan:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {PRESET_ICONS.map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => handleSelectPresetIcon(item)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg sm:rounded-xl text-xs border transition text-left ${
                        selectedIcon === item.icon
                          ? "theme-bg-light theme-border-light theme-text-primary-dark ring-2 ring-emerald-500 shadow-2xs font-extrabold bg-white"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="text-sm sm:text-base flex-shrink-0">{item.icon}</span>
                      <span className="truncate text-[10px] sm:text-[11px] font-semibold">{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 pt-0.5">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-0.5 sm:mb-1">
                    Username Login Akun *
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                    className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-0.5 sm:mb-1">
                    Password Akun *
                  </label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Daftar Anggota Keluarga dalam KK */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h4 className="text-[11px] sm:text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 theme-text-primary flex-shrink-0" /> Daftar Anggota Keluarga ({(formData.members || []).length} Orang)
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-400">
                  Data anggota keluarga yang tercatat di KK ini.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddMember}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl theme-bg-primary text-white text-[11px] sm:text-xs font-bold hover:opacity-90 shadow-xs transition active:scale-95 flex-shrink-0 cursor-pointer"
              >
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span>Tambah Anggota</span>
              </button>
            </div>

            {/* Member Form Inline if active */}
            {editingMember !== null && (
              <div 
                ref={memberFormRef}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50/70 border-2 border-emerald-400 shadow-sm space-y-2.5 sm:space-y-3 animate-fade-in"
              >
                <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5 sm:pb-2">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" />
                    <span>{editingMember === "NEW" ? "Tambah Anggota Baru" : "Edit Data Anggota"}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="text-slate-500 hover:text-slate-800 text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-lg hover:bg-white/60 transition cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-0.5 sm:mb-1">Nama Lengkap *</label>
                    <input
                      type="text"
                      value={memberForm.fullName}
                      onChange={(e) => setMemberForm({ ...memberForm, fullName: e.target.value })}
                      placeholder="Nama sesuai KTP/Akta"
                      className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-0.5 sm:mb-1">NIK (16 Digit)</label>
                    <input
                      type="text"
                      maxLength={16}
                      value={memberForm.nik}
                      onChange={(e) => setMemberForm({ ...memberForm, nik: e.target.value.replace(/\D/g, "") })}
                      placeholder="3201xxxxxxxxxxxx"
                      className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-0.5 sm:mb-1">Hubungan Keluarga</label>
                    <select
                      value={memberForm.relation}
                      onChange={(e) => setMemberForm({ ...memberForm, relation: e.target.value })}
                      className="w-full px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    >
                      <option value="Kepala Keluarga">Kepala Keluarga</option>
                      <option value="Istri">Istri</option>
                      <option value="Anak">Anak</option>
                      <option value="Orang Tua">Orang Tua</option>
                      <option value="Mertua">Mertua</option>
                      <option value="Famili Lain">Famili Lain</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-0.5 sm:mb-1">Jenis Kelamin</label>
                    <select
                      value={memberForm.gender}
                      onChange={(e) => setMemberForm({ ...memberForm, gender: e.target.value })}
                      className="w-full px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-0.5 sm:mb-1">Tempat Lahir</label>
                    <input
                      type="text"
                      value={memberForm.birthPlace}
                      onChange={(e) => setMemberForm({ ...memberForm, birthPlace: e.target.value })}
                      placeholder="Kota lahir"
                      className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-0.5 sm:mb-1">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={memberForm.birthDate}
                      onChange={(e) => setMemberForm({ ...memberForm, birthDate: e.target.value })}
                      className="w-full px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-0.5 sm:mb-1">Pekerjaan</label>
                    <input
                      type="text"
                      value={memberForm.job}
                      onChange={(e) => setMemberForm({ ...memberForm, job: e.target.value })}
                      placeholder="Pekerjaan"
                      className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="px-3 py-1.5 rounded-lg sm:rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveMember}
                    className="px-4 py-1.5 rounded-lg sm:rounded-xl theme-bg-primary text-white font-bold text-xs hover:opacity-90 transition shadow-xs active:scale-95 cursor-pointer"
                  >
                    Simpan Anggota
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Cards View (Visible on small screens) */}
            <div className="sm:hidden space-y-2">
              {(formData.members || []).map((m, idx) => (
                <div key={m?.id || idx} className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-xs truncate">{m?.fullName || "-"}</div>
                      <div className="text-[10px] text-slate-500 font-mono">NIK: {m?.nik || "-"}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0 ${
                      m?.relation === "Kepala Keluarga"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}>
                      {m?.relation || "-"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-slate-600 border-t border-slate-100 pt-1">
                    <div><span className="text-slate-400">JK:</span> {m?.gender || "-"}</div>
                    <div><span className="text-slate-400">Goldar:</span> {m?.bloodType || "-"}</div>
                    <div className="col-span-2 truncate"><span className="text-slate-400">Lahir:</span> {m?.birthPlace ? `${m.birthPlace}, ` : ""}{m?.birthDate || "-"}</div>
                    <div className="col-span-2 truncate"><span className="text-slate-400">Kerja:</span> {m?.job || "-"}</div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleOpenEditMember(m, idx)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 transition active:scale-95 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3 text-slate-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMember(idx)}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] flex items-center gap-1 transition active:scale-95 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3 text-rose-600" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Members Table (Hidden on small screens) */}
            <div className="hidden sm:block border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Nama Lengkap</th>
                      <th className="p-3">NIK</th>
                      <th className="p-3">Hubungan</th>
                      <th className="p-3">Jenis Kelamin</th>
                      <th className="p-3">Tempat, Tgl Lahir</th>
                      <th className="p-3">Pekerjaan</th>
                      <th className="p-3">Gol. Darah</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {(formData.members || []).map((m, idx) => (
                      <tr key={m?.id || idx} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-bold text-slate-800">{m?.fullName || "-"}</td>
                        <td className="p-3 text-slate-500 font-mono text-[11px]">{m?.nik || "-"}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            m?.relation === "Kepala Keluarga"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}>
                            {m?.relation || "-"}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">{m?.gender || "-"}</td>
                        <td className="p-3 text-slate-600">
                          {m?.birthPlace ? `${m.birthPlace}, ` : ""}
                          {m?.birthDate || "-"}
                        </td>
                        <td className="p-3 text-slate-600">{m?.job || "-"}</td>
                        <td className="p-3 text-slate-600 font-semibold">{m?.bloodType || "-"}</td>
                        <td className="p-3 text-right space-x-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditMember(m, idx)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMember(idx)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Footer Save Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-400">
              <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 theme-text-primary flex-shrink-0" />
              <span>Data dilindungi kerahasiaannya untuk tertib administrasi RT.</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition border border-slate-200 sm:border-transparent text-center cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl text-xs font-bold text-white theme-bg-primary shadow-md hover:opacity-90 transition active:scale-95 text-center cursor-pointer"
              >
                {isAdmin ? "Simpan Perubahan KK & Pengurus" : "Simpan Perubahan Data KK"}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}

