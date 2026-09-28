import React, { useState, useEffect } from "react";
import { financeService, approvalService, signatureService } from "../../services/storageService";
import { useAuth } from "../../context/AuthContext";
import { usePolling } from "../../hooks/usePolling";
import { 
  WalletCards, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Edit3, 
  Trash2, 
  Trash2 as TrashIcon,
  ShieldCheck,
  Home,
  HeartHandshake,
  Trophy,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  Wallet,
  Printer,
  Download,
  FileText,
  PenTool,
  Check,
  AlertCircle
} from "lucide-react";
import TransactionModal from "./TransactionModal";
import StartingBalanceModal from "./StartingBalanceModal";
import FinancialCalendar from "./FinancialCalendar";
import PrintFinanceModal from "./PrintFinanceModal";
import SignatureUploadModal from "./SignatureUploadModal";
import DuesStatusTab from "./DuesStatusTab";
import { exportToWord, exportToExcelFormatted } from "../../utils/reportExporter";
import { formatRupiah, formatRupiahParts } from "../../utils/numberUtils";
import GangCintaLogo from "../common/GangCintaLogo";

export default function FinancePage({ isTransactionOpen, setIsTransactionOpen }) {
  const { user, showToast } = useAuth();
  
  const [currentMonthKey, setCurrentMonthKey] = useState("2026-09");
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState("dues_status"); // dues_status | table | calendar | expenses | all
  const [isStartingBalanceOpen, setIsStartingBalanceOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState("");
  const [prefilledCategory, setPrefilledCategory] = useState("");
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [approvalState, setApprovalState] = useState(approvalService.getMonthApproval(currentMonthKey));
  const [signatures, setSignatures] = useState(signatureService.getSignatures());

  const categories = financeService.getCategories();

  const loadData = () => {
    setSummary(financeService.getMonthlySummary(currentMonthKey));
    setApprovalState(approvalService.getMonthApproval(currentMonthKey));
    setSignatures(signatureService.getSignatures());
  };

  useEffect(() => {
    loadData();
  }, [currentMonthKey]);

  // Auto-polling: data keuangan update otomatis setiap 10 detik
  usePolling(loadData, 10000);

  const handleOpenEditTransaction = (trx) => {
    setEditingTransaction(trx);
    setPrefilledCategory(trx.category || "");
    setIsTransactionOpen(true);
  };

  const handleOpenInputForPos = (catId) => {
    setEditingTransaction(null);
    setPrefilledCategory(catId);
    setPrefilledDate(new Date().toISOString().split("T")[0]);
    setIsTransactionOpen(true);
  };

  const handleClearPosData = (catId, catName) => {
    if (window.confirm(`Bersihkan / reset seluruh catatan transaksi & saldo pos '${catName}' untuk periode ${currentMonthKey} jika terjadi kesalahan?`)) {
      financeService.clearCategoryData(currentMonthKey, catId);
      loadData();
      showToast(`Data pos '${catName}' periode ${currentMonthKey} berhasil dibersihkan!`, "info");
    }
  };

  const handleToggleApproval = (role) => {
    const updated = approvalService.toggleApproval(currentMonthKey, role, user?.name);
    setApprovalState(updated);
    const isNowApproved = role === "admin" ? updated.adminApproved : updated.bendaharaApproved;
    showToast(
      isNowApproved 
        ? `Laporan Kas bulan ini berhasil disetujui oleh ${role === "admin" ? "Ketua Gang" : "Bendahara"}!`
        : `Persetujuan laporan oleh ${role === "admin" ? "Ketua Gang" : "Bendahara"} dibatalkan.`
    );
  };

  if (!summary) return null;

  const getCategoryObj = (catId) => {
    return categories.find(c => c.id === catId);
  };

  const getCategoryIcon = (catId) => {
    switch (catId) {
      case "sampah": return <TrashIcon className="w-4 h-4 text-emerald-600" />;
      case "keamanan": return <ShieldCheck className="w-4 h-4 text-indigo-600" />;
      case "kas": return <Home className="w-4 h-4 text-blue-600" />;
      case "sosial": return <HeartHandshake className="w-4 h-4 text-amber-600" />;
      case "olahraga": return <Trophy className="w-4 h-4 text-rose-600" />;
      default: return <WalletCards className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleDeleteTransaction = (id, title) => {
    if (window.confirm(`Hapus catatan transaksi '${title}'?`)) {
      financeService.deleteTransaction(id);
      loadData();
      showToast("Transaksi kas telah dihapus.", "info");
    }
  };

  const handleOpenAddWithDate = (dateStr) => {
    setPrefilledDate(dateStr);
    setIsTransactionOpen(true);
  };

  const handleDownloadWord = () => {
    exportToWord(summary, currentMonthKey, categories);
    showToast(`Dokumen Word (.doc) laporan kas berhasil diunduh!`, "success");
  };

  const handleDownloadExcel = () => {
    exportToExcelFormatted(summary, currentMonthKey, categories);
    showToast(`Laporan Excel (.xls) dengan format resmi berhasil diunduh!`, "success");
  };

  return (
    <div className="space-y-6 pb-24 sm:pb-12">
      
      {/* Header Banner - Matching Dashboard & Gallery Gradient Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl theme-gradient-banner text-white p-4 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-6 -bottom-6 opacity-20 pointer-events-none z-0 hidden sm:block">
          <GangCintaLogo size="xl" variant="plain" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-3.5 max-w-3xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <GangCintaLogo size="sm" variant="badge" />
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-2xs">
                <WalletCards className="w-3.5 h-3.5 text-amber-300" />
                Pembukuan Kas Gang Cinta
              </div>
              <span className="text-xs px-3.5 py-1.5 rounded-full bg-white/15 font-extrabold text-white border border-white/20 backdrop-blur-md shadow-2xs">
                RT 028 RW 005
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-xs">
              Laporan Keuangan & Status Iuran Warga
            </h1>

            <p className="text-slate-200 text-xs sm:text-sm max-w-3xl leading-relaxed opacity-95">
              Status iuran bulanan warga (Lunas / Belum Bayar), notifikasi WA pengingat otomatis, dan transparansi kas 5 pos terpisah.
            </p>
          </div>

          {/* Month Picker & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 z-10">
            <select
              value={currentMonthKey}
              onChange={(e) => setCurrentMonthKey(e.target.value)}
              className="px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-full border border-white/30 text-[11px] sm:text-xs font-bold bg-slate-900/80 text-white backdrop-blur-md shadow-xs focus:ring-2 focus:ring-amber-400 focus:outline-none cursor-pointer"
            >
              <option value="2026-09" className="bg-slate-900 text-white">September 2026</option>
              <option value="2026-08" className="bg-slate-900 text-white">Agustus 2026</option>
              <option value="2026-07" className="bg-slate-900 text-white">Juli 2026</option>
            </select>

            {/* Export & Print Buttons */}
            {(user?.role === "admin" || user?.role === "bendahara") ? (
              <>
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold text-[11px] sm:text-xs backdrop-blur-md shadow-md transition active:scale-95 cursor-pointer"
                  title="Pratinjau & Cetak Laporan Keuangan"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-300" />
                  <span>Print Laporan</span>
                </button>

                <button
                  onClick={handleDownloadWord}
                  className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full bg-blue-500/80 hover:bg-blue-600/90 text-white font-bold text-[11px] sm:text-xs backdrop-blur-md shadow-md transition active:scale-95 border border-blue-400/40 cursor-pointer"
                  title="Download Dokumen Microsoft Word (.doc)"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-200" />
                  <span>Word (.doc)</span>
                </button>

                <button
                  onClick={handleDownloadExcel}
                  className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full bg-emerald-500/80 hover:bg-emerald-600/90 text-white font-bold text-[11px] sm:text-xs backdrop-blur-md shadow-md transition active:scale-95 border border-emerald-400/40 cursor-pointer"
                  title="Download Dokumen Microsoft Excel (.xls)"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Excel (.xls)</span>
                </button>
              </>
            ) : (
              <div className="text-[11px] sm:text-xs font-medium text-white/90 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/20">
                👁️ Transparansi Kas Gang Cinta
              </div>
            )}

            {(user?.role === "bendahara" || user?.role === "admin") && (
              <>
                <button
                  onClick={() => {
                    setPrefilledDate(new Date().toISOString().split("T")[0]);
                    setIsTransactionOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white text-slate-900 font-extrabold text-[11px] sm:text-xs shadow-lg transition transform active:scale-95 hover:bg-slate-100 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Catat Transaksi</span>
                </button>

                <button
                  onClick={() => setIsStartingBalanceOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-[11px] sm:text-xs border border-white/20 backdrop-blur-md transition cursor-pointer"
                  title="Atur Saldo Awal 5 Pos"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Saldo Awal</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Monthly Balances Overview Card */}
      <div className="theme-gradient-banner text-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-xs text-slate-200 font-semibold uppercase tracking-wider">
              Rekapitulasi Total Kas Lingkungan
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              Bulan {currentMonthKey === "2026-09" ? "September 2026" : currentMonthKey}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Action Buttons for Signatures & Approvals */}
            {user?.role === "admin" && (
              <button
                onClick={() => handleToggleApproval("admin")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition backdrop-blur shadow-2xs border ${
                  approvalState.adminApproved
                    ? "bg-emerald-500/30 text-emerald-100 border-emerald-400/50 hover:bg-emerald-500/40"
                    : "bg-amber-500/30 text-amber-100 border-amber-400/50 hover:bg-amber-500/40"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{approvalState.adminApproved ? "Disetujui Ketua ✅" : "+ Setujui Laporan (Ketua)"}</span>
              </button>
            )}

            {user?.role === "bendahara" && (
              <button
                onClick={() => handleToggleApproval("bendahara")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition backdrop-blur shadow-2xs border ${
                  approvalState.bendaharaApproved
                    ? "bg-emerald-500/30 text-emerald-100 border-emerald-400/50 hover:bg-emerald-500/40"
                    : "bg-amber-500/30 text-amber-100 border-amber-400/50 hover:bg-amber-500/40"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{approvalState.bendaharaApproved ? "Disetujui Bendahara ✅" : "+ Setujui Laporan (Bendahara)"}</span>
              </button>
            )}

            {(user?.role === "admin" || user?.role === "bendahara") && (
              <button
                onClick={() => setIsSignatureModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur transition"
                title="Upload & Kelola Tanda Tangan Digital"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>TTD Digital</span>
              </button>
            )}

            <div className="flex items-center gap-2 text-xs text-white bg-white/15 px-3 py-1.5 rounded-full border border-white/20 backdrop-blur">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              Laporan Kas Terbuka
            </div>
          </div>
        </div>

        {/* 4 Pillars Grid: Saldo Awal, Pemasukan, Pengeluaran, Saldo Akhir */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur">
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-200 font-medium">
              <span className="truncate">Saldo Awal</span>
              {user?.role === "bendahara" && (
                <button
                  onClick={() => setIsStartingBalanceOpen(true)}
                  className="text-white/80 hover:text-white"
                  title="Ubah Saldo Awal 5 Pos"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="text-base sm:text-xl font-black text-white mt-1 truncate">
              {formatRupiah(summary.startingBalance)}
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-300 truncate block">Total 5 pos per 1 Sept</span>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur">
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-emerald-300 font-medium">
              <span className="truncate">Pemasukan</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            </div>
            <div className="text-base sm:text-xl font-black text-emerald-300 mt-1 truncate">
              +{formatRupiah(summary.totalIncome)}
            </div>
            <span className="text-[10px] sm:text-[11px] text-emerald-300/90 truncate block">Iuran rutin warga</span>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur">
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-rose-300 font-medium">
              <span className="truncate">Pengeluaran</span>
              <ArrowDownRight className="w-4 h-4 text-rose-400 flex-shrink-0" />
            </div>
            <div className="text-base sm:text-xl font-black text-rose-300 mt-1 truncate">
              -{formatRupiah(summary.totalExpense)}
            </div>
            <span className="text-[10px] sm:text-[11px] text-rose-300/90 truncate block">{summary.expenseList.length} transaksi pos</span>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-white/20 border border-white/30 backdrop-blur ring-1 ring-white/20">
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-white font-bold">
              <span className="truncate">Saldo Akhir</span>
              <Wallet className="w-4 h-4 text-white flex-shrink-0" />
            </div>
            <div className="text-base sm:text-xl font-black text-white mt-1 truncate">
              {formatRupiah(summary.endingBalance)}
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-200 truncate block">Kas bersih tersimpan</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation - Vibrant & Theme Infused */}
      <div className="relative overflow-hidden flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl theme-gradient-banner text-white shadow-lg border border-white/20 overflow-x-auto scrollbar-none transition-all flex-nowrap">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        
        <button
          onClick={() => setActiveTab("dues_status")}
          className={`relative z-10 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 sm:gap-2 backdrop-blur-md flex-shrink-0 ${
            activeTab === "dues_status"
              ? "bg-amber-300 text-slate-900 shadow-md border border-amber-200 font-extrabold"
              : "bg-white/15 text-white border border-white/20 hover:bg-white/25"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
          <span>Status Iuran Bulanan</span>
        </button>

        <button
          onClick={() => setActiveTab("table")}
          className={`relative z-10 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 backdrop-blur-md ${
            activeTab === "table"
              ? "bg-amber-300 text-slate-900 shadow-md border border-amber-200 font-extrabold"
              : "bg-white/15 text-white border border-white/20 hover:bg-white/25"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Tabel Saldo Awal & Akhir 5 Pos</span>
        </button>

        <button
          onClick={() => setActiveTab("calendar")}
          className={`relative z-10 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 backdrop-blur-md ${
            activeTab === "calendar"
              ? "bg-amber-300 text-slate-900 shadow-md border border-amber-200 font-extrabold"
              : "bg-white/15 text-white border border-white/20 hover:bg-white/25"
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Kalender Kas (Terhubung Tanggal)</span>
        </button>

        <button
          onClick={() => setActiveTab("expenses")}
          className={`relative z-10 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 backdrop-blur-md ${
            activeTab === "expenses"
              ? "bg-amber-300 text-slate-900 shadow-md border border-amber-200 font-extrabold"
              : "bg-white/15 text-white border border-white/20 hover:bg-white/25"
          }`}
        >
          <ArrowDownRight className="w-4 h-4" />
          <span>Rincian Pengeluaran ("Buat Apa Aja")</span>
          <span className="px-1.5 py-0.2 rounded-full bg-rose-500/30 text-rose-200 text-[10px] border border-rose-300/40 font-extrabold">
            {summary.expenseList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("all")}
          className={`relative z-10 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 backdrop-blur-md ${
            activeTab === "all"
              ? "bg-amber-300 text-slate-900 shadow-md border border-amber-200 font-extrabold"
              : "bg-white/15 text-white border border-white/20 hover:bg-white/25"
          }`}
        >
          <WalletCards className="w-4 h-4" />
          <span>Buku Jurnal Kas ({summary.transactions.length})</span>
        </button>
      </div>

      {/* TAB CONTENT 0: Status Iuran Bulanan Warga (Lunas & Belum Bayar + Reminder WA) */}
      {activeTab === "dues_status" && (
        <DuesStatusTab 
          currentMonthKey={currentMonthKey} 
          setCurrentMonthKey={setCurrentMonthKey} 
        />
      )}

      {/* TAB CONTENT 1: Tabel Saldo Awal & Akhir 5 Pos (Rapi & Mudah Dibaca) */}
      {activeTab === "table" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                Transparansi Lengkap Saldo Awal per Pos Kas Gang Cinta
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Setiap pos anggaran dikelola terpisah dengan Saldo Awal masing-masing.
              </p>
            </div>

            {(user?.role === "bendahara" || user?.role === "admin") && (
              <button
                onClick={() => setIsStartingBalanceOpen(true)}
                className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl border border-indigo-200 transition"
              >
                ✏️ Edit Saldo Awal 5 Pos
              </button>
            )}
          </div>

          {/* Detailed Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-4">Pos Anggaran</th>
                  <th className="p-4 text-right">Saldo Awal Bulan</th>
                  <th className="p-4 text-right">Total Pemasukan (+)</th>
                  <th className="p-4 text-right">Total Pengeluaran (-)</th>
                  <th className="p-4 text-right">Saldo Akhir Bulan (=)</th>
                  <th className="p-4 text-center">Status</th>
                  {(user?.role === "bendahara" || user?.role === "admin") && <th className="p-4 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {categories.map((cat) => {
                  const data = summary.categoryBreakdown[cat.id] || { starting: 0, income: 0, expense: 0, ending: 0 };
                  const starting = formatRupiahParts(data.starting);
                  const income = formatRupiahParts(data.income, data.income > 0 ? "+" : "");
                  const expense = formatRupiahParts(data.expense, data.expense > 0 ? "-" : "");
                  const ending = formatRupiahParts(data.ending);

                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4">
                        <div className="flex items-start gap-2.5">
                          <span className="p-2 rounded-xl theme-bg-light border theme-border-light mt-0.5">
                            {getCategoryIcon(cat.id)}
                          </span>
                          <div>
                            <div className="font-extrabold text-slate-900 text-xs sm:text-sm">{cat.name}</div>
                            <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">{cat.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap font-mono text-xs sm:text-sm">
                        <div className="flex items-center justify-between gap-2 max-w-[140px] ml-auto">
                          <span className="text-slate-400 font-semibold text-left">{starting.symbol}</span>
                          <span className="font-bold text-slate-700 text-right tabular-nums">{starting.digits}</span>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap font-mono text-xs sm:text-sm">
                        <div className="flex items-center justify-between gap-2 max-w-[140px] ml-auto text-emerald-600">
                          <span className="font-bold text-left">{income.symbol}</span>
                          <span className="font-extrabold text-right tabular-nums">{income.digits}</span>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap font-mono text-xs sm:text-sm">
                        <div className="flex items-center justify-between gap-2 max-w-[140px] ml-auto text-rose-600">
                          <span className="font-bold text-left">{expense.symbol}</span>
                          <span className="font-extrabold text-right tabular-nums">{expense.digits}</span>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap font-mono text-xs sm:text-sm">
                        <div className="flex items-center justify-between gap-2 max-w-[140px] ml-auto theme-text-primary-dark">
                          <span className="font-extrabold text-left">{ending.symbol}</span>
                          <span className="font-black text-right tabular-nums">{ending.digits}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Aktif
                        </span>
                      </td>
                      {(user?.role === "bendahara" || user?.role === "admin") && (
                        <td className="p-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                if (cat.id === "sampah" || cat.id === "keamanan") {
                                  showToast(`Saldo awal '${cat.name}' selalu Rp 0 karena langsung dibayarkan setiap bulan.`, "info");
                                } else {
                                  setIsStartingBalanceOpen(true);
                                }
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 text-indigo-600 transition shadow-2xs"
                              title="Edit Saldo Awal Pos Ini"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleOpenInputForPos(cat.id)}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-emerald-50 text-emerald-600 transition shadow-2xs"
                              title="Input Transaksi Pos Ini"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleClearPosData(cat.id, cat.name)}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-rose-600 transition shadow-2xs"
                              title="Clear / Reset Pos Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-900 text-white font-black text-xs sm:text-sm">
                {(() => {
                  const startTot = formatRupiahParts(summary.startingBalance);
                  const incTot = formatRupiahParts(summary.totalIncome, "+");
                  const expTot = formatRupiahParts(summary.totalExpense, "-");
                  const endTot = formatRupiahParts(summary.endingBalance);
                  return (
                    <tr>
                      <td className="p-4">TOTAL KESELURUHAN (5 POS)</td>
                      <td className="p-4 font-mono">
                        <div className="flex items-center justify-between gap-2 max-w-[140px] ml-auto text-slate-300">
                          <span className="font-bold text-left">{startTot.symbol}</span>
                          <span className="font-black text-right tabular-nums">{startTot.digits}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono">
                        <div className="flex items-center justify-between gap-2 max-w-[140px] ml-auto text-emerald-400">
                          <span className="font-bold text-left">{incTot.symbol}</span>
                          <span className="font-black text-right tabular-nums">{incTot.digits}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono">
                        <div className="flex items-center justify-between gap-2 max-w-[140px] ml-auto text-rose-400">
                          <span className="font-bold text-left">{expTot.symbol}</span>
                          <span className="font-black text-right tabular-nums">{expTot.digits}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono">
                        <div className="flex items-center justify-between gap-2 max-w-[140px] ml-auto theme-text-primary-dark">
                          <span className="font-extrabold text-left">{endTot.symbol}</span>
                          <span className="font-black text-right tabular-nums">{endTot.digits}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center text-xs font-medium text-emerald-400">Seimbang</td>
                      {(user?.role === "bendahara" || user?.role === "admin") && (
                        <td className="p-4 text-center text-xs text-slate-400 font-normal">-</td>
                      )}
                    </tr>
                  );
                })()}
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: Kalender Keuangan */}
      {activeTab === "calendar" && (
        <FinancialCalendar
          currentMonthKey={currentMonthKey}
          onMonthChange={(m) => setCurrentMonthKey(m)}
          transactions={summary.transactions}
          categories={categories}
          onOpenAddTransactionWithDate={handleOpenAddWithDate}
          onEditTransaction={handleOpenEditTransaction}
          onDeleteTransaction={handleDeleteTransaction}
        />
      )}

      {/* TAB CONTENT 3: Rincian Pengeluaran ("Buat Apa Aja") */}
      {activeTab === "expenses" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Rincian Lengkap Pengeluaran Kas (Buat Apa Aja)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Setiap rupiah yang dikeluarkan dicatat peruntukannya, tanggal transaksi, pos anggaran, dan penanggung jawabnya.
              </p>
            </div>

            <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
              Total Pengeluaran: {formatRupiah(summary.totalExpense)}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5">Pos Kategori</th>
                  <th className="p-3.5">Peruntukan (Buat Apa Saja)</th>
                  <th className="p-3.5">Rincian & Keterangan</th>
                  <th className="p-3.5 text-right">Nominal</th>
                  {(user?.role === "bendahara" || user?.role === "admin") && <th className="p-3.5 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.expenseList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Belum ada catatan pengeluaran di bulan ini.
                    </td>
                  </tr>
                ) : (
                  summary.expenseList.map((item) => {
                    const catObj = getCategoryObj(item.category);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="p-3.5 font-semibold text-slate-600 whitespace-nowrap">
                          {new Date(item.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${catObj?.badgeBg || 'bg-slate-100'}`}>
                            {catObj?.name || item.category}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">
                          {item.title}
                        </td>
                        <td className="p-3.5 text-slate-500 max-w-xs">
                          {item.description || "-"}
                        </td>
                        <td className="p-3.5 whitespace-nowrap font-mono">
                          {(() => {
                            const parts = formatRupiahParts(item.amount, "-");
                            return (
                              <div className="flex items-center justify-between gap-2 max-w-[130px] ml-auto font-extrabold text-rose-600">
                                <span className="text-left font-bold">{parts.symbol}</span>
                                <span className="text-right font-extrabold tabular-nums">{parts.digits}</span>
                              </div>
                            );
                          })()}
                        </td>
                        {(user?.role === "bendahara" || user?.role === "admin") && (
                          <td className="p-3.5 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleOpenEditTransaction(item)}
                                className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
                                title="Edit Transaksi"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTransaction(item.id, item.title)}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                                title="Hapus Transaksi"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: Semua Histori Transaksi */}
      {activeTab === "all" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Semua Histori Pemasukan & Pengeluaran Kas
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Buku jurnal transaksi kas Gang Cinta periode {currentMonthKey}</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5">Tipe</th>
                  <th className="p-3.5">Kategori</th>
                  <th className="p-3.5">Deskripsi Transaksi</th>
                  <th className="p-3.5 text-right">Nominal</th>
                  <th className="p-3.5">Pencatat</th>
                  {(user?.role === "bendahara" || user?.role === "admin") && <th className="p-3.5 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.transactions.map((t) => {
                  const isExp = t.type === "expense";
                  const catObj = getCategoryObj(t.category);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-semibold text-slate-600 whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isExp ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {isExp ? "Pengeluaran" : "Pemasukan"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${catObj?.badgeBg || 'bg-slate-100'}`}>
                          {catObj?.name || t.category}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{t.title}</div>
                        {t.description && <div className="text-[11px] text-slate-500 mt-0.5">{t.description}</div>}
                      </td>
                        <td className="p-3.5 whitespace-nowrap font-mono">
                          {(() => {
                            const parts = formatRupiahParts(t.amount, isExp ? "-" : "+");
                            return (
                              <div className={`flex items-center justify-between gap-2 max-w-[130px] ml-auto font-extrabold ${isExp ? "text-rose-600" : "text-emerald-600"}`}>
                                <span className="text-left font-bold">{parts.symbol}</span>
                                <span className="text-right font-extrabold tabular-nums">{parts.digits}</span>
                              </div>
                            );
                          })()}
                        </td>
                      <td className="p-3.5 text-slate-500 text-[11px] whitespace-nowrap">
                        {t.recordedBy}
                      </td>
                      {(user?.role === "bendahara" || user?.role === "admin") && (
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEditTransaction(t)}
                              className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
                              title="Edit Transaksi"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTransaction(t.id, t.title)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                              title="Hapus Transaksi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <TransactionModal
        isOpen={isTransactionOpen}
        onClose={() => {
          setIsTransactionOpen(false);
          setEditingTransaction(null);
          setPrefilledCategory("");
        }}
        prefilledDate={prefilledDate}
        prefilledCategory={prefilledCategory}
        editingTransaction={editingTransaction}
        onTransactionSaved={loadData}
        onTransactionAdded={loadData}
      />

      <StartingBalanceModal
        isOpen={isStartingBalanceOpen}
        onClose={() => setIsStartingBalanceOpen(false)}
        currentMonthKey={currentMonthKey}
        onBalanceUpdated={loadData}
      />

      <PrintFinanceModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        summary={summary}
        currentMonthKey={currentMonthKey}
        categories={categories}
        onApprovalUpdate={loadData}
      />

      <SignatureUploadModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onUpdate={loadData}
      />

    </div>
  );
}
