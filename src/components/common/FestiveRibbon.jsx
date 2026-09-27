import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { X, Sparkles, Flag, Moon, Award } from "lucide-react";

export default function FestiveRibbon() {
  const { currentTheme, isRibbonDismissed, setIsRibbonDismissed } = useTheme();

  if (!currentTheme || currentTheme.category !== "holiday" || isRibbonDismissed) {
    return null;
  }

  const getFestiveIcon = () => {
    switch (currentTheme.id) {
      case "hut-ri":
        return <Flag className="w-4 h-4 text-white animate-bounce" />;
      case "idul-fitri":
        return <Moon className="w-4 h-4 text-yellow-300 animate-pulse" />;
      case "tahun-baru":
        return <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />;
      case "hari-pahlawan":
        return <Award className="w-4 h-4 text-amber-200" />;
      default:
        return <Sparkles className="w-4 h-4 text-white" />;
    }
  };

  return (
    <aside 
      aria-label="Pengumuman Hari Besar"
      className={`relative z-50 bg-gradient-to-r ${currentTheme.ribbonGradient} text-white px-4 py-2 text-xs shadow-sm transition-all duration-300 flex items-center justify-between overflow-hidden`}
    >
      <div className="absolute inset-0 bg-white/10 opacity-20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2.5 mx-auto sm:mx-0">
          <div className="p-1 rounded-md bg-white/20 backdrop-blur flex-shrink-0">
            {getFestiveIcon()}
          </div>
          <p className="font-bold tracking-tight text-center sm:text-left text-[11px] sm:text-xs">
            {currentTheme.ribbonText}
          </p>
        </div>

        <button
          onClick={() => setIsRibbonDismissed(true)}
          className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition flex-shrink-0"
          title="Tutup pita perayaan"
          aria-label="Tutup pita perayaan"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
