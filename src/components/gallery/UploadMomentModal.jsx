import React, { useState } from "react";
import { momentService } from "../../services/storageService";
import { useAuth } from "../../context/AuthContext";
import { X, Upload, Camera, Image as ImageIcon, MapPin, Calendar, Sparkles } from "lucide-react";

export default function UploadMomentModal({ isOpen, onClose, onMomentAdded }) {
  const { user, showToast } = useAuth();
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Kerja Bakti");
  const [eventDate, setEventDate] = useState(new Date().toISOString().split("T")[0]);
  const [location, setLocation] = useState("Gang Cinta RT 03 / RW 05");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isCustomUpload, setIsCustomUpload] = useState(false);

  const presetImages = [
    {
      name: "Kerja Bakti Lingkungan",
      url: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80"
    },
    {
      name: "Pentas & Lomba HUT RI",
      url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80"
    },
    {
      name: "Turnamen Olahraga Warga",
      url: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80"
    },
    {
      name: "Pengajian & Doa Bersama",
      url: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80"
    },
    {
      name: "Siskamling & Pos Ronda",
      url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80"
    },
    {
      name: "Senam Pagi Bersama",
      url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80"
    }
  ];

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("Ukuran file maksimal 5MB", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
        setIsCustomUpload(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast("Judul momen/acara harus diisi", "error");
      return;
    }
    const finalImage = imageUrl || presetImages[0].url;

    const newMoment = momentService.addMoment({
      title,
      category,
      eventDate,
      location,
      description,
      imageUrl: finalImage,
      uploadedBy: user.name
    });

    showToast("Foto momen acara berhasil diupload dan dipublikasikan!", "success");
    if (onMomentAdded) onMomentAdded(newMoment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in my-8">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-700 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur">
              <Camera className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Upload Dokumentasi Momen Acara</h3>
              <p className="text-xs text-emerald-100">Publikasikan foto kegiatan gang untuk seluruh warga</p>
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
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Judul Acara / Momen Kegiatan *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Kerja Bakti Akbar & Pengecatan Gapura"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kategori Kegiatan
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition bg-white"
              >
                <option value="Kerja Bakti">Kerja Bakti & Kebersihan</option>
                <option value="HUT RI">Peringatan HUT RI / 17-an</option>
                <option value="Olahraga">Olahraga & Pemuda</option>
                <option value="Keagamaan">Keagamaan & Doa Bersama</option>
                <option value="Ronda">Ronda Malam & Keamanan</option>
                <option value="Sosial">Bakti Sosial & Santunan</option>
                <option value="Umum">Kegiatan Warga Umum</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tanggal Acara
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Lokasi Acara di Gang Cinta
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Contoh: Depan Pos Ronda RT 03"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            />
          </div>

          {/* Photo Source Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Pilih Foto Kegiatan *
            </label>

            {/* Custom file upload */}
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:border-emerald-500 transition bg-slate-50/50">
              <input
                type="file"
                id="file-upload"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-slate-700">
                  Klik untuk upload foto dari HP / Komputer Anda
                </div>
                <p className="text-[11px] text-slate-400">
                  Format JPG, PNG, WebP (Maks 5MB)
                </p>
              </label>
            </div>

            {/* Preset Photos Options */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-2">
                Atau pilih contoh foto kegiatan resolusi tinggi:
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {presetImages.map((preset, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => {
                      setImageUrl(preset.url);
                      setIsCustomUpload(false);
                    }}
                    className={`relative rounded-xl overflow-hidden aspect-video border-2 transition ${
                      imageUrl === preset.url
                        ? "border-emerald-500 ring-2 ring-emerald-500/30"
                        : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Preview Box */}
            {imageUrl && (
              <div className="mt-3 p-2 bg-slate-100 rounded-2xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1">Pratinjau Foto:</p>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Deskripsi & Cerita Momen
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ceritakan momen seru, apresiasi warga, atau ringkasan acara..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition resize-none"
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
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 transition"
            >
              Publikasikan Momen
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
