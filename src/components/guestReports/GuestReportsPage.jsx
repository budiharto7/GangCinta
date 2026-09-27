import React, { useState, useEffect } from "react";
import { guestReportService, welcomeService } from "../../services/storageService";
import { api } from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";
import { 
  UserPlus, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle,
  Clock, 
  Calendar, 
  Home, 
  Phone, 
  Trash2, 
  Check, 
  X,
  Search, 
  Lock,
  MessageSquare,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  FileText,
  UserCheck,
  Edit2
} from "lucide-react";
import GuestReportModal from "./GuestReportModal";
import RichTextEditor from "../common/RichTextEditor";
import GangCintaLogo from "../common/GangCintaLogo";

export default function GuestReportsPage({ isReportOpen, setIsReportOpen }) {
  const { user, allUsers, showToast } = useAuth();
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const adminUser = (allUsers || []).find(u => u.role === "admin");
  const activeAdminName = adminUser?.name || "Suryadi S";

  // Editable Header Config State for Ketua Gang
  const [guestHeaderConfig, setGuestHeaderConfig] = useState({
    title: "Pelaporan Tamu & Keluarga Menginap",
    description: "Aturan wajib lapor 1x24 jam. Ijin / persetujuan tamu menginap hanya dapat diberikan oleh Ketua Gang Cinta demi kenyamanan & keamanan warga Perumahan Bumi Nagara Lestari."
  });
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [tempGuestTitle, setTempGuestTitle] = useState("");
  const [tempGuestDesc, setTempGuestDesc] = useState("");

  const getReporterName = (report) => {
    if (!report) return "";
    const userObj = (allUsers || []).find(u => u.id === report.reporterUserId);
    if (userObj?.name) return userObj.name;
    return report.reporterName || "Warga Gang Cinta";
  };

  // State for Decision Modal (Khusus Ketua Gang)
  const [decisionModal, setDecisionModal] = useState({
    isOpen: false,
    report: null,
    action: "approve", // 'approve' | 'reject'
    note: ""
  });

  const loadReports = async () => {
    try {
      const data = await api.getGuestReports(user);
      if (Array.isArray(data) && data.length > 0) {
        setReports(data);
        return;
      }
    } catch (e) {
      // fallback to storage
    }
    setReports(guestReportService.getGuestReports(user));
  };

  useEffect(() => {
    loadReports();
    setGuestHeaderConfig(welcomeService.getGuestReportHeaderConfig());

    const handleHeaderChange = () => {
      setGuestHeaderConfig(welcomeService.getGuestReportHeaderConfig());
    };

    window.addEventListener("guest-report-header-changed", handleHeaderChange);
    window.addEventListener("storage", handleHeaderChange);

    return () => {
      window.removeEventListener("guest-report-header-changed", handleHeaderChange);
      window.removeEventListener("storage", handleHeaderChange);
    };
  }, [user]);

  const isKetuaGang = user?.role === "admin";

  const filteredReports = reports.filter((r) => {
    const isApproved = r.status === "approved" || r.status === "verified";
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "pending" && r.status === "pending") ||
      (statusFilter === "approved" && isApproved) ||
      (statusFilter === "rejected" && r.status === "rejected");

    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (r.guestName && r.guestName.toLowerCase().includes(q)) ||
      (r.reporterName && r.reporterName.toLowerCase().includes(q)) ||
      (r.houseNumber && r.houseNumber.toLowerCase().includes(q)) ||
      (r.guestNik && r.guestNik.includes(q)) ||
      (r.guestAddress && r.guestAddress.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  // Open Decision Modal for Ketua Gang
  const handleOpenDecision = (report, action) => {
    if (!isKetuaGang) {
      showToast("Hanya Ketua Gang yang berwenang memberikan ijin tamu!", "error");
      return;
    }
    const defaultNote = action === "approve"
      ? "Diijinkan oleh Ketua Gang Cinta (Perumahan Bumi Nagara Lestari RT 028 RW 005). Harap mematuhi tata tertib lingkungan dan parkir rapi."
      : "Mohon maaf, ijin belum dapat diberikan karena kapasitas rumah dan batas durasi menginap.";

    setDecisionModal({
      isOpen: true,
      report,
      action,
      note: report.notesFromAdmin || defaultNote
    });
  };

  // Submit Decision from Ketua Gang
  const handleSaveDecision = async (e) => {
    e.preventDefault();
    if (!decisionModal.report) return;

    const reportId = decisionModal.report.id;
    const newStatus = decisionModal.action === "approve" ? "approved" : "rejected";
    const decisionMeta = {
      decisionBy: `${user?.name || activeAdminName} (Ketua Gang Cinta)`,
      decisionDate: new Date().toISOString()
    };

    try {
      await api.updateGuestReport(reportId, {
        status: newStatus,
        notesFromAdmin: decisionModal.note,
        ...decisionMeta
      });
    } catch (err) {
      // fallback
    }

    guestReportService.updateReportStatus(
      reportId, 
      newStatus, 
      decisionModal.note, 
      decisionMeta
    );

    loadReports();
    setDecisionModal({ isOpen: false, report: null, action: "approve", note: "" });

    if (newStatus === "approved") {
      showToast("Tamu berhasil DIIJINKAN oleh Ketua Gang!", "success");
    } else {
      showToast("Tamu TIDAK DIIJINKAN oleh Ketua Gang.", "info");
    }
  };

  const handleDelete = async (reportId, guestName) => {
    if (window.confirm(`Hapus data laporan tamu atas nama ${guestName}?`)) {
      try {
        await api.deleteGuestReport(reportId);
      } catch (e) {
        // fallback
      }
      guestReportService.deleteReport(reportId);
      loadReports();
      showToast("Laporan tamu telah dihapus.", "info");
    }
  };

  return (
    <div className="space-y-6 pb-24 sm:pb-16">
      
      {/* Header Banner - Matching Dashboard, Gallery & Finance Gradient Banner */}
      <div className="relative overflow-hidden rounded-3xl theme-gradient-banner text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-6 -bottom-6 opacity-20 pointer-events-none z-0 hidden sm:block">
          <GangCintaLogo size="xl" variant="plain" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3.5 max-w-3xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <GangCintaLogo size="sm" variant="badge" />
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-2xs">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
                Keamanan & Ketertiban Gang Cinta
              </div>
              <span className="text-xs px-3.5 py-1.5 rounded-full bg-white/15 font-extrabold text-white border border-white/20 backdrop-blur-md shadow-2xs">
                RT 028 RW 005
              </span>
            </div>

            {isEditingHeader ? (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!tempGuestTitle.trim()) return;
                  const updated = {
                    ...guestHeaderConfig,
                    title: tempGuestTitle,
                    description: tempGuestDesc
                  };
                  welcomeService.setGuestReportHeaderConfig(updated);
                  setGuestHeaderConfig(updated);
                  setIsEditingHeader(false);
                  showToast("Judul & deskripsi pelaporan tamu berhasil disimpan!", "success");
                }}
                className="space-y-3 w-full my-2"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Judul Halaman:</label>
                  <input
                    type="text"
                    required
                    value={tempGuestTitle}
                    onChange={(e) => setTempGuestTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white text-slate-900 border-2 border-emerald-400 font-extrabold text-base focus:outline-none shadow-xs"
                    placeholder="Judul Pelaporan Tamu..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Deskripsi & Aturan (Format teks yang diblok):</label>
                  <RichTextEditor
                    value={tempGuestDesc}
                    onChange={(val) => setTempGuestDesc(val)}
                    placeholder="Tuliskan aturan pelaporan tamu..."
                    minHeight="90px"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Simpan Perubahan
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingHeader(false)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/30 transition active:scale-95 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Batal
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-xs">
                    {guestHeaderConfig.title || "Pelaporan Tamu & Keluarga Menginap"}
                  </h1>
                  {isKetuaGang && (
                    <button
                      type="button"
                      onClick={() => {
                        setTempGuestTitle(guestHeaderConfig.title || "Pelaporan Tamu & Keluarga Menginap");
                        setTempGuestDesc(guestHeaderConfig.description || `Aturan wajib lapor 1x24 jam. Ijin / persetujuan tamu menginap hanya dapat diberikan oleh Ketua Gang Cinta (${activeAdminName}) demi kenyamanan & keamanan warga Perumahan Bumi Nagara Lestari.`);
                        setIsEditingHeader(true);
                      }}
                      className="inline-flex items-center justify-center p-1.5 ml-2 rounded-lg bg-white/20 hover:bg-white/35 text-white border border-white/30 backdrop-blur transition active:scale-95 shadow-2xs cursor-pointer align-middle"
                      title="Ubah Judul & Deskripsi Pelaporan Tamu"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-300" />
                    </button>
                  )}
                </div>

                <div 
                  className="text-slate-200 text-xs sm:text-sm max-w-3xl leading-relaxed opacity-95"
                  dangerouslySetInnerHTML={{
                    __html: guestHeaderConfig.description || `Aturan wajib lapor 1x24 jam. Ijin / persetujuan tamu menginap hanya dapat diberikan oleh Ketua Gang Cinta (${activeAdminName}) demi kenyamanan & keamanan warga Perumahan Bumi Nagara Lestari.`
                  }}
                />
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsReportOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-900 font-extrabold text-xs transition shadow-lg hover:bg-slate-100 active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-emerald-600" />
              Lapor Tamu / Keluarga Baru
            </button>
          </div>
        </div>
      </div>

      {/* Authority & Strict Privacy Banner - Vibrant & Theme Infused */}
      <div className="relative overflow-hidden p-4 sm:p-5 rounded-3xl theme-gradient-banner text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl border border-white/20 transition-all">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-white/20 border border-white/30 text-amber-300 mt-0.5 flex-shrink-0 backdrop-blur-md">
            {isKetuaGang ? <ShieldCheck className="w-5 h-5 text-amber-300" /> : <Lock className="w-5 h-5 text-amber-300" />}
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
              {isKetuaGang ? `Wewenang Khusus Ketua Gang Cinta (${activeAdminName})` : "Jaminan Privasi Data Tamu Menginap"}
            </h4>
            <p className="text-xs text-white/80 mt-0.5 max-w-2xl leading-relaxed">
              {isKetuaGang
                ? "Sebagai Ketua Gang Cinta, Anda memiliki hak penuh untuk memeriksa, memberikan ijin ('Ijinkan Tamu'), atau menolak ('Tidak Diijinkan') laporan tamu demi keamanan warga Gang Cinta Perumahan Bumi Nagara Lestari RT 028 RW 005."
                : `Anda login sebagai ${user?.name || "Warga"}. Data tamu Anda bersifat privat: hanya Anda dan Ketua Gang yang dapat melihat laporan ini. Keputusan ijin tamu berada di tangan Ketua Gang.`}
            </p>
          </div>
        </div>

        <div className="relative z-10 text-xs px-3.5 py-1.5 rounded-full bg-white/20 border border-white/30 text-white font-extrabold backdrop-blur-md whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5">
          {isKetuaGang ? (
            <>
              <UserCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Ketua Gang: Akses Persetujuan Ijin</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5 text-amber-300" />
              <span>Akses Privat Warga</span>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar - Mobile Responsive & Theme Infused */}
      <div className="relative overflow-hidden flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 theme-gradient-banner text-white p-3.5 rounded-2xl border border-white/20 shadow-lg transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0 w-full sm:w-auto">
          {[
            { id: "all", label: "Semua Laporan" },
            { id: "pending", label: "⏳ Menunggu Keputusan" },
            { id: "approved", label: "✓ Diijinkan" },
            { id: "rejected", label: "✕ Tidak Diijinkan" }
          ].map((status) => {
            const isActive = statusFilter === status.id;
            let activeColorClass = "bg-amber-300 text-slate-900 border-amber-200";
            if (status.id === "approved") activeColorClass = "bg-emerald-500 text-white border-emerald-300";
            if (status.id === "rejected") activeColorClass = "bg-rose-500 text-white border-rose-300";
            if (status.id === "pending") activeColorClass = "bg-amber-400 text-slate-900 border-amber-300";

            return (
              <button
                key={status.id}
                onClick={() => setStatusFilter(status.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex-shrink-0 backdrop-blur-md ${
                  isActive
                    ? `${activeColorClass} shadow-md border`
                    : "bg-white/15 text-white border border-white/20 hover:bg-white/25"
                }`}
              >
                {status.label}
              </button>
            );
          })}
        </div>

        <div className="relative z-10 w-full sm:w-72">
          <Search className="w-4 h-4 text-white/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari tamu, NIK, alamat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/30 text-xs text-white placeholder-white/70 bg-white/20 backdrop-blur-md focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 focus:ring-2 focus:ring-amber-300 focus:outline-none transition shadow-inner"
          />
        </div>
      </div>

      {/* Guest Reports Cards List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="relative overflow-hidden text-center py-16 theme-gradient-banner text-white rounded-3xl border border-white/20 p-8 space-y-3 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto text-amber-300">
              <UserPlus className="w-8 h-8" />
            </div>
            <h3 className="text-base font-extrabold text-white">Belum Ada Laporan Tamu</h3>
            <p className="text-xs text-white/80 max-w-sm mx-auto">
              Tidak ada data laporan tamu menginap sesuai filter yang dipilih.
            </p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const isApproved = report.status === "approved" || report.status === "verified";
            const isRejected = report.status === "rejected";
            const isPending = !isApproved && !isRejected;

            return (
              <div
                key={report.id}
                className={`group relative overflow-hidden rounded-3xl theme-gradient-banner text-white p-5 sm:p-6 shadow-md hover:shadow-2xl transition-all duration-300 space-y-4 border ${
                  isApproved 
                    ? "border-emerald-300/50 ring-1 ring-emerald-300/30" 
                    : isRejected 
                    ? "border-rose-300/50 ring-1 ring-rose-300/30" 
                    : "border-white/20"
                }`}
              >
                {/* Header Card: Guest Name, Relationship, Status & Actions */}
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-white/20 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-black text-base border flex-shrink-0 bg-white/20 backdrop-blur-md border-white/30 text-amber-300 shadow-md">
                      {report.guestName ? report.guestName.charAt(0) : "T"}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-sm sm:text-base text-white break-words group-hover:text-amber-300 transition">
                          {report.guestName}
                        </h3>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/20 text-white font-extrabold border border-white/30 backdrop-blur-md">
                          {report.relationship}
                        </span>

                        {/* Status Badge */}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-300/40">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                            ✓ Diijinkan Ketua Gang
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-300/40">
                            <XCircle className="w-3.5 h-3.5 text-rose-300" />
                            ✕ Tidak Diijinkan
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-300/40">
                            <Clock className="w-3.5 h-3.5 text-amber-300" />
                            ⏳ Menunggu Keputusan Ketua Gang
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-white/80">
                        Tuan Rumah: <strong className="text-white">{getReporterName(report)}</strong> ({report.houseNumber})
                      </p>
                    </div>
                  </div>

                  {/* ACTION BUTTONS (Khusus Ketua Gang vs Warga) */}
                  <div className="flex items-center gap-2 self-stretch sm:self-auto pt-2 sm:pt-0 justify-end flex-wrap">
                    
                    {/* KHUSUS KETUA GANG: Tombol Ijinkan & Tolak */}
                    {isKetuaGang ? (
                      <>
                        {isPending ? (
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => handleOpenDecision(report, "approve")}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md transition transform active:scale-95 border border-emerald-300 cursor-pointer"
                              title="Ijinkan Tamu Menginap"
                            >
                              <Check className="w-4 h-4" />
                              <span>✓ Ijinkan Tamu</span>
                            </button>

                            <button
                              onClick={() => handleOpenDecision(report, "reject")}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow-md transition transform active:scale-95 border border-rose-300 cursor-pointer"
                              title="Tolak Ijin Tamu"
                            >
                              <X className="w-4 h-4" />
                              <span>✕ Tolak</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenDecision(report, isApproved ? "reject" : "approve")}
                            className="text-xs font-extrabold px-3 py-1.5 rounded-full border border-white/30 bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition cursor-pointer"
                          >
                            Ubah Keputusan / Catatan
                          </button>
                        )}
                      </>
                    ) : (
                      /* NON-KETUA GANG (Warga): Hanya melihat status badge */
                      <div className="text-[11px] text-white/70 hidden sm:block">
                        {isPending ? "Menunggu respon Ketua Gang..." : "Keputusan telah ditetapkan"}
                      </div>
                    )}

                    {/* Delete button (Admin or owner of pending report) */}
                    {(isKetuaGang || (report.reporterUserId === user?.id && isPending)) && (
                      <button
                        onClick={() => handleDelete(report.id, report.guestName)}
                        className="p-2 rounded-full bg-rose-500/30 hover:bg-rose-500/40 text-rose-200 border border-rose-300/40 transition cursor-pointer"
                        title="Hapus Laporan Tamu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Identity & Details Grid - Mobile-Friendly 1 col on mobile, 2 sm, 4 lg */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3.5 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs shadow-inner">
                  <div>
                    <span className="text-white/70 font-semibold block text-[11px]">NIK Tamu:</span>
                    <span className="font-mono font-bold text-white break-all">{report.guestNik}</span>
                  </div>

                  <div>
                    <span className="text-white/70 font-semibold block text-[11px]">Nomor KK Tamu:</span>
                    <span className="font-mono font-bold text-white break-all">{report.guestKkNumber || "-"}</span>
                  </div>

                  <div>
                    <span className="text-white/70 font-semibold block text-[11px]">Jadwal Menginap:</span>
                    <span className="font-extrabold text-amber-300">
                      {report.startDate} ({report.durationDays} hari)
                    </span>
                  </div>

                  <div>
                    <span className="text-white/70 font-semibold block text-[11px]">Nomor Telepon:</span>
                    <span className="font-bold text-white">{report.contactPhone || "-"}</span>
                  </div>
                </div>

                {/* Address & Reason */}
                <div className="relative z-10 space-y-2 text-xs text-white/90">
                  <div className="flex items-start gap-2">
                    <Home className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Alamat Asal Sesuai KTP:</strong> {report.guestAddress}</span>
                  </div>
                  {report.reason && (
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                      <span><strong className="text-white">Keperluan / Alasan:</strong> {report.reason}</span>
                    </div>
                  )}

                  {/* Decision & Notes Banner from Ketua Gang */}
                  {report.notesFromAdmin && (
                    <div className="p-3.5 rounded-2xl border text-xs mt-2 flex items-start gap-2.5 bg-white/10 backdrop-blur-md border-white/20 text-white">
                      <div className="mt-0.5">
                        {isApproved ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <AlertTriangle className="w-4 h-4 text-rose-300" />}
                      </div>
                      <div>
                        <strong className="block mb-0.5 text-white">
                          {isApproved ? `Ijin & Arahan dari Ketua Gang (${activeAdminName}):` : "Alasan Penolakan dari Ketua Gang:"}
                        </strong>
                        <p className="leading-relaxed text-white/90">{report.notesFromAdmin.replace(/Ketua RT/g, "Ketua Gang")}</p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Modal Lapor Tamu (Bisa diisi oleh Warga) */}
      <GuestReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onReportAdded={loadReports}
      />

      {/* Modal Keputusan Ijin Tamu (KHUSUS KETUA GANG) */}
      {decisionModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md theme-gradient-banner text-white rounded-3xl shadow-2xl border border-white/30 overflow-hidden animate-fade-in p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-white/20 pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white border border-white/30 ${
                  decisionModal.action === "approve" ? "bg-emerald-500/40" : "bg-rose-500/40"
                }`}>
                  {decisionModal.action === "approve" ? <Check className="w-5 h-5 text-emerald-300" /> : <X className="w-5 h-5 text-rose-300" />}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">
                    {decisionModal.action === "approve" ? "Ijinkan Tamu Menginap" : "Tolak Ijin Tamu Menginap"}
                  </h4>
                  <p className="text-[11px] text-white/80">Keputusan Resmi Ketua Gang Cinta (RT 028)</p>
                </div>
              </div>
              <button
                onClick={() => setDecisionModal({ isOpen: false, report: null, action: "approve", note: "" })}
                className="p-1.5 rounded-lg text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-xs space-y-1 text-white">
              <p><strong>Nama Tamu:</strong> {decisionModal.report?.guestName}</p>
              <p><strong>Tuan Rumah:</strong> {decisionModal.report?.reporterName} ({decisionModal.report?.houseNumber})</p>
              <p><strong>Lama Menginap:</strong> {decisionModal.report?.durationDays} Hari ({decisionModal.report?.startDate})</p>
            </div>

            <form onSubmit={handleSaveDecision} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  {decisionModal.action === "approve" 
                    ? "Catatan / Arahan untuk Tuan Rumah (Opsional)" 
                    : "Alasan Penolakan Ijin (Wajib disampaikan ke warga)"}
                </label>
                <textarea
                  rows={3}
                  required={decisionModal.action === "reject"}
                  value={decisionModal.note}
                  onChange={(e) => setDecisionModal({ ...decisionModal, note: e.target.value })}
                  placeholder={
                    decisionModal.action === "approve"
                      ? "Contoh: Diijinkan. Mohon menjaga ketertiban ronda dan memarkir kendaraan rapi..."
                      : "Contoh: Mohon maaf, kapasitas rumah penuh atau durasi melebihi batas ketentuan..."
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/30 text-xs text-white placeholder-white/70 bg-white/20 backdrop-blur-md focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 focus:ring-2 focus:ring-amber-300 focus:outline-none transition resize-none shadow-inner"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDecisionModal({ isOpen: false, report: null, action: "approve", note: "" })}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white/80 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md transition border cursor-pointer ${
                    decisionModal.action === "approve"
                      ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-300"
                      : "bg-rose-500 hover:bg-rose-600 border-rose-300"
                  }`}
                >
                  {decisionModal.action === "approve" ? "✓ Konfirmasi & Ijinkan" : "✕ Tetapkan Tolak Ijin"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

