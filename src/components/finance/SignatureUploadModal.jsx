import React, { useState, useEffect } from "react";
import { 
  Upload, 
  Trash2, 
  X, 
  CheckCircle2, 
  Sparkles,
  PenTool
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { signatureService } from "../../services/storageService";

export default function SignatureUploadModal({ isOpen, onClose, onUpdate }) {
  const { user, showToast } = useAuth();
  const [signatures, setSignatures] = useState({ adminSignature: null, bendaharaSignature: null });

  useEffect(() => {
    if (isOpen) {
      setSignatures(signatureService.getSignatures());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const canEditAdmin = user?.role === "admin";
  const canEditBendahara = user?.role === "bendahara";

  const handleFileUpload = (e, role) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("File harus berupa gambar (PNG / JPG / WEBP)", "error");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast("Ukuran gambar terlalu besar. Maksimal 2MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      const updated = signatureService.saveSignature(role, dataUrl);
      setSignatures(updated);
      showToast(`Tanda tangan digital ${role === "admin" ? "Ketua Gang" : "Bendahara"} berhasil disimpan!`, "success");
      if (onUpdate) onUpdate(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (role) => {
    const updated = signatureService.deleteSignature(role);
    setSignatures(updated);
    showToast(`Tanda tangan digital ${role === "admin" ? "Ketua Gang" : "Bendahara"} telah dihapus.`, "success");
    if (onUpdate) onUpdate(updated);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Kelola Tanda Tangan Digital
              </h3>
              <p className="text-xs text-slate-300">
                Upload tanda tangan resmi untuk Laporan Keuangan Kas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Panduan Tanda Tangan:</span>
              <p className="mt-0.5 text-amber-800">
                Upload foto/scan tanda tangan dengan latar belakang putih transparan. Tanda tangan ini akan otomatis muncul pada Laporan Keuangan saat diklik **Setujui / Approve**.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Box TTD Ketua Gang (Admin) */}
            <div className={`p-4 rounded-2xl border-2 transition ${
              canEditAdmin ? "border-indigo-300 bg-indigo-50/30" : "border-slate-200 bg-slate-50"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">Ketua Gang Cinta</h4>
                  <p className="text-[10px] text-slate-400">Pengesahan / Penanggung Jawab</p>
                </div>
                {signatures.adminSignature ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ada TTD
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                    Kosong
                  </span>
                )}
              </div>

              {/* Preview Box */}
              <div className="h-28 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 overflow-hidden relative group">
                {signatures.adminSignature ? (
                  <img 
                    src={signatures.adminSignature} 
                    alt="TTD Ketua" 
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-slate-400 italic text-center">
                    Belum ada gambar TTD Ketua
                  </span>
                )}
              </div>

              {/* Controls */}
              <div className="mt-3 flex items-center gap-2">
                {canEditAdmin ? (
                  <>
                    <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer transition shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{signatures.adminSignature ? "Ganti TTD" : "Upload TTD"}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, "admin")}
                        className="hidden"
                      />
                    </label>

                    {signatures.adminSignature && (
                      <button
                        onClick={() => handleDelete("admin")}
                        className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition border border-rose-200"
                        title="Hapus TTD"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-[11px] text-slate-400 italic text-center w-full py-1">
                    Khusus Akses Ketua Gang
                  </div>
                )}
              </div>
            </div>

            {/* Box TTD Bendahara */}
            <div className={`p-4 rounded-2xl border-2 transition ${
              canEditBendahara ? "border-emerald-300 bg-emerald-50/30" : "border-slate-200 bg-slate-50"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">Bendahara Gang</h4>
                  <p className="text-[10px] text-slate-400">Pembuat Laporan Kas</p>
                </div>
                {signatures.bendaharaSignature ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ada TTD
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                    Kosong
                  </span>
                )}
              </div>

              {/* Preview Box */}
              <div className="h-28 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 overflow-hidden relative group">
                {signatures.bendaharaSignature ? (
                  <img 
                    src={signatures.bendaharaSignature} 
                    alt="TTD Bendahara" 
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-slate-400 italic text-center">
                    Belum ada gambar TTD Bendahara
                  </span>
                )}
              </div>

              {/* Controls */}
              <div className="mt-3 flex items-center gap-2">
                {canEditBendahara ? (
                  <>
                    <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer transition shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{signatures.bendaharaSignature ? "Ganti TTD" : "Upload TTD"}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, "bendahara")}
                        className="hidden"
                      />
                    </label>

                    {signatures.bendaharaSignature && (
                      <button
                        onClick={() => handleDelete("bendahara")}
                        className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition border border-rose-200"
                        title="Hapus TTD"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-[11px] text-slate-400 italic text-center w-full py-1">
                    Khusus Akses Bendahara
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
}
