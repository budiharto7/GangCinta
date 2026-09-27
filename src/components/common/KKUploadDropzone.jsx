import React, { useState, useRef } from "react";
import { parseKKImage, KK_SAMPLES } from "../../utils/kkParser";
import { 
  UploadCloud, Camera, FileText, CheckCircle2, Sparkles, Loader2, RefreshCw, Eye, Zap, AlertCircle
} from "lucide-react";

export default function KKUploadDropzone({ onKKParsed, title = "Upload / Foto Kartu Keluarga (KK)" }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [parsedResult, setParsedResult] = useState(null);
  const [showSamplesModal, setShowSamplesModal] = useState(false);

  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const processFile = async (file) => {
    if (!file) return;
    setSelectedFile(file);

    // Generate local preview URL
    const reader = new FileReader();
    reader.onload = (e) => setFilePreview(e.target.result);
    reader.readAsDataURL(file);

    setIsScanning(true);
    setParsedResult(null);

    try {
      const res = await parseKKImage(file);
      setIsScanning(false);
      if (res.success) {
        setParsedResult(res.data);
        if (onKKParsed) onKKParsed(res.data);
      }
    } catch (err) {
      setIsScanning(false);
      console.error("KK Parsing error:", err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const handleApplySample = (sampleData) => {
    setFilePreview("https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=500&auto=format&fit=crop&q=80");
    setSelectedFile({ name: "Scan_KK_Simulasi.jpg" });
    setParsedResult(sampleData);
    setShowSamplesModal(false);
    if (onKKParsed) onKKParsed(sampleData);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setParsedResult(null);
    setIsScanning(false);
  };

  return (
    <div className="bg-slate-50 border-2 border-dashed border-emerald-300/80 rounded-2xl p-4 transition-all hover:border-emerald-500">
      
      {/* Hidden File Inputs */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*,.pdf"
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
        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
          <Sparkles className="w-4 h-4 theme-text-primary" />
          <span>{title}</span>
        </div>
        
        <button
          type="button"
          onClick={() => setShowSamplesModal(true)}
          className="text-[11px] font-bold px-2.5 py-1 rounded-lg theme-bg-light theme-text-primary border theme-border-light hover:scale-105 transition flex items-center gap-1 shadow-xs"
        >
          <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span>Simulasi Auto-Fill Scan KK</span>
        </button>
      </div>

      {/* Initial Upload Dropzone View */}
      {!filePreview && !isScanning && (
        <div className="flex flex-col items-center justify-center p-4 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl theme-bg-light theme-border-light border flex items-center justify-center theme-text-primary shadow-xs">
            <UploadCloud className="w-6 h-6" />
          </div>

          <div>
            <p className="text-xs font-bold text-slate-800">
              Unggah Foto Scan KK untuk Isian Otomatis (*Auto-Fill*)
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Mendukung format JPG, PNG, atau hasil jepret kamera HP secara langsung.
            </p>
          </div>

          {/* Action Buttons for Mobile & Desktop */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-700 transition"
            >
              <Camera className="w-4 h-4" />
              <span>📷 Ambil Foto via HP</span>
            </button>

            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 shadow-xs hover:bg-slate-100 transition"
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
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 justify-center">
              <span>Memindai & Mengisi Data KK Otomatis...</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Mengekstrak Nomor KK, Kepala Keluarga, & Anggota Keluarga
            </p>
          </div>
        </div>
      )}

      {/* Extracted Preview Result View */}
      {parsedResult && !isScanning && (
        <div className="space-y-3 bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              {filePreview && (
                <img
                  src={filePreview}
                  alt="KK Preview"
                  className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-2xs"
                />
              )}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Auto-Fill Berhasil
                </span>
                <h5 className="text-xs font-extrabold text-slate-900 mt-1">
                  {parsedResult.headOfFamily} ({parsedResult.block} {parsedResult.houseNumber})
                </h5>
                <p className="text-[11px] text-slate-500 font-medium">
                  No. KK: <span className="font-bold text-slate-700">{parsedResult.kkNumber}</span> • {parsedResult.members?.length || 0} Anggota Keluarga
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              title="Ganti berkas KK"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-emerald-50/80 rounded-xl p-2.5 text-[11px] text-emerald-900 border border-emerald-200/60 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Data KK & susunan anggota keluarga telah terisi ke form di bawah secara otomatis! Anda tetap bisa mengedit atau menambah data secara manual.
            </span>
          </div>
        </div>
      )}

      {/* Preset Samples Modal for Fast Testing */}
      {showSamplesModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 max-w-sm w-full space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Pilih Sampel Simulasi Scan KK</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowSamplesModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Pilih contoh berkas KK di bawah ini untuk menguji pengisian data otomatis secara cepat:
            </p>

            <div className="space-y-2">
              {KK_SAMPLES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplySample(sample.data)}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/60 transition group"
                >
                  <div className="font-bold text-xs text-slate-800 group-hover:text-emerald-700">
                    {sample.label}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    No. KK: {sample.data.kkNumber} ({sample.data.members.length} Anggota)
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
