import React, { useState, useRef } from "react";
import { parseKKImage } from "../../utils/kkParser";
import { 
  UploadCloud, Camera, FileText, CheckCircle2, Sparkles, Loader2, RefreshCw, AlertCircle
} from "lucide-react";

export default function KKUploadDropzone({ onKKParsed, title = "Unggah / Foto Scan Kartu Keluarga (Auto-Fill Form)" }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("Memindai teks pada foto KK...");
  const [parsedResult, setParsedResult] = useState(null);
  const [scanError, setScanError] = useState(null);

  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const processFile = async (file) => {
    if (!file) return;
    setSelectedFile(file);
    setScanError(null);

    // Generate local preview URL immediately for instant visual feedback
    const reader = new FileReader();
    reader.onload = (e) => setFilePreview(e.target.result);
    reader.readAsDataURL(file);

    setIsScanning(true);
    setScanMessage("Mengunggah & memproses gambar KK...");
    setParsedResult(null);

    try {
      setScanMessage("Membaca teks & mendeteksi data Kartu Keluarga...");
      const res = await parseKKImage(file);
      setIsScanning(false);

      if (res.success && res.data) {
        setParsedResult(res.data);
        if (onKKParsed) {
          onKKParsed(res.data);
        }
      } else {
        setScanError(res.message || "Teks pada foto kurang terbaca. Silakan cek atau isi data di form bawah.");
      }
    } catch (err) {
      setIsScanning(false);
      setScanError("Terjadi kesalahan saat memproses foto KK. Silakan isi form di bawah secara manual.");
      console.error("KK Parsing error:", err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
    // reset input value so re-selecting same file triggers change
    e.target.value = "";
  };

  const handleReset = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setParsedResult(null);
    setIsScanning(false);
    setScanError(null);
  };

  return (
    <div className="bg-slate-50 border-2 border-dashed border-emerald-300/80 rounded-2xl p-4 transition-all hover:border-emerald-500">
      
      {/* Hidden File Inputs for HP Camera & Gallery */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Header Info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
          <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{title}</span>
        </div>
      </div>

      {/* Initial Upload Dropzone View */}
      {!filePreview && !isScanning && (
        <div className="flex flex-col items-center justify-center p-4 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
            <UploadCloud className="w-6 h-6" />
          </div>

          <div>
            <p className="text-xs sm:text-sm font-bold text-slate-800">
              Unggah Foto Asli KK untuk Mengisi Form Otomatis
            </p>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Foto langsung dari kamera HP atau pilih dari galeri. Data No. KK, Kepala Keluarga, Alamat, dan Anggota Keluarga akan langsung terisi ke form di bawah.
            </p>
          </div>

          {/* Action Buttons for Mobile & Desktop */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-700 transition active:scale-98"
            >
              <Camera className="w-4 h-4" />
              <span>📷 Ambil Foto via HP</span>
            </button>

            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 shadow-xs hover:bg-slate-100 transition active:scale-98"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>📁 Pilih File / Galeri</span>
            </button>
          </div>
        </div>
      )}

      {/* Scanning In-Progress View */}
      {isScanning && (
        <div className="flex flex-col items-center justify-center py-6 space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <div className="text-center">
            <p className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5 justify-center">
              <span>{scanMessage}</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Mohon tunggu sejenak, sistem sedang mengekstrak teks Kartu Keluarga Anda...
            </p>
          </div>
        </div>
      )}

      {/* Scan Error Notice if any */}
      {scanError && !isScanning && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-xs flex items-start gap-2.5 mt-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{scanError}</p>
            <button
              type="button"
              onClick={handleReset}
              className="text-amber-700 font-bold underline mt-1 block"
            >
              Coba foto ulang
            </button>
          </div>
        </div>
      )}

      {/* Extracted Preview Result View */}
      {parsedResult && !isScanning && (
        <div className="space-y-3 bg-white p-3.5 sm:p-4 rounded-xl border border-emerald-200 shadow-xs">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {filePreview && (
                <img
                  src={filePreview}
                  alt="KK Preview"
                  className="w-14 h-14 rounded-lg object-cover border border-slate-200 shadow-2xs flex-shrink-0"
                />
              )}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Auto-Fill Sesuai Foto KK Berhasil
                </span>
                <h5 className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1">
                  {parsedResult.headOfFamily || "Kepala Keluarga"} ({parsedResult.block} {parsedResult.houseNumber})
                </h5>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  No. KK: <span className="font-bold text-slate-700">{parsedResult.kkNumber || "-"}</span> • {parsedResult.members?.length || 0} Anggota Terdeteksi
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              title="Ganti foto KK"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-emerald-50/80 rounded-xl p-2.5 text-[11px] text-emerald-900 border border-emerald-200/60 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Data dari foto KK Anda telah otomatis diisikan ke form di bawah! Silakan periksa atau sesuaikan data bila ada yang perlu disempurnakan.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
