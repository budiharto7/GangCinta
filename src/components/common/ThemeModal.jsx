import React, { useState, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { 
  X, 
  Palette, 
  Check, 
  Sparkles, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Shapes, 
  Layers,
  ShieldCheck,
  CheckCircle2,
  Type,
  ChevronDown
} from "lucide-react";

// Image compressor helper using standard HTML canvas (No external dependencies)
function compressImage(file, maxWidth = 1920, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Automatic Background Remover & Transparent PNG Logo Compressor
function compressAndCleanLogo(file, maxWidth = 512) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        // Clear canvas to ensure transparent background
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Automatic Background Removal Algorithm (Flood-fill for solid dark/black or solid white wrapper)
        try {
          const imgData = ctx.getImageData(0, 0, width, height);
          const data = imgData.data;

          const getPixel = (x, y) => {
            const idx = (y * width + x) * 4;
            return {
              r: data[idx],
              g: data[idx + 1],
              b: data[idx + 2],
              a: data[idx + 3]
            };
          };

          // Sample 4 corner pixels
          const corners = [
            getPixel(0, 0),
            getPixel(width - 1, 0),
            getPixel(0, height - 1),
            getPixel(width - 1, height - 1)
          ];

          let targetR = 0, targetG = 0, targetB = 0;
          let matchesDark = 0;
          let matchesWhite = 0;

          corners.forEach(c => {
            if (c.a > 10) {
              if (c.r < 45 && c.g < 45 && c.b < 45) matchesDark++;
              if (c.r > 215 && c.g > 215 && c.b > 215) matchesWhite++;
            }
          });

          let shouldRemoveBg = false;
          let tolerance = 50;

          if (matchesDark >= 2) {
            targetR = 0; targetG = 0; targetB = 0;
            shouldRemoveBg = true;
            tolerance = 60;
          } else if (matchesWhite >= 2) {
            targetR = 255; targetG = 255; targetB = 255;
            shouldRemoveBg = true;
            tolerance = 45;
          }

          if (shouldRemoveBg) {
            const visited = new Uint8Array(width * height);
            const queue = [
              [0, 0],
              [width - 1, 0],
              [0, height - 1],
              [width - 1, height - 1]
            ];

            const isSimilar = (r, g, b, a) => {
              if (a < 10) return true; // already transparent
              const dr = Math.abs(r - targetR);
              const dg = Math.abs(g - targetG);
              const db = Math.abs(b - targetB);
              return dr < tolerance && dg < tolerance && db < tolerance;
            };

            let head = 0;
            while (head < queue.length) {
              const [cx, cy] = queue[head++];
              const pos = cy * width + cx;
              if (visited[pos]) continue;
              visited[pos] = 1;

              const idx = pos * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              const a = data[idx + 3];

              if (isSimilar(r, g, b, a)) {
                data[idx + 3] = 0; // Make pixel 100% transparent!

                if (cx > 0) queue.push([cx - 1, cy]);
                if (cx < width - 1) queue.push([cx + 1, cy]);
                if (cy > 0) queue.push([cx, cy - 1]);
                if (cy < height - 1) queue.push([cx, cy + 1]);
              }
            }

            ctx.putImageData(imgData, 0, 0);
          }
        } catch (err) {
          console.warn("Auto background removal skipped:", err);
        }

        // Export ALWAYS as PNG to maintain alpha transparency
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ThemeModal({ isOpen, onClose }) {
  const { 
    currentTheme, 
    themeId, 
    changeTheme, 
    allThemes,
    uiStyle,
    changeUiStyle,
    allUiStyles,
    uploadedBg,
    changeUploadedBg,
    bgOverlay,
    changeBgOverlay,
    allOverlays,
    bgType,
    changeBgType,
    allBgPresets,
    navStyle,
    changeNavStyle,
    allNavStyles,
    fontId,
    changeFont,
    allFonts,
    currentFont,
    customLogo,
    changeCustomLogo,
    resetCustomLogo
  } = useTheme();

  const { user, showToast } = useAuth();
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [isFontPickerOpen, setIsFontPickerOpen] = useState(false);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("File logo harus berupa gambar (PNG, JPG, WebP, SVG)!", "error");
      return;
    }

    try {
      setIsLogoUploading(true);
      const cleanedLogoDataUrl = await compressAndCleanLogo(file, 512);
      changeCustomLogo(cleanedLogoDataUrl);
      showToast("Logo portal berhasil diunggah & latar belakang otomatis dibersihkan (Transparan)!", "success");
    } catch (err) {
      console.error(err);
      showToast("Gagal memproses gambar logo. Silakan coba file lain.", "error");
    } finally {
      setIsLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const handleResetLogo = () => {
    resetCustomLogo();
    showToast("Logo portal dikembalikan ke logo bawaan.", "info");
  };

  if (!isOpen) return null;

  const isKetuaGang = !!(
    user && (
      user.role === "admin" ||
      user.username === "admin" ||
      (user.name || "").toLowerCase().trim() === "suryadi s" ||
      (user.jabatan || "").toLowerCase().trim() === "ketua gang"
    )
  );

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("File yang diunggah harus berupa gambar (JPG, PNG, WebP)!", "error");
      return;
    }

    try {
      setIsUploading(true);
      const compressedDataUrl = await compressImage(file, 1920, 0.82);
      changeUploadedBg(compressedDataUrl);
      showToast("Gambar latar belakang berhasil diunggah & diterapkan ke seluruh portal!", "success");
    } catch (err) {
      console.error(err);
      showToast("Gagal memproses gambar. Silakan coba gambar lain.", "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    changeUploadedBg("");
    showToast("Gambar latar belakang dihapus.", "info");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in my-6 flex flex-col max-h-[92vh]">
        
        {/* Dynamic Theme Header */}
        <div className="px-6 py-5 theme-gradient-banner text-white flex items-center justify-between transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Pengaturan Tema & Latar Belakang Website</h3>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/20">
                  {isKetuaGang ? "Akses Admin" : "Akses Warga"}
                </span>
              </div>
              <p className="text-xs text-white/85">
                Pilih gaya background berwarna, jenis huruf, dan visual portal Gang Cinta
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Settings Form */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* SECTION 1: PILIHAN LATAR BELAKANG (BACKGROUND) WEBSITE */}
          <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg theme-bg-primary text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  1. Pilih Gaya Latar Belakang (Background) Website
                </h4>
                <p className="text-[11px] text-slate-500">
                  Atur tampilan background portal agar lebih berwarna, hidup, dan modern di seluruh menu warga
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {Object.values(allBgPresets).map((bg) => {
                const isSelected = bg.id === bgType;
                return (
                  <div
                    key={bg.id}
                    onClick={() => {
                      changeBgType(bg.id);
                      showToast(`Latar belakang diubah ke '${bg.name.split("(")[0]}'`, "success");
                    }}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? "border-emerald-600 bg-white shadow-md ring-2 ring-emerald-500/20"
                        : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-slate-900">{bg.name.split("(")[0]}</span>
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                          {bg.badge}
                        </span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white"
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {bg.desc}
                    </p>

                    {/* Preview box */}
                    <div 
                      className="h-7 w-full rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-center text-[10px] font-bold text-slate-700 overflow-hidden"
                      style={{ background: bg.previewBg }}
                    >
                      {bg.name.split("(")[0]}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Photo Upload Section if "uploaded" selected or foto exists */}
            {(bgType === "uploaded" || uploadedBg) && (
              <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-600" /> Upload Foto Wallpaper Custom:
                  </span>
                  {isKetuaGang && uploadedBg && (
                    <button
                      onClick={handleRemoveImage}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Hapus Foto Custom
                    </button>
                  )}
                </div>

                {!isKetuaGang ? (
                  <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-900 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-xs text-amber-900">Upload Wallpaper Khusus Admin (Ketua Gang)</h5>
                      <p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
                        Penambahan dan pengunggahan foto background custom hanya dapat dilakukan oleh Ketua Gang Cinta (RT 028 RW 005). Anda dapat memilih preset latar belakang berwarna di atas yang selaras dengan tema website.
                      </p>
                    </div>
                  </div>
                ) : uploadedBg ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-slate-300 shadow-sm aspect-[21/9] sm:aspect-[24/8] group">
                    <img
                      src={uploadedBg}
                      alt="Tema Gang Cinta"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-between p-4 text-white">
                      <div>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                          Foto Custom Aktif
                        </span>
                        <p className="text-xs font-bold mt-1">
                          Foto diterapkan di seluruh latar belakang halaman website
                        </p>
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-white/90 hover:bg-white text-slate-900 font-bold text-xs shadow transition flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" /> Ganti Foto
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-slate-400 bg-white rounded-2xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 group-hover:scale-110 text-slate-600 flex items-center justify-center transition">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-800">
                        Klik di sini untuk upload foto dari HP / Komputer
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Mendukung format JPG, PNG, WebP (Otomatis dioptimalkan)
                      </p>
                    </div>
                  </div>
                )}

                {isKetuaGang && (
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                )}

                {/* Transparansi Overlay Lapisan */}
                {uploadedBg && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <span className="text-[11px] font-bold text-slate-600">
                      Transparansi Lapisan Foto (Agar Teks Tetap 100% Terbaca Jelas):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.values(allOverlays).map((ov) => {
                        const isSelected = ov.id === bgOverlay;
                        return (
                          <button
                            key={ov.id}
                            type="button"
                            onClick={() => changeBgOverlay(ov.id)}
                            className={`p-2.5 rounded-xl border text-left transition ${
                              isSelected
                                ? "border-slate-900 bg-slate-900 text-white font-bold shadow-xs"
                                : "border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                            }`}
                          >
                            <div className="text-xs">{ov.name.split(" ")[0]}</div>
                            <div className={`text-[10px] mt-0.5 ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                              {ov.name.split("(")[1]?.replace(")", "") || ""}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 1B: GANTI LOGO PORTAL GANG CINTA (KHUSUS ADMIN) */}
          {isKetuaGang && (
            <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg theme-bg-primary text-white flex items-center justify-center shadow-xs">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      2. Ganti Logo Utama Portal Gang Cinta (Khusus Admin)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Unggah logo kustom atau foto ikon Gang Cinta yang akan tampil di header, sidebar, & watermark
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full theme-bg-primary text-white">
                  Khusus Admin
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 p-2 flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <img
                      src={customLogo || "/logo-gang-cinta.png"}
                      alt="Current Logo"
                      className="w-full h-full object-contain filter drop-shadow-sm"
                    />
                  </div>

                  <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
                    <h5 className="font-extrabold text-xs text-slate-900">
                      {customLogo ? "Logo Kustom Aktif" : "Logo Standar Bawaan (Gang Cinta)"}
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Mendukung format gambar transparan PNG, WebP, SVG, atau JPG. Gambar otomatis dioptimalkan agar ringan di layar HP maupun Komputer.
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={isLogoUploading}
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs shadow hover:bg-slate-800 transition flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isLogoUploading ? "Memproses Logo..." : "Upload Logo Baru"}</span>
                      </button>

                      {customLogo && (
                        <button
                          type="button"
                          onClick={handleResetLogo}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 text-rose-600 font-bold text-xs border border-slate-200 hover:bg-rose-50 transition flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Reset ke Default</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* SECTION 2: GAYA WARNA HEADER & SIDEBAR */}
          <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg theme-bg-primary text-white flex items-center justify-center shadow-xs">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  2. Gaya Warna Header (Navbar) & Menu Samping (Sidebar)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Atur apakah Header & Sidebar tampil tembus kaca (Glassmorphism), Berwarna Aksen Tema, atau Putih Solid
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {Object.values(allNavStyles).map((st) => {
                const isSelected = st.id === navStyle;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      changeNavStyle(st.id);
                      showToast(`Gaya Header & Sidebar diubah ke '${st.name}'`, "success");
                    }}
                    className={`p-3 rounded-2xl border-2 text-left transition flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? "border-emerald-600 bg-white shadow-md ring-2 ring-emerald-500/20"
                        : "border-slate-200 bg-white hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{st.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {st.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: PILIHAN JENIS HURUF (FONT FAMILY) WEBSITE VIA POPUP DROPDOWN */}
          <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg theme-bg-primary text-white flex items-center justify-center shadow-xs">
                <Type className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  3. Pilih Jenis Huruf (Font Family) Seluruh Website
                </h4>
                <p className="text-[11px] text-slate-500">
                  Ubah bentuk huruf tulisan di seluruh portal (Times New Roman, Arial, Georgia, Plus Jakarta Sans, Courier New, Comic Sans, dll)
                </p>
              </div>
            </div>

            {/* Popup Dropdown Selector Trigger */}
            <div className="relative pt-1">
              <button
                type="button"
                onClick={() => setIsFontPickerOpen(!isFontPickerOpen)}
                className="w-full p-4 rounded-2xl bg-white border-2 border-emerald-500/40 hover:border-emerald-600 shadow-sm flex items-center justify-between transition text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base shadow-xs" style={{ fontFamily: currentFont?.fontFamily }}>
                    Aa
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900" style={{ fontFamily: currentFont?.fontFamily }}>
                        {currentFont?.name || "Plus Jakarta Sans"}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {currentFont?.badge || "Aktif"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Kategori: <strong className="text-slate-700">{currentFont?.category || "Sans-Serif"}</strong> — {currentFont?.desc}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 group-hover:bg-emerald-100 transition">
                    Ubah Huruf
                  </span>
                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isFontPickerOpen ? "rotate-180 text-emerald-600" : ""}`} />
                </div>
              </button>

              {/* POPUP MENU CONTAINER */}
              {isFontPickerOpen && (
                <div className="mt-2 p-3 bg-white rounded-2xl border-2 border-slate-300 shadow-2xl space-y-2 z-20 max-h-[380px] overflow-y-auto animate-fade-in divide-y divide-slate-100">
                  
                  {/* Option List Grouped */}
                  {Object.values(allFonts).map((f) => {
                    const isSelected = f.id === fontId;
                    return (
                      <div
                        key={f.id}
                        onClick={() => {
                          changeFont(f.id);
                          setIsFontPickerOpen(false);
                          showToast(`Jenis huruf diubah ke '${f.name}'`, "success");
                        }}
                        className={`pt-2.5 first:pt-0 pb-2.5 px-3 rounded-xl cursor-pointer transition flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-emerald-50 border border-emerald-300 font-bold"
                            : "hover:bg-slate-50 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div 
                            className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                              isSelected ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"
                            }`}
                            style={{ fontFamily: f.fontFamily }}
                          >
                            Aa
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-slate-900 font-bold truncate" style={{ fontFamily: f.fontFamily }}>
                                {f.name}
                              </span>
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
                                {f.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {f.desc}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span 
                            className="text-xs font-semibold text-slate-700 hidden sm:inline-block px-2 py-1 rounded bg-slate-100 border border-slate-200"
                            style={{ fontFamily: f.fontFamily }}
                          >
                            Contoh Teks 123
                          </span>
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-slate-300" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Live Typography Preview Card */}
            <div className="pt-2">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400">
                  Pratinjau Hasil Huruf di Website:
                </span>
                <h3 
                  className="font-extrabold text-base text-slate-900 leading-snug"
                  style={{ fontFamily: currentFont?.fontFamily }}
                >
                  Data Warga Blok F4 Gang Cinta (RT 028 RW 005)
                </h3>
                <p 
                  className="text-xs text-slate-600 leading-relaxed"
                  style={{ fontFamily: currentFont?.fontFamily }}
                >
                  Lingkungan Gang Cinta terdiri dari Blok F4 No. 01 – 20 dan Blok F4 No. 16 – 30. Sesuai aturan, rincian susunan anggota keluarga & NIK hanya dapat dilihat oleh Ketua Gang.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 4: BENTUK TAMPILAN DI SEMUA MENU */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg theme-bg-primary text-white flex items-center justify-center shadow-xs">
                <Shapes className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  4. Bentuk & Gaya Kartu di Semua Menu
                </h4>
                <p className="text-[11px] text-slate-500">
                  Ubah bentuk kartu, sudut elemen, dan bayangan di Dashboard, Data KK, Keuangan, Galeri, dan Tamu
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.values(allUiStyles).map((style) => {
                const isSelected = style.id === uiStyle;
                return (
                  <div
                    key={style.id}
                    onClick={() => {
                      changeUiStyle(style.id);
                      showToast(`Bentuk tampilan diubah ke '${style.name}'!`, "success");
                    }}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between gap-2.5 ${
                      isSelected
                        ? "border-slate-900 bg-slate-50 shadow-md ring-2 ring-slate-400/30"
                        : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-xs text-slate-900">{style.name}</h5>
                          {isSelected && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-slate-900 text-white">
                              Aktif
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium mt-0.5 inline-block">
                          {style.badge}
                        </span>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                          isSelected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {style.desc}
                    </p>

                    {/* Visual Shape Mini Preview */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <div 
                        className={`h-5 flex-1 border border-dashed flex items-center justify-center text-[9px] font-bold ${
                          style.id === "glassmorphism" 
                            ? "bg-slate-200/60 backdrop-blur border-slate-300 text-slate-700"
                            : style.id === "sharp"
                            ? "bg-slate-100 border-slate-400 text-slate-800 rounded-lg"
                            : style.id === "playful"
                            ? "bg-white border-slate-300 shadow-sm text-slate-800 rounded-xl"
                            : "bg-slate-100 border-slate-200 text-slate-600 rounded-2xl"
                        }`}
                        style={{ borderRadius: style.radiusVal }}
                      >
                        Pratinjau Bentuk Kartu
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 5: PALET WARNA AKSEN RESMI */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg theme-bg-primary text-white flex items-center justify-center shadow-xs">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  5. Pilihan Palet Warna Aksen Website
                </h4>
                <p className="text-[11px] text-slate-500">
                  Warna untuk tombol utama, sorotan menu, lencana RT, dan banner
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.values(allThemes).map((t) => {
                const isSelected = t.id === themeId;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      changeTheme(t.id);
                      showToast(`Warna diubah ke '${t.name.split(" ")[0]}'`, "success");
                    }}
                    className={`p-3 rounded-2xl border-2 transition cursor-pointer flex flex-col items-center justify-between text-center ${
                      isSelected
                        ? "border-slate-900 bg-slate-50 shadow-xs ring-2 ring-slate-400/20"
                        : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50"
                    }`}
                    style={{
                      borderColor: isSelected ? t.primary : undefined
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl shadow-xs flex items-center justify-center text-white mb-2 transition-transform"
                      style={{ backgroundColor: t.primary }}
                    >
                      {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : <Sparkles className="w-4 h-4" />}
                    </div>
                    <div className="font-bold text-xs text-slate-800 truncate w-full">
                      {t.name.split(" ")[0]}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 truncate w-full">
                      {t.name.split("(")[1]?.replace(")", "") || ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Perubahan otomatis tersimpan di server & diterapkan ke seluruh warga.</span>
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold theme-bg-primary text-white shadow hover:opacity-90 transition"
          >
            Selesai & Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
