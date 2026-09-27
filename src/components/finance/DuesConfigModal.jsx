import React, { useState, useEffect } from "react";
import { duesConfigService } from "../../services/storageService";
import { useAuth } from "../../context/AuthContext";
import { 
  X, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Save, 
  Settings2, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  DollarSign
} from "lucide-react";
import { formatRupiah } from "../../utils/numberUtils";

export default function DuesConfigModal({ isOpen, onClose, monthKey = "2026-09" }) {
  const { showToast } = useAuth();

  const [components, setComponents] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPosName, setNewPosName] = useState("");
  const [newPosAmount, setNewPosAmount] = useState("");
  const [newPosCategory, setNewPosCategory] = useState("kas");

  const loadConfig = () => {
    const list = duesConfigService.getAllComponents(monthKey);
    // Clone list to local state for editing
    setComponents(JSON.parse(JSON.stringify(list)));
  };

  useEffect(() => {
    if (isOpen) {
      loadConfig();
      setShowAddForm(false);
      setNewPosName("");
      setNewPosAmount("");
    }
  }, [isOpen, monthKey]);

  if (!isOpen) return null;

  const totalTargetAmount = components
    .filter(c => c.enabled)
    .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

  const handleToggle = (id) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  const handleAmountChange = (id, newAmt) => {
    const parsed = Math.max(0, parseInt(newAmt, 10) || 0);
    setComponents(prev => prev.map(c => c.id === id ? { ...c, amount: parsed } : c));
  };

  const handleNameChange = (id, newName) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
  };

  const handleDeleteCustom = (id) => {
    setComponents(prev => prev.filter(c => c.id !== id));
  };

  const handleAddCustomPos = (e) => {
    e.preventDefault();
    if (!newPosName.trim()) {
      showToast("Nama pos iuran tidak boleh kosong.", "warning");
      return;
    }
    const amountNum = parseInt(newPosAmount, 10);
    if (isNaN(amountNum) || amountNum < 0) {
      showToast("Nominal pos iuran harus berupa angka valid.", "warning");
      return;
    }

    const newItem = {
      id: `custom-${Date.now()}`,
      name: newPosName.trim(),
      amount: amountNum,
      enabled: true,
      category: newPosCategory,
      isDefault: false
    };

    setComponents(prev => [...prev, newItem]);
    setNewPosName("");
    setNewPosAmount("");
    setShowAddForm(false);
    showToast(`Pos "${newItem.name}" berhasil ditambahkan!`, "success");
  };

  const handleResetDefault = () => {
    if (window.confirm("Apakah Anda yakin ingin mengembalikan aturan pos iuran ke preset standar RT?")) {
      const defaultList = duesConfigService.resetMonthlyConfig(monthKey);
      setComponents(JSON.parse(JSON.stringify(defaultList)));
      showToast("Aturan iuran telah dikembalikan ke preset standar RT.", "info");
    }
  };

  const handleSave = () => {
    duesConfigService.saveMonthlyConfig(monthKey, components);
    showToast(`Pengaturan tarif & pos iuran untuk bulan ${monthKey} berhasil disimpan!`, "success");
    onClose();
  };

  // Format month name header
  let monthLabel = monthKey;
  try {
    const [y, m] = monthKey.split("-");
    const d = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    monthLabel = d.toLocaleString("id-ID", { month: "long", year: "numeric" });
  } catch {}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-8 max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 theme-bg-primary text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Pengaturan Pos & Tarif Iuran Warga</h3>
              <p className="text-xs text-white/80">Periode Bulan: <span className="font-bold underline">{monthLabel}</span></p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800">

          {/* Info Card */}
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800 space-y-1">
              <p className="font-bold">Fleksibilitas Pos Iuran Bulanan Bendahara</p>
              <p className="leading-relaxed">
                Anda dapat menambah, mengubah nominal, atau menonaktifkan pos iuran bulanan (seperti Iuran Sampah, Keamanan, Kas, Makam, Keagamaan Masjid, Agustusan, dll).
                Total iuran per KK akan otomatis memperbarui nominal di penagihan WA & pencatatan keuangan.
              </p>
            </div>
          </div>

          {/* Dynamic Total Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs font-medium text-emerald-100 uppercase tracking-wider">Total Target Iuran Per KK</div>
              <div className="text-3xl font-black">{formatRupiah(totalTargetAmount)}</div>
              <div className="text-xs text-emerald-100 mt-0.5">
                Dihitung dari {components.filter(c => c.enabled).length} pos iuran aktif
              </div>
            </div>
            <button
              type="button"
              onClick={handleResetDefault}
              className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1.5 transition shrink-0"
            >
              <RotateCcw className="w-4 h-4" /> Reset Standar RT
            </button>
          </div>

          {/* Pos Items List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">Daftar Pos & Nominal Iuran</h4>
              <span className="text-xs text-slate-500 font-medium">{components.length} Pos Terdaftar</span>
            </div>

            <div className="space-y-2.5">
              {components.map((item) => (
                <div 
                  key={item.id}
                  className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    item.enabled ? "bg-white border-slate-200 shadow-2xs" : "bg-slate-50 border-slate-200 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleToggle(item.id)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-1 shrink-0 ${
                        item.enabled ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                        item.enabled ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>

                    {/* Pos Name */}
                    <div className="flex-1">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleNameChange(item.id, e.target.value)}
                        disabled={item.isDefault}
                        className={`font-extrabold text-sm text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none w-full ${
                          item.isDefault ? "cursor-default" : ""
                        }`}
                      />
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          item.enabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                        }`}>
                          {item.enabled ? "Aktif Ditagih" : "Non-Aktif"}
                        </span>
                        {item.isDefault && (
                          <span className="text-[10px] text-slate-400 font-semibold">• Preset RT</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Nominal Input & Controls */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <div className="relative w-36">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={item.amount}
                        onChange={(e) => handleAmountChange(item.id, e.target.value)}
                        disabled={!item.enabled}
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 font-extrabold text-xs text-right focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100 text-slate-900"
                      />
                    </div>

                    {!item.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCustom(item.id)}
                        className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 transition"
                        title="Hapus pos iuran custom"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Custom Pos Button / Inline Form */}
          {!showAddForm ? (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-emerald-300 text-emerald-700 hover:bg-emerald-50/50 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-4 h-4" /> Tambah Pos Iuran Baru (Misal: Makam, Keagamaan, Agustusan, dll)
            </button>
          ) : (
            <form onSubmit={handleAddCustomPos} className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
              <h5 className="font-extrabold text-xs text-emerald-900 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-600" /> Tambah Pos Iuran Baru
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold text-slate-600 block mb-1">Nama Pos Iuran</label>
                  <input
                    type="text"
                    value={newPosName}
                    onChange={(e) => setNewPosName(e.target.value)}
                    placeholder="Contoh: Iuran Agustusan RT"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-extrabold text-slate-600 block mb-1">Nominal (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={newPosAmount}
                    onChange={(e) => setNewPosAmount(e.target.value)}
                    placeholder="Contoh: 10000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-white transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
                >
                  Tambahkan Pos
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-white transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-2xl theme-bg-primary hover:opacity-90 text-white text-xs font-extrabold shadow-md flex items-center gap-2 transition active:scale-95"
          >
            <Save className="w-4 h-4" /> Simpan Perubahan Aturan
          </button>
        </div>

      </div>
    </div>
  );
}
