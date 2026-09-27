import React, { useState } from "react";
import { guestReportService, authService } from "../../services/storageService";
import { api } from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";
import { X, UserPlus, ShieldAlert, Calendar, Home, Phone, FileText, CheckCircle2 } from "lucide-react";

export default function GuestReportModal({ isOpen, onClose, onReportAdded }) {
  const { user, showToast } = useAuth();
  const allUsers = authService.getAllUsers() || [];
  const adminUser = allUsers.find(u => u.role === "admin");
  const adminName = adminUser?.name || "Suryadi S";

  const [guestName, setGuestName] = useState("");
  const [guestNik, setGuestNik] = useState("");
  const [guestKkNumber, setGuestKkNumber] = useState("");
  const [guestAddress, setGuestAddress] = useState("");
  const [relationship, setRelationship] = useState("Orang Tua / Mertua");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [durationDays, setDurationDays] = useState(3);
  const [contactPhone, setContactPhone] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!guestName.trim()) {
      showToast("Mohon lengkapi Nama Lengkap Tamu", "error");
      return;
    }

    const finalNik = guestNik.trim() || guestKkNumber.trim();
    if (!finalNik) {
      showToast("Mohon isi NIK atau Nomor KK Tamu", "error");
      return;
    }

    if (!guestAddress.trim()) {
      showToast("Mohon lengkapi Alamat Asal Tamu", "error");
      return;
    }

    const calculatedEndDate = new Date(new Date(startDate).getTime() + Number(durationDays) * 24 * 60 * 60 * 1000)
      .toISOString().split("T")[0];

    const reportData = {
      guestName: guestName.trim(),
      guestNik: guestNik.trim() || guestKkNumber.trim(),
      guestKkNumber: guestKkNumber.trim() || guestNik.trim(),
      guestAddress: guestAddress.trim(),
      relationship,
      startDate,
      durationDays: Number(durationDays),
      endDate: calculatedEndDate,
      contactPhone: contactPhone.trim(),
      reason: reason.trim(),
      houseNumber: user?.houseNo || "No. 04",
      reporterUserId: user?.id,
      reporterName: user?.name
    };

    setIsSubmitting(true);
    let newReport = null;
    try {
      newReport = await api.addGuestReport(reportData);
    } catch {
      // fallback to storage
    }
    const localReport = guestReportService.addGuestReport(reportData, user);
    if (!newReport) newReport = localReport;

    setIsSubmitting(false);
    showToast(`Laporan tamu berhasil dikirim ke Ketua Gang (${adminName}) untuk ijin!`, "success");
    if (onReportAdded) onReportAdded(newReport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in my-auto max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 bg-gradient-to-r from-slate-900 to-rose-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur">
              <UserPlus className="w-5 h-5 text-rose-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">Formulir Lapor Tamu Menginap</h3>
              <p className="text-[11px] sm:text-xs text-rose-200">Wajib 1x24 jam • Persetujuan ijin oleh Ketua Gang Cinta</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Enclosing Body and Footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1">
            {/* Privacy & Approval Notice Alert */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <strong>Persetujuan Ketua Gang:</strong> Data tamu yang dilaporkan <strong>hanya dapat dilihat oleh Anda dan Ketua Gang Cinta ({adminName})</strong>. Ketua Gang akan memeriksa dan menetapkan ijin menginap demi keamanan & ketertiban siskamling lingkungan.
              </div>
            </div>

            {/* Field 1: Nama Lengkap Tamu */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Lengkap Tamu (Sesuai KTP/KK) *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Bambang Wijaya"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none transition"
              />
            </div>

            {/* Field 2 & 3: NIK & Nomor KK Tamu side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  NIK Tamu (KTP) *
                </label>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="16 digit NIK KTP tamu"
                  value={guestNik}
                  onChange={(e) => setGuestNik(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nomor KK Tamu (Opsional)
                </label>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="Nomor KK asal tamu"
                  value={guestKkNumber}
                  onChange={(e) => setGuestKkNumber(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Field 4 & 5: Hubungan Keluarga & Telepon Tamu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Hubungan Keluarga dengan Tuan Rumah *
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none transition bg-white"
                >
                  <option value="Orang Tua / Mertua">Orang Tua / Mertua</option>
                  <option value="Anak Kandung">Anak Kandung</option>
                  <option value="Kakak / Adik Kandung">Kakak / Adik Kandung</option>
                  <option value="Saudara Ipar">Saudara Ipar</option>
                  <option value="Paman / Bibi / Kerabat">Paman / Bibi / Kerabat</option>
                  <option value="Teman / Kolega">Teman / Kolega</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  No. Telp / WhatsApp Tamu (Opsional)
                </label>
                <input
                  type="tel"
                  placeholder="0812-xxxx-xxxx"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Field 6 & 7: Tanggal & Durasi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tanggal Mulai Menginap *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Estimasi Lama Menginap *
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-l-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none transition"
                  />
                  <span className="bg-slate-100 border border-l-0 border-slate-300 px-3 py-2.5 text-xs font-bold text-slate-600 rounded-r-xl">
                    Hari
                  </span>
                </div>
              </div>
            </div>

            {/* Field 8: Alamat Asal */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Alamat Lengkap Asal (Sesuai KTP) *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Jl. Diponegoro No. 45, RT 02/01, Banyumas, Jawa Tengah"
                value={guestAddress}
                onChange={(e) => setGuestAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none transition"
              />
            </div>

            {/* Field 9: Keperluan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Alasan / Keperluan Menginap
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Contoh: Silaturahmi keluarga, kontrol kesehatan ke rumah sakit, atau keperluan wisuda..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none transition resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 shadow-lg shadow-rose-700/30 transition disabled:opacity-50"
            >
              {isSubmitting ? "Mengirim..." : "Kirim Laporan ke Ketua Gang"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
