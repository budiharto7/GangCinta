import React, { useState, useRef, useEffect } from "react";
import { Palette, Check } from "lucide-react";
import { sectionColorService } from "../../services/storageService";

export const BOX_COLOR_PRESETS = {
  white: {
    id: "white",
    name: "Putih Clean",
    bgClass: "bg-white border-slate-200 text-slate-900 shadow-sm",
    badgeBg: "bg-slate-100 text-slate-800 border-slate-300",
    iconBg: "bg-indigo-50 text-indigo-700",
    titleColor: "text-slate-900",
    descColor: "text-slate-500",
    btnPrimary: "theme-bg-primary text-white",
    dotBg: "bg-slate-100 border-slate-300 text-slate-700"
  },
  emerald: {
    id: "emerald",
    name: "Emerald Asri",
    bgClass: "bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 border-emerald-600 text-white shadow-md",
    badgeBg: "bg-white/20 text-white border-white/30",
    iconBg: "bg-white/20 text-white",
    titleColor: "text-white",
    descColor: "text-emerald-100/90",
    btnPrimary: "bg-white text-emerald-900 font-bold hover:bg-emerald-50",
    dotBg: "bg-emerald-600 border-emerald-400 text-white"
  },
  ocean: {
    id: "ocean",
    name: "Ocean Sinergi",
    bgClass: "bg-gradient-to-r from-blue-800 via-indigo-900 to-slate-900 border-blue-600 text-white shadow-md",
    badgeBg: "bg-white/20 text-white border-white/30",
    iconBg: "bg-white/20 text-white",
    titleColor: "text-white",
    descColor: "text-blue-100/90",
    btnPrimary: "bg-white text-blue-900 font-bold hover:bg-blue-50",
    dotBg: "bg-blue-600 border-blue-400 text-white"
  },
  sunset: {
    id: "sunset",
    name: "Sunset Senja",
    bgClass: "bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 border-amber-500 text-white shadow-md",
    badgeBg: "bg-white/20 text-white border-white/30",
    iconBg: "bg-white/20 text-white",
    titleColor: "text-white",
    descColor: "text-amber-100/90",
    btnPrimary: "bg-white text-orange-950 font-bold hover:bg-orange-50",
    dotBg: "bg-orange-600 border-orange-400 text-white"
  },
  royal: {
    id: "royal",
    name: "Royal Ungu",
    bgClass: "bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 border-purple-600 text-white shadow-md",
    badgeBg: "bg-white/20 text-white border-white/30",
    iconBg: "bg-white/20 text-white",
    titleColor: "text-white",
    descColor: "text-purple-100/90",
    btnPrimary: "bg-white text-purple-950 font-bold hover:bg-purple-50",
    dotBg: "bg-purple-600 border-purple-400 text-white"
  },
  ruby: {
    id: "ruby",
    name: "Ruby Kemerdekaan",
    bgClass: "bg-gradient-to-r from-rose-800 via-red-800 to-slate-900 border-rose-600 text-white shadow-md",
    badgeBg: "bg-white/20 text-white border-white/30",
    iconBg: "bg-white/20 text-white",
    titleColor: "text-white",
    descColor: "text-rose-100/90",
    btnPrimary: "bg-white text-rose-950 font-bold hover:bg-rose-50",
    dotBg: "bg-rose-600 border-rose-400 text-white"
  },
  midnight: {
    id: "midnight",
    name: "Midnight Dark",
    bgClass: "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 border-slate-700 text-white shadow-md",
    badgeBg: "bg-white/10 text-white border-white/20",
    iconBg: "bg-white/10 text-indigo-300",
    titleColor: "text-white",
    descColor: "text-slate-300",
    btnPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white font-bold",
    dotBg: "bg-slate-900 border-slate-600 text-white"
  },
  pastel: {
    id: "pastel",
    name: "Pastel Soft",
    bgClass: "bg-gradient-to-r from-amber-50 via-rose-50 to-orange-50 border-amber-200 text-slate-900 shadow-sm",
    badgeBg: "bg-white text-amber-900 border-amber-300",
    iconBg: "bg-amber-100 text-amber-800",
    titleColor: "text-amber-950",
    descColor: "text-amber-900/80",
    btnPrimary: "bg-amber-700 hover:bg-amber-800 text-white font-bold",
    dotBg: "bg-amber-400 border-amber-300 text-amber-950"
  }
};

export default function BoxColorPicker({ boxId, currentColor, onColorChange, compact = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  const selectedKey = currentColor && BOX_COLOR_PRESETS[currentColor] ? currentColor : "white";

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectColor = (colorId) => {
    sectionColorService.setBoxColor(boxId, colorId);
    if (onColorChange) {
      onColorChange(colorId);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left z-20" ref={pickerRef}>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 rounded-xl border transition shadow-xs ${
          compact 
            ? "p-1.5 text-xs bg-white/80 hover:bg-white text-slate-700 border-slate-300/80 backdrop-blur" 
            : "px-2.5 py-1.5 text-xs font-bold bg-white/90 hover:bg-white text-slate-800 border-slate-300 backdrop-blur"
        }`}
        title="Pengaturan Warna Kotak Ini"
      >
        <Palette className="w-3.5 h-3.5 text-indigo-600" />
        {!compact && <span className="text-[11px]">Warna Kotak</span>}
      </button>

      {/* Popover Color Selector */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-30 animate-fade-in text-slate-800">
          <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2 pb-1 border-b border-slate-100 flex items-center justify-between">
            <span>Pilih Warna Kotak Ini</span>
            <span className="text-[9px] font-normal text-slate-400">RT 028</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto">
            {Object.values(BOX_COLOR_PRESETS).map((preset) => {
              const isSelected = selectedKey === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectColor(preset.id)}
                  className={`p-2 rounded-xl border text-left flex items-center gap-2 transition transform active:scale-95 ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/80 font-bold ring-2 ring-indigo-500/20"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center text-[9px] ${preset.dotBg}`}>
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-800 truncate">
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
