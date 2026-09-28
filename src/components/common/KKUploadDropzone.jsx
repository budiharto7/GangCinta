import React, { useState, useRef } from "react";
import { parseKKImage, optimizeImageForOCR } from "../../utils/kkParser";
import { 
  UploadCloud, Camera, FileText, CheckCircle2, Sparkles, Loader2, RefreshCw, AlertCircle, RotateCw, Check
} from "lucide-react";

export default function KKUploadDropzone({ onKKParsed, title = "Unggah / Foto Scan Kartu Keluarga (Auto-Fill Form)" }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("Memindai teks pada foto KK...");
  const [parsedResult, setParsedResult] = useState(null);
  const [hasDetectedData, setHasDetectedData] = useState(false);
  const [scanError, setScanError] = useState(null);

  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const processFile = async (file) => {
    if (!file) return;
    setSelectedFile(file);
    setScanError(null);

    // Generate local preview URL immediately for instant feedback
    const reader = new FileReader();
    reader.onload = (e) => setFilePreview(e.target.result);
    reader.readAsDataURL(file);

    setIsScanning(true);
    setScanMessage("Mengunggah & memproses orientasi KK...");
    setParsedResult(null);

    try {
      setScanMessage("Membaca teks & mendeteksi data Kartu Keluarga...");
      const res = await parseKKImage(file);
      setIsScanning(false);

      if (res.previewUrl) {
        setFilePreview(res.previewUrl);
      }

      if (res.success && res.data) {
        setParsedResult(res.data);
        setHasDetectedData(Boolean(res.hasContent));
        if (res.hasContent && onKKParsed) {
          onKKParsed(res.data);
        }
      } else {
        setScanError(res.message || "Teks pada foto kurang terbaca. Coba putar foto atau isi form di bawah.");
      }
    } catch (err) {
      setIsScanning(false);
      setScanError("Terjadi kesalahan saat memproses foto KK. Silakan isi form di bawah secara manual.");
      console.error("KK Parsing error:", err);
    }
  };

  const handleRotate = async () => {
    if (!filePreview || isScanning) return;
    setIsScanning(true);
    setScanMessage("Memutar posisi foto 90° & memindai ulang teks...");
    setScanError(null);

    try {
      const res = await parseKKImage(filePreview, 90);
      setIsScanning(false);

      if (res.previewUrl) {
        setFilePreview(res.previewUrl);
      }

      if (res.success && res.data) {
        setParsedResult(res.data);
        setHasDetectedData(Boolean(res.hasContent));
        if (res.hasContent && onKKParsed) {
          onKKParsed(res.data);
        }
      }
    } catch (err) {
      setIsScanning(false);
      console.error("Rotate & scan error:", err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
    e.target.value = "";
  };

  const handleReset = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setParsedResult(null);
    setHasDetectedData(false);
    setIsScanning(false);
    setScanError(null);
  };

  return (
    <div className="bg-slate-50 border-2 border-dashed border-emerald-300/80 rounded-2xl p-3.5 sm:p-4 transition-all hover:border-emerald-500">
      
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
        <div className="flex flex-col items-center justify-center p-3 sm:p-4 text-center space-y-3">
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
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:bg-emerald-700 transition active:scale-98"
            >
              <Camera className="w-4 h-4" />
              <span>📷 Ambil Foto via HP</span>
            </button>

            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:bg-slate-100 transition active:scale-98"
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
              Mohon tunggu sejenak, sistem sedang menyesuaikan posisi foto dan mengekstrak data...
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
      {filePreview && !isScanning && parsedResult && (
        <div className="space-y-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="relative group flex-shrink-0">
                <img
                  src={filePreview}
                  alt="KK Preview"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-slate-200 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={handleRotate}
                  title="Putar Foto 90 Derajat"
                  className="absolute bottom-1 right-1 p-1 bg-slate-900/80 hover:bg-slate-900 text-white rounded-md text-[10px] shadow transition active:scale-90"
                >
                  <RotateCw className="w-3 h-3" />
                </button>
              </div>

              <div>
                {hasDetectedData ? (
                  <>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Auto-Fill Sesuai Foto KK Berhasil
                    </span>
                    <h5 className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1">
                      {parsedResult.headOfFamily || "Kepala Keluarga"} ({parsedResult.block} {parsedResult.houseNumber})
                    </h5>
                    <div className="text-[11px] text-slate-600 font-medium mt-0.5 space-y-0.5">
                      <p>
                        No. KK (Atas Dokumen): <span className="font-bold text-slate-800">{parsedResult.kkNumber || "(Belum terdeteksi di foto)"}</span>
                      </p>
                      {parsedResult.members && parsedResult.members.length > 0 && (
                        <p>
                          NIK Kepala Keluarga: <span className="font-bold font-mono text-emerald-700">{parsedResult.members[0].nik || "-"}</span> • {parsedResult.members.length} Anggota Terdeteksi
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      Foto Terunggah • Teks Belum Terbaca
                    </span>
                    <h5 className="text-xs font-bold text-slate-800 mt-1">
                      Posisi foto mungkin miring atau terbalik
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Klik tombol <strong>Putar Foto 90°</strong> agar posisi teks mendatar dan terbaca otomatis.
                    </p>
                  </>
                )}

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleRotate}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-[11px] flex items-center gap-1.5 hover:bg-emerald-100 transition active:scale-95"
                  >
                    <RotateCw className="w-3 h-3 text-emerald-600" />
                    <span>Putar Foto 90° & Pindai Ulang</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-2 py-1 rounded-lg text-slate-500 hover:text-slate-800 text-[11px] font-medium transition"
                  >
                    Ganti Foto
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition flex-shrink-0"
              title="Ganti foto KK"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {hasDetectedData ? (
            <div className="bg-emerald-50/80 rounded-xl p-2.5 text-[11px] text-emerald-900 border border-emerald-200/60 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                Data dari foto KK telah otomatis terisi ke formulir di bawah! Silakan periksa atau lengkapi data bila diperlukan.
              </span>
            </div>
          ) : (
            <div className="bg-amber-50/80 rounded-xl p-2.5 text-[11px] text-amber-900 border border-amber-200/60 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                Foto sudah tersimpan. Jika teks tidak terbaca, Anda dapat langsung mengetik atau melengkapi data pada formulir di bawah.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

