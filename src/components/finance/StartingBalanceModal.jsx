import React, { useState, useEffect } from "react";
import { financeService } from "../../services/storageService";
import { useAuth } from "../../context/AuthContext";
import { X, Wallet, CheckCircle2, Trash2, ShieldCheck, Home, HeartHandshake, Trophy } from "lucide-react";

export default function StartingBalanceModal({ isOpen, onClose, currentMonthKey, onBalanceUpdated }) {
  const { user, showToast } = useAuth();
  const categories = financeService.getCategories();

  const [balances, setBalances] = useState({
    sampah: 0,
    keamanan: 0,
    kas: 0,
    sosial: 0,
    olahraga: 0
  });

  useEffect(() => {
    if (isOpen) {
      const summary = financeService.getMonthlySummary(currentMonthKey);
      if (summary && summary.categoryBreakdown) {
        setBalances({
          sampah: summary.categoryBreakdown.sampah?.starting || 0,
          keamanan: summary.categoryBreakdown.keamanan?.starting || 0,
          kas: summary.categoryBreakdown.kas?.starting || 0,
          sosial: summary.categoryBreakdown.sosial?.starting || 0,
          olahraga: summary.categoryBreakdown.olahraga?.starting || 0
        });
      }
    }
  }, [isOpen, currentMonthKey]);

  if (!isOpen) return null;
  if (user?.role !== "bendahara" && user?.role !== "admin") return null;

  const totalStarting = Object.values(balances).reduce((acc, v) => acc + Number(v || 0), 0);

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const getCategoryIcon = (catId) => {
    switch (catId) {
      case "sampah": return <Trash2 className="w-4 h-4 text-emerald-600" />;
      case "keamanan": return <ShieldCheck className="w-4 h-4 text-indigo-600" />;
      case "kas": return <Home className="w-4 h-4 text-blue-600" />;
      case "sosial": return <HeartHandshake className="w-4 h-4 text-amber-600" />;
      case "olahraga": return <Trophy className="w-4 h-4 text-rose-600" />;
      default: return <Wallet className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    financeService.setCategoryStartingBalances(currentMonthKey, balances);
    showToast(`Saldo awal 5 pos bulan ${currentMonthKey} berhasil diperbarui!`, "success");
    if (onBalanceUpdated) onBalanceUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in my-8">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-700 to-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur">
              <Wallet className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h3 className="font-bold text-base">Atur Saldo Awal Per Pos Anggaran</h3>
              <p className="text-xs text-indigo-100">Periode Kas: {currentMonthKey}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-900 leading-relaxed">
            Masukkan saldo awal per 1 tanggal awal bulan untuk <strong>masing-masing 5 pos kas</strong>. Sistem akan menjumlahkannya secara otomatis dan transparan.
          </div>

          <div className="space-y-3">
            {categories.map((cat) => {
              const isZeroOnly = cat.id === "sampah" || cat.id === "keamanan";
              return (
                <div key={cat.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="p-2 rounded-xl bg-white shadow-2xs border border-slate-200">
                      {getCategoryIcon(cat.id)}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                        {cat.name}
                        {isZeroOnly && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                            Langsung Dibayarkan (Saldo Awal Rp 0)
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 truncate block max-w-xs">{cat.description}</span>
                    </div>
                  </div>

                  <div className="w-44 flex-shrink-0">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                      <input
                        type="number"
                        min="0"
                        disabled={isZeroOnly}
                        value={isZeroOnly ? 0 : (balances[cat.id] || "")}
                        onChange={(e) => !isZeroOnly && setBalances({ ...balances, [cat.id]: e.target.value })}
                        placeholder="0"
                        className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs font-bold text-right transition ${
                          isZeroOnly
                            ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed"
                            : "bg-white border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Calculation Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between shadow-md">
            <div>
              <span className="text-xs text-indigo-300 font-semibold block">Total Seluruh Saldo Awal (5 Pos):</span>
              <span className="text-lg font-black text-white">{formatRupiah(totalStarting)}</span>
            </div>
            <span className="text-[10px] bg-white/10 text-emerald-300 px-3 py-1 rounded-full border border-white/20">
              Otomatis Terakumulasi
            </span>
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
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition"
            >
              Simpan Saldo Awal 5 Pos
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
