import React, { useState, useEffect } from "react";
import { momentService, welcomeService } from "../../services/storageService";
import { useAuth } from "../../context/AuthContext";
import { usePolling } from "../../hooks/usePolling";
import { 
  Camera, 
  Heart, 
  Calendar, 
  MapPin, 
  Search, 
  Filter, 
  Trash2, 
  Plus, 
  Eye, 
  X, 
  Sparkles,
  Share2,
  Edit2,
  Check
} from "lucide-react";
import RichTextEditor from "../common/RichTextEditor";
import GangCintaLogo from "../common/GangCintaLogo";

export default function GalleryPage({ onOpenUpload }) {
  const { user, showToast } = useAuth();
  const [moments, setMoments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMoment, setActiveMoment] = useState(null);

  // Editable Gallery Header Config State
  const [galleryConfig, setGalleryConfig] = useState({
    title: "Momen & Cerita Gang Cinta",
    description: "Kumpulan dokumentasi foto setiap kegiatan, peringatan hari besar, gotong royong, dan kebersamaan warga Gang Cinta, Perumahan Bumi Nagara Lestari (RT 028 RW 005)."
  });
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [tempGalleryTitle, setTempGalleryTitle] = useState("");
  const [tempGalleryDesc, setTempGalleryDesc] = useState("");

  const isKetuaGang = !!(
    user && (
      user.username === "admin" ||
      (user.name || "").toLowerCase().trim() === "suryadi s" ||
      (user.jabatan || "").toLowerCase().trim() === "ketua gang"
    )
  );

  useEffect(() => {
    setMoments(momentService.getMoments());
    setGalleryConfig(welcomeService.getGalleryHeaderConfig());

    const handleHeaderChange = () => {
      setGalleryConfig(welcomeService.getGalleryHeaderConfig());
    };

    window.addEventListener("gallery-header-changed", handleHeaderChange);
    window.addEventListener("storage", handleHeaderChange);

    return () => {
      window.removeEventListener("gallery-header-changed", handleHeaderChange);
      window.removeEventListener("storage", handleHeaderChange);
    };
  }, []);

  const refreshMoments = () => {
    setMoments(momentService.getMoments());
  };

  // Auto-polling: foto & momen update otomatis setiap 10 detik
  usePolling(refreshMoments, 10000);

  const categories = [
    "Semua",
    "Kerja Bakti",
    "HUT RI",
    "Olahraga",
    "Keagamaan",
    "Ronda",
    "Sosial"
  ];

  const filteredMoments = moments.filter((m) => {
    const matchesCategory = selectedCategory === "Semua" || m.category === selectedCategory;
    const matchesSearch = 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLike = (id, e) => {
    e.stopPropagation();
    momentService.toggleLike(id);
    refreshMoments();
    showToast("Apresiasi Anda telah dicatat!", "success");
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm("Apakah Anda yakin ingin menghapus foto momen acara ini?")) {
      momentService.deleteMoment(id);
      refreshMoments();
      showToast("Momen acara telah dihapus.", "info");
      if (activeMoment?.id === id) setActiveMoment(null);
    }
  };

  return (
    <div className="space-y-6 pb-24 sm:pb-12">
      
      {/* Header Banner - Matching Dashboard Gradient Style */}
      <div className="relative overflow-hidden rounded-3xl theme-gradient-banner text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-6 -bottom-6 opacity-20 pointer-events-none z-0 hidden sm:block">
          <GangCintaLogo size="xl" variant="plain" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3.5 max-w-3xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <GangCintaLogo size="sm" variant="badge" />
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-2xs">
                <Camera className="w-3.5 h-3.5 text-amber-300" />
                Galeri Kegiatan Gang Cinta
              </div>
              <span className="text-xs px-3.5 py-1.5 rounded-full bg-white/15 font-extrabold text-white border border-white/20 backdrop-blur-md shadow-2xs">
                RT 028 RW 005
              </span>
            </div>

            {isEditingHeader ? (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!tempGalleryTitle.trim()) return;
                  const updated = {
                    ...galleryConfig,
                    title: tempGalleryTitle,
                    description: tempGalleryDesc
                  };
                  welcomeService.setGalleryHeaderConfig(updated);
                  setGalleryConfig(updated);
                  setIsEditingHeader(false);
                  showToast("Judul & deskripsi galeri berhasil disimpan!", "success");
                }}
                className="space-y-3 w-full my-2"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Judul Galeri:</label>
                  <input
                    type="text"
                    required
                    value={tempGalleryTitle}
                    onChange={(e) => setTempGalleryTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white text-slate-900 border-2 border-emerald-400 font-extrabold text-base focus:outline-none shadow-xs"
                    placeholder="Judul Halaman Galeri..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Deskripsi Galeri (Format teks yang diblok):</label>
                  <RichTextEditor
                    value={tempGalleryDesc}
                    onChange={(val) => setTempGalleryDesc(val)}
                    placeholder="Tuliskan deskripsi galeri momen acara..."
                    minHeight="90px"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Simpan Perubahan
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingHeader(false)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/30 transition active:scale-95 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Batal
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-xs">
                    {galleryConfig.title || "Momen & Cerita Gang Cinta"}
                  </h1>
                  {isKetuaGang && (
                    <button
                      type="button"
                      onClick={() => {
                        setTempGalleryTitle(galleryConfig.title || "Momen & Cerita Gang Cinta");
                        setTempGalleryDesc(galleryConfig.description || "Kumpulan dokumentasi foto setiap kegiatan, peringatan hari besar, gotong royong, dan kebersamaan warga Gang Cinta, Perumahan Bumi Nagara Lestari (RT 028 RW 005).");
                        setIsEditingHeader(true);
                      }}
                      className="inline-flex items-center justify-center p-1.5 ml-2 rounded-lg bg-white/20 hover:bg-white/35 text-white border border-white/30 backdrop-blur transition active:scale-95 shadow-2xs cursor-pointer align-middle"
                      title="Ubah Judul & Deskripsi Galeri"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-300" />
                    </button>
                  )}
                </div>

                <div 
                  className="text-slate-200 text-xs sm:text-sm max-w-3xl leading-relaxed opacity-95"
                  dangerouslySetInnerHTML={{
                    __html: galleryConfig.description || "Kumpulan dokumentasi foto setiap kegiatan, peringatan hari besar, gotong royong, dan kebersamaan warga Gang Cinta, Perumahan Bumi Nagara Lestari (RT 028 RW 005)."
                  }}
                />
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {user?.role === "admin" ? (
              <button
                onClick={onOpenUpload}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-900 font-extrabold text-xs transition shadow-lg hover:bg-slate-100 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-emerald-600" />
                Upload Momen Acara Baru
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-white/90 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <Camera className="w-3.5 h-3.5 text-amber-300" />
                <span className="font-extrabold">{moments.length} Dokumentasi Foto Acara</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar - Vibrant & Theme Infused */}
      <div className="relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-3 theme-gradient-banner text-white p-3.5 rounded-2xl border border-white/20 shadow-lg transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        
        {/* Category Pills */}
        <div className="relative z-10 flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition backdrop-blur-md ${
                selectedCategory === cat
                  ? "bg-amber-300 text-slate-900 shadow-md border border-amber-200"
                  : "bg-white/15 text-white border border-white/20 hover:bg-white/25"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative z-10 w-full sm:w-64">
          <Search className="w-4 h-4 text-white/80 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari acara atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-white/30 text-xs text-white placeholder-white/70 bg-white/20 backdrop-blur-md focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 focus:ring-2 focus:ring-amber-300 focus:outline-none transition shadow-inner"
          />
        </div>
      </div>

      {/* Moments Grid - Theme Infused & Glassmorphic */}
      {filteredMoments.length === 0 ? (
        <div className="relative overflow-hidden text-center py-16 theme-gradient-banner text-white rounded-3xl border border-white/20 p-8 space-y-3 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto text-amber-300">
            <Camera className="w-8 h-8" />
          </div>
          <h3 className="text-base font-extrabold text-white">Belum Ada Momen yang Sesuai</h3>
          <p className="text-xs text-white/80 max-w-sm mx-auto">
            Tidak ditemukan foto momen kegiatan dengan filter "{selectedCategory}". Coba ubah kata kunci pencarian.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
          {filteredMoments.map((moment) => (
            <div
              key={moment.id}
              onClick={() => setActiveMoment(moment)}
              className="group relative overflow-hidden rounded-2xl sm:rounded-3xl theme-gradient-banner text-white shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col border border-white/20 hover:scale-[1.01]"
            >
              {/* Image Container with Badges */}
              <div className="relative aspect-[4/3] overflow-hidden bg-black/20">
                <img
                  src={moment.imageUrl}
                  alt={moment.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-black/60 text-amber-300 backdrop-blur-md border border-white/20 shadow-sm">
                    {moment.category}
                  </span>
                </div>

                {/* Admin Delete Action */}
                {user?.role === "admin" && (
                  <button
                    onClick={(e) => handleDelete(moment.id, e)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-rose-600/90 text-white hover:bg-rose-700 transition opacity-0 group-hover:opacity-100 shadow-sm"
                    title="Hapus Foto Momen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Quick View Pill */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 text-slate-900 text-xs font-extrabold shadow-lg backdrop-blur">
                    <Eye className="w-3.5 h-3.5 text-amber-500" /> Lihat Detail
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-2 sm:space-y-4 bg-white/10 backdrop-blur-md">
                <div>
                  <h3 className="font-extrabold text-xs sm:text-base text-white group-hover:text-amber-300 transition line-clamp-1 sm:line-clamp-2">
                    {moment.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-white/80 mt-1 sm:mt-1.5 line-clamp-1 sm:line-clamp-2 leading-relaxed">
                    {moment.description}
                  </p>
                </div>

                {/* Meta Information & Like Button */}
                <div className="pt-2 sm:pt-3 border-t border-white/15 flex items-center justify-between text-[10px] sm:text-xs text-white/80">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-[9px] sm:text-[11px] text-white/90">
                      <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
                      <span>{new Date(moment.eventDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] sm:text-[11px] text-white/70">
                      <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
                      <span className="truncate max-w-[80px] sm:max-w-[140px]">{moment.location}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleLike(moment.id, e)}
                    className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-rose-500/30 hover:bg-rose-500/40 text-rose-100 font-extrabold transition border border-rose-300/40 shadow-sm active:scale-95"
                  >
                    <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-rose-300 text-rose-300" />
                    <span className="text-[10px] sm:text-xs">{moment.likes || 0}</span>
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Detail Modal - Theme Infused */}
      {activeMoment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl animate-fade-in border border-white/30 theme-gradient-banner text-white">
            
            {/* Close Button */}
            <button
              onClick={() => setActiveMoment(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur transition border border-white/20"
            >
              <X className="w-5 h-5" />
            </button>

            {/* High Res Image */}
            <div className="relative aspect-[16/10] bg-black/40 overflow-hidden">
              <img
                src={activeMoment.imageUrl}
                alt={activeMoment.title}
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-3 left-4">
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-black/70 text-amber-300 backdrop-blur border border-white/20">
                  {activeMoment.category}
                </span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 sm:p-8 space-y-4 bg-white/10 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    {activeMoment.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-white/80 mt-2">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-300" />
                      {new Date(activeMoment.eventDate).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-amber-300" />
                      {activeMoment.location}
                    </span>
                    <span>Diunggah oleh: <strong>{activeMoment.uploadedBy}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleLike(activeMoment.id, e)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/30 hover:bg-rose-500/40 text-rose-100 font-extrabold text-xs transition border border-rose-300/40 shadow-sm"
                  >
                    <Heart className="w-4 h-4 fill-rose-300 text-rose-300" />
                    <span>{activeMoment.likes || 0} Suka</span>
                  </button>

                  {user?.role === "admin" && (
                    <button
                      onClick={(e) => handleDelete(activeMoment.id, e)}
                      className="p-2 rounded-xl bg-rose-500/30 text-rose-200 border border-rose-400/40 hover:bg-rose-500/40 transition"
                      title="Hapus Momen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-white/20 text-sm text-white/90 leading-relaxed">
                {activeMoment.description}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
