import React from "react";
import { useTheme } from "../../context/ThemeContext";

export default function GangCintaLogo({ 
  size = "md", 
  variant = "badge", 
  showText = false, 
  showSub = false, 
  isEditable = false,
  className = "" 
}) {
  const { currentTheme, customLogo } = useTheme();
  const logoSrc = customLogo || "/logo-gang-cinta.png";

  // Size mapping
  const sizeMap = {
    xs: "w-7 h-7",
    sm: "w-8 h-8 sm:w-9 sm:h-9",
    md: "w-10 h-10 sm:w-12 sm:h-12",
    lg: "w-14 h-14 sm:w-16 sm:h-16",
    xl: "w-20 h-20 sm:w-24 sm:h-24",
    watermark: "w-80 h-80 sm:w-[480px] sm:h-[480px]"
  };

  const imgSizeClass = sizeMap[size] || sizeMap.md;

  // Watermark mode
  if (variant === "watermark") {
    return (
      <div 
        className={`pointer-events-none select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-[0.06] sm:opacity-[0.08] transition-all duration-500 hover:opacity-10 ${className}`}
        aria-hidden="true"
      >
        <img
          src={logoSrc}
          alt=""
          className={`${imgSizeClass} object-contain filter drop-shadow-2xl brightness-110 contrast-110`}
        />
      </div>
    );
  }

  // Plain mode (just logo image with contrast & drop shadow)
  if (variant === "plain") {
    return (
      <div className="relative inline-block">
        <img
          src={logoSrc}
          alt="Logo Gang Cinta"
          className={`${imgSizeClass} object-contain filter drop-shadow-md contrast-105 brightness-105 transition-transform hover:scale-105 ${className}`}
        />
        {isEditable && (
          <span 
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold border-2 border-white flex items-center justify-center text-[10px] shadow-lg group-hover:scale-110 transition"
            title="Klik logo untuk ganti Logo Portal (Khusus Admin)"
          >
            ✏️
          </span>
        )}
      </div>
    );
  }

  // Badge / Adaptive Theme mode (wraps logo in responsive theme badge frame)
  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <div 
        className="relative flex items-center justify-center p-1 sm:p-1.5 rounded-2xl backdrop-blur-md shadow-md transition-all duration-300 group border"
        style={{
          background: "rgba(255, 255, 255, 0.18)",
          borderColor: "rgba(255, 255, 255, 0.35)",
          boxShadow: `0 4px 20px -2px ${currentTheme?.primaryLight || "rgba(16,185,129,0.3)"}`
        }}
      >
        <img
          src={logoSrc}
          alt="Logo Gang Cinta"
          className={`${imgSizeClass} object-contain filter drop-shadow-sm contrast-110 brightness-105 transform group-hover:scale-105 transition-transform duration-200`}
        />
        {isEditable && (
          <span 
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold border-2 border-white flex items-center justify-center text-[10px] shadow-lg group-hover:scale-110 transition z-10"
            title="Klik logo untuk ganti Logo Portal (Khusus Admin)"
          >
            ✏️
          </span>
        )}
        <div 
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${currentTheme?.primaryLight || "rgba(16,185,129,0.2)"} 0%, transparent 70%)`
          }}
        />
      </div>

      {(showText || showSub) && (
        <div className="min-w-0 text-left">
          {showText && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-sm sm:text-lg text-white tracking-tight truncate drop-shadow-xs flex items-center gap-1.5">
                <span>Gang Cinta</span>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold text-amber-300 lowercase bg-black/25 px-1.5 py-0.5 rounded-md border border-amber-300/30">gangcinta</span>
              </span>
              <span className="hidden sm:inline-flex text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-white/20 text-white font-extrabold border border-white/30 backdrop-blur whitespace-nowrap shadow-2xs">
                RT 028 RW 005
              </span>
            </div>
          )}
          {showSub && (
            <p className="text-[10px] sm:text-xs text-slate-100 truncate opacity-90">
              Perumahan Bumi Nagara Lestari
            </p>
          )}
        </div>
      )}
    </div>
  );
}
