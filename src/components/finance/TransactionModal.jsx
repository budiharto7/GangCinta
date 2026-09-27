import React, { useState } from "react";
import { financeService, familyService } from "../../services/storageService";
import { useAuth } from "../../context/AuthContext";
import { 
  X, 
  WalletCards, 
  Trash2, 
  ShieldCheck, 
  Home, 
  HeartHandshake, 
  Trophy, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Receipt,
  UserCheck
} from "lucide-react";

export default function TransactionModal({ 
  isOpen, 
  onClose, 
  prefilledDate, 
  prefilledCategory, 
  editingTransaction, 
  onTransactionSaved, 
  onTransactionAdded 
}) {
  const { user, showToast } = useAuth();

  const [type, setType] = useState("expense"); // expense | income
  const [category, setCategory] = useState("sampah"); // sampah | keamanan | kas | sosial | olahraga
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(prefilledDate || new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [familyId, setFamilyId] = useState("");

  const families = familyService.getFamilies();

  React.useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        setType(editingTransaction.type || "expense");
        setCategory(editingTransaction.category || "sampah");
        setTitle(editingTransaction.title || "");
        setAmount(editingTransaction.amount || "");
        setDate(editingTransaction.date || new Date().toISOString().split("T")[0]);
        setDescription(editingTransaction.description || "");
        setFamilyId(editingTransaction.familyId || "");
      } else {
        setType("expense");
        setCategory(prefilledCategory || "sampah");
        setTitle("");
        setAmount("");
        setDate(prefilledDate || new Date().toISOString().split("T")[0]);
        setDescription("");
        setFamilyId("");
      }
    }
  }, [isOpen, editingTransaction, prefilledCategory, prefilledDate]);

  if (!isOpen) return null;
  if (user?.role !== "bendahara" && user?.role !== "admin") return null;

  const categories = financeService.getCategories();

  const handleSelectFamily = (selectedFamId) => {
    setFamilyId(selectedFamId);
    if (selectedFamId) {
      const fam = families.find(f => f.id === selectedFamId);
      if (fam) {
        setTitle(`Penerimaan Iuran Bulanan - ${fam.headOfFamily} (${fam.houseNumber})`);
        if (!amount) setAmount("110000");
      }
    }
  };

  const formatRupiahPreview = (num) => {
    if (!num) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) {
      showToast("Mohon lengkapi peruntukan transaksi dan nominal yang valid", "error");
      return;
    }

    const payload = {
      date,
      category,
      type,
      amount: Number(amount),
      title: title.trim(),
      description: description.trim(),
      familyId,
      recordedBy: user?.name || "Bendahara Kas"
    };

    if (editingTransaction) {
      const updated = financeService.updateTransaction(editingTransaction.id, payload);
      showToast(`Transaksi kas '${title}' berhasil diperbarui!`, "success");
      if (onTransactionSaved) onTransactionSaved(updated);
      if (onTransactionAdded) onTransactionAdded(updated);
    } else {
      const newTrx = financeService.addTransaction(payload);
      showToast(`Transaksi kas '${title}' berhasil dicatat!`, "success");
      if (onTransactionSaved) onTransactionSaved(newTrx);
      if (onTransactionAdded) onTransactionAdded(newTrx);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in my-8">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur">
              <WalletCards className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {editingTransaction ? "Edit Catatan Transaksi Kas" : "Input Pembukuan Kas Gang Cinta"}
              </h3>
              <p className="text-xs text-indigo-200">Khusus Bendahara Kas & Ketua Gang</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Transaction Type Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Jenis Transaksi *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`p-3 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold text-xs transition ${
                  type === "expense"
                    ? "border-rose-500 bg-rose-50 text-rose-700 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                }`}
              >
                <ArrowDownRight className="w-4 h-4 text-rose-600" />
                Pengeluaran Kas (Biaya/Beli)
              </button>

              <button
                type="button"
                onClick={() => setType("income")}
                className={`p-3 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold text-xs transition ${
                  type === "income"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                Pemasukan Kas (Iuran/Donasi)
              </button>
            </div>
          </div>

          {/* 5 Distinct Categories */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Pilih Pos Kategori Anggaran (5 Pos) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">{cat.name}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-600"></span>}
                    </div>
                    <span className="text-[10px] text-slate-500 line-clamp-1">{cat.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Warga Selector for Income (Auto Sync Status Lunas di Tabel Warga) */}
          {type === "income" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Pilih Warga Pembayar (Otomatis Sync Status Lunas)
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Otomatik Link ke Tabel Iuran
                </span>
              </label>
              <select
                value={familyId}
                onChange={(e) => handleSelectFamily(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white transition"
              >
                <option value="">-- Pilih Nama Warga / Penerimaan Umum --</option>
                {families.map((fam) => (
                  <option key={fam.id} value={fam.id}>
                    👤 {fam.headOfFamily} ({fam.houseNumber})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title / Peruntukan Pengeluaran ("Munculkan pengeluaran buat apa aja") */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {type === "expense" ? "Peruntukan Pengeluaran (Buat Apa Saja) *" : "Sumber / Judul Pemasukan *"}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === "expense"
                  ? "Contoh: Beli 2 Tabung Shuttlecock Badminton & Net Lapangan"
                  : "Contoh: Penerimaan Iuran Bulanan - Bpk Budi (No. 04)"
              }
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nominal Transaksi (Rp) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Contoh: 350000"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
              <p className="text-xs text-slate-600 font-semibold mt-1">
                Total: <span className={type === "expense" ? "text-rose-600" : "text-emerald-600"}>{formatRupiahPreview(amount)}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tanggal Transaksi (Terhubung Kalender) *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Rincian Nota / Keterangan Tambahan
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nomor nota toko, toko tempat belanja, atau rincian pembagian anggaran..."
              className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 shadow-lg shadow-indigo-700/30 transition"
            >
              Simpan Transaksi Kas
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
