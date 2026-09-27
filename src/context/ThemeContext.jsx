import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/apiService";
import { themeService } from "../services/storageService";

const ThemeContext = createContext(null);

export const THEMES = {
  emerald: {
    id: "emerald",
    name: "Emerald Asri (Hijau Harmonis)",
    desc: "Aksen hijau dedaunan sejuk khas lingkungan warga yang bersih, tertib, dan asri.",
    primary: "#059669",
    primaryHover: "#047857",
    primaryLight: "#ecfdf5",
    primaryBorder: "#a7f3d0",
    primaryDark: "#065f46",
    banner: "linear-gradient(135deg, #1e293b 0%, #1e3a34 50%, #0f172a 100%)",
    logo: "linear-gradient(135deg, #059669 0%, #14b8a6 100%)",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300"
  },
  ocean: {
    id: "ocean",
    name: "Ocean Sinergi (Biru Modern)",
    desc: "Aksen biru maritim yang mencerminkan ketenangan, transparansi pembukuan, dan sinergi.",
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
    primaryLight: "#eff6ff",
    primaryBorder: "#bfdbfe",
    primaryDark: "#1e40af",
    banner: "linear-gradient(135deg, #1e293b 0%, #1e3a5f 50%, #0f172a 100%)",
    logo: "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
    badge: "bg-blue-100 text-blue-800 border-blue-300"
  },
  sunset: {
    id: "sunset",
    name: "Sunset Guyub (Senja Hangat)",
    desc: "Aksen hangat lembayung senja yang melambangkan keakraban santai warga di pos ronda.",
    primary: "#ea580c",
    primaryHover: "#c2410c",
    primaryLight: "#fff7ed",
    primaryBorder: "#fed7aa",
    primaryDark: "#9a3412",
    banner: "linear-gradient(135deg, #1e293b 0%, #3e2723 50%, #0f172a 100%)",
    logo: "linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)",
    badge: "bg-amber-100 text-amber-800 border-amber-300"
  },
  royal: {
    id: "royal",
    name: "Royal Harmoni (Ungu Elegan)",
    desc: "Aksen ungu ningrat dan indigo yang rapi, berwibawa, dan modern untuk Gang Cinta terdepan.",
    primary: "#7c3aed",
    primaryHover: "#6d28d9",
    primaryLight: "#f5f3ff",
    primaryBorder: "#ddd6fe",
    primaryDark: "#5b21b6",
    banner: "linear-gradient(135deg, #1e293b 0%, #2e1065 50%, #0f172a 100%)",
    logo: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
    badge: "bg-purple-100 text-purple-800 border-purple-300"
  },
  ruby: {
    id: "ruby",
    name: "Ruby Semarak (Merah Kemerdekaan)",
    desc: "Aksen merah menyala lambang semangat gotong royong dan antusiasme warga Gang Cinta (RT 028).",
    primary: "#dc2626",
    primaryHover: "#b91c1c",
    primaryLight: "#fef2f2",
    primaryBorder: "#fecaca",
    primaryDark: "#991b1b",
    banner: "linear-gradient(135deg, #1e293b 0%, #450a0a 50%, #0f172a 100%)",
    logo: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
    badge: "bg-red-100 text-red-800 border-red-300"
  },
  slate: {
    id: "slate",
    name: "Slate Modern (Abu Minimalis)",
    desc: "Aksen monokromatik modern yang bersih, netral, profesional, dan berkelas.",
    primary: "#334155",
    primaryHover: "#1e293b",
    primaryLight: "#f1f5f9",
    primaryBorder: "#cbd5e1",
    primaryDark: "#0f172a",
    banner: "linear-gradient(135deg, #1e293b 0%, #29384d 50%, #0f172a 100%)",
    logo: "linear-gradient(135deg, #334155 0%, #64748b 100%)",
    badge: "bg-slate-200 text-slate-800 border-slate-300"
  },
  gold: {
    id: "gold",
    name: "Golden Heritage (Emas Kemakmuran)",
    desc: "Aksen emas hangat keakraban budaya Nusantara dan kesejahteraan warga Gang Cinta.",
    primary: "#b45309",
    primaryHover: "#92400e",
    primaryLight: "#fffbeb",
    primaryBorder: "#fde68a",
    primaryDark: "#78350f",
    banner: "linear-gradient(135deg, #1e293b 0%, #451a03 50%, #0f172a 100%)",
    logo: "linear-gradient(135deg, #b45309 0%, #d97706 100%)",
    badge: "bg-amber-100 text-amber-800 border-amber-300"
  }
};

// UI Style Presets for ALL Menus
export const UI_STYLES = {
  "neo-rounded": {
    id: "neo-rounded",
    name: "Modern Lembut (Neo-Rounded)",
    desc: "Sudut sangat membulat (3XL), bayangan lembut, bersahabat, dan kekeluargaan.",
    radius: "rounded-3xl",
    radiusVal: "1.5rem"
  },
  "glassmorphism": {
    id: "glassmorphism",
    name: "Kaca Transparan (Glassmorphism)",
    desc: "Kartu kaca berembun (frosted glass) transparan mewah, memantulkan gambar wallpaper di belakangnya.",
    radius: "rounded-3xl",
    radiusVal: "1.5rem"
  },
  "sharp": {
    id: "sharp",
    name: "Klasik Formal (Sharp Bordered)",
    desc: "Garis batas tegas berwibawa, sudut proporsional rapi, dan kontras tajam.",
    radius: "rounded-xl",
    radiusVal: "0.75rem"
  },
  "playful": {
    id: "playful",
    name: "Pop Dinamis (Playful Pop)",
    desc: "Kartu timbul dengan bayangan 3D lembut dan garis aksen energik.",
    radius: "rounded-2xl",
    radiusVal: "1rem"
  }
};

export const OVERLAYS = {
  soft: {
    id: "soft",
    name: "Terang Lembut (Soft Light)",
    gradient: "linear-gradient(rgba(248, 250, 252, 0.88), rgba(248, 250, 252, 0.94))"
  },
  balanced: {
    id: "balanced",
    name: "Seimbang (Balanced)",
    gradient: "linear-gradient(rgba(241, 245, 249, 0.80), rgba(241, 245, 249, 0.88))"
  },
  glass: {
    id: "glass",
    name: "Kaca Mewah (Clear Glass)",
    gradient: "linear-gradient(rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.78))"
  },
  dimmed: {
    id: "dimmed",
    name: "Gelap Kontras (Dimmed)",
    gradient: "linear-gradient(rgba(15, 23, 42, 0.70), rgba(15, 23, 42, 0.80))"
  }
};

export const BACKGROUND_PRESETS = {
  "dark-emerald-banner": {
    id: "dark-emerald-banner",
    name: "Dark Emerald Banner (Selaras Warna Banner)",
    desc: "Gradasi mewah hijau emerald tua dan slate gelap yang 100% selaras dengan Banner Utama Gang Cinta.",
    badge: "Selaras Banner Utama",
    previewBg: "linear-gradient(135deg, #1e293b 0%, #1e3a34 50%, #0f172a 100%)",
    bgClass: "bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 text-white"
  },
  "aurora-mesh": {
    id: "aurora-mesh",
    name: "Gradient Aurora Mesh (Warna-Warni Modern)",
    desc: "Perpaduan gradasi warna-warni cerah nan anggun dan modern dengan pendaran cahaya pastel yang hidup.",
    badge: "Warna-Warni",
    previewBg: "linear-gradient(135deg, #a7f3d0 0%, #99f6e4 35%, #fed7aa 70%, #e9d5ff 100%)",
    bgClass: "bg-gradient-to-br from-emerald-100/80 via-teal-100/70 via-sky-100/60 to-purple-100/70"
  },
  "gradient-sunset": {
    id: "gradient-sunset",
    name: "Sunset Senja (Kehangatan Warga)",
    desc: "Perpaduan gradasi warna senja hangat (jingga, rose, dan amber) yang bersahabat.",
    badge: "Hangat & Enerjik",
    previewBg: "linear-gradient(135deg, #ffedd5 0%, #fecdd3 50%, #fef08a 100%)",
    bgClass: "bg-gradient-to-br from-orange-100/80 via-rose-100/75 to-amber-200/60"
  },
  "gradient-ocean": {
    id: "gradient-ocean",
    name: "Ocean Teal (Biru Samudra Sinergi)",
    desc: "Gradasi biru laut dan teal sejuk, tenang, profesional, dan futuristik.",
    badge: "Sejuk & Elegan",
    previewBg: "linear-gradient(135deg, #bae6fd 0%, #99f6e4 50%, #c7d2fe 100%)",
    bgClass: "bg-gradient-to-br from-sky-100/80 via-teal-100/75 to-indigo-200/60"
  },
  "gradient-cyber": {
    id: "gradient-cyber",
    name: "Cyber Violet (Ungu Lavender Modern)",
    desc: "Nuansa ungu lavender modern dengan pendaran neon lembut yang kekinian.",
    badge: "Modern & Tren",
    previewBg: "linear-gradient(135deg, #ddd6fe 0%, #fbcfe8 50%, #c7d2fe 100%)",
    bgClass: "bg-gradient-to-br from-purple-100/80 via-fuchsia-100/75 to-indigo-200/60"
  },
  "pattern-dots": {
    id: "pattern-dots",
    name: "Geometric Dots (Pola Bintik Modern)",
    desc: "Latar belakang bermotif titik-titik geometris modern yang rapi dan estetis.",
    badge: "Tekstur Modern",
    previewBg: "radial-gradient(#94a3b8 1px, #f8fafc 1px)",
    bgClass: "bg-gradient-to-br from-slate-100 via-emerald-100/40 to-slate-200 bg-dot-pattern"
  },
  "uploaded": {
    id: "uploaded",
    name: "Foto Wallpaper Upload Admin",
    desc: "Foto pemandangan / perayaan RT yang diunggah secara bebas oleh Admin.",
    badge: "Custom Foto",
    previewBg: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    bgClass: "theme-wallpaper-bg"
  },
  "solid": {
    id: "solid",
    name: "Abu Minimalis (Polos Klasik)",
    desc: "Warna latar belakang netral sederhana dan bersih.",
    badge: "Polos Minimalis",
    previewBg: "#f8fafc",
    bgClass: "bg-slate-100"
  }
};

export const NAV_STYLES = {
  glass: {
    id: "glass",
    name: "Kaca Transparan Frosted",
    desc: "Header & Sidebar semi-transparan tembus warna gradasi background.",
    badge: "Rekomendasi"
  },
  colored: {
    id: "colored",
    name: "Warna Aksen Tema",
    desc: "Header & Sidebar menggunakan warna utama tema (Emerald, Ocean Blue, dll).",
    badge: "Penuh Warna"
  },
  white: {
    id: "white",
    name: "Putih Solid Klasik",
    desc: "Header & Sidebar berwarna putih bersih solid.",
    badge: "Polos Klasik"
  }
};

export const FONTS = {
  jakarta: {
    id: "jakarta",
    name: "Plus Jakarta Sans",
    category: "Modern Sans-Serif",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    desc: "Font modern utama website, sangat rapi & jernih di semua layar HP/Komputer.",
    badge: "Rekomendasi Utama"
  },
  outfit: {
    id: "outfit",
    name: "Outfit Modern",
    category: "Modern Sans-Serif",
    fontFamily: "'Outfit', sans-serif",
    desc: "Bentuk geometris elegan yang memberikan tampilan mewah dan profesional.",
    badge: "Mewah & Elegan"
  },
  poppins: {
    id: "poppins",
    name: "Poppins Pop",
    category: "Modern Sans-Serif",
    fontFamily: "'Poppins', sans-serif",
    desc: "Karakter huruf membulat yang bersahabat, kekeluargaan, dan energik.",
    badge: "Kekeluargaan"
  },
  inter: {
    id: "inter",
    name: "Inter UI",
    category: "Modern Sans-Serif",
    fontFamily: "'Inter', sans-serif",
    desc: "Font standar internasional untuk antarmuka digital yang bersih dan presisi.",
    badge: "Presisi Tinggi"
  },
  quicksand: {
    id: "quicksand",
    name: "Quicksand Soft",
    category: "Modern Sans-Serif",
    fontFamily: "'Quicksand', sans-serif",
    desc: "Sudut huruf melengkung lembut yang memberikan nuansa santai dan akrab.",
    badge: "Lembut & Akrab"
  },
  manrope: {
    id: "manrope",
    name: "Manrope Bold",
    category: "Modern Sans-Serif",
    fontFamily: "'Manrope', sans-serif",
    desc: "Bentuk huruf modern dengan ketegasan yang pas dan keterbacaan tinggi.",
    badge: "Tegas & Rapi"
  },
  lexend: {
    id: "lexend",
    name: "Lexend Clean",
    category: "Modern Sans-Serif",
    fontFamily: "'Lexend', sans-serif",
    desc: "Dirancang khusus secara ilmiah untuk kenyamanan membaca teks panjang.",
    badge: "Kenyamanan Baca"
  },
  roboto: {
    id: "roboto",
    name: "Roboto Classic",
    category: "Modern Sans-Serif",
    fontFamily: "'Roboto', sans-serif",
    desc: "Gaya huruf standar netral yang sederhana, ringan, dan familiar.",
    badge: "Netral Sederhana"
  },

  // Klasik & Formal (Serif & Standard System Fonts)
  times: {
    id: "times",
    name: "Times New Roman",
    category: "Klasik & Formal (Serif)",
    fontFamily: "'Times New Roman', Times, serif",
    desc: "Gaya huruf dokumen resmi klasik, surat bernomor, dan arsip formal.",
    badge: "Dokumen Resmi"
  },
  arial: {
    id: "arial",
    name: "Arial Standard",
    category: "Standar Simpel (Sans-Serif)",
    fontFamily: "Arial, Helvetica, sans-serif",
    desc: "Huruf standar universal yang sangat bersih, mudah dibaca, dan familiar.",
    badge: "Standar Universal"
  },
  georgia: {
    id: "georgia",
    name: "Georgia Elegance",
    category: "Klasik & Formal (Serif)",
    fontFamily: "Georgia, 'Times New Roman', serif",
    desc: "Huruf berkaki klasik yang anggun, tegas, dan berwibawa.",
    badge: "Anggun & Formal"
  },
  trebuchet: {
    id: "trebuchet",
    name: "Trebuchet MS",
    category: "Standar Simpel (Sans-Serif)",
    fontFamily: "'Trebuchet MS', 'Lucida Sans Unicode', sans-serif",
    desc: "Bentuk huruf modern klasik dengan lekukan yang jelas dan berkarakter.",
    badge: "Berkarakter"
  },
  verdana: {
    id: "verdana",
    name: "Verdana Wide",
    category: "Standar Simpel (Sans-Serif)",
    fontFamily: "Verdana, Geneva, sans-serif",
    desc: "Spasi huruf agak lebar yang membuat teks sangat jelas terbaca di HP.",
    badge: "Kejelasan Tinggi"
  },
  courier: {
    id: "courier",
    name: "Courier New (Ketik)",
    category: "Ketik & Monospace",
    fontFamily: "'Courier New', Courier, monospace",
    desc: "Gaya mesin ketik klasik retro untuk tampilan arsip dan nota resmi.",
    badge: "Mesin Ketik"
  },
  comicsans: {
    id: "comicsans",
    name: "Comic Sans MS",
    category: "Kreatif & Santai",
    fontFamily: "'Comic Sans MS', 'Comic Sans', cursive",
    desc: "Gaya tulisan tangan santai, unik, dan ceria.",
    badge: "Ceria & Santai"
  },
  impact: {
    id: "impact",
    name: "Impact Bold",
    category: "Kreatif & Tegas",
    fontFamily: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
    desc: "Huruf sangat tebal dan mencolok untuk pengumuman penting.",
    badge: "Mencolok & Tebal"
  }
};

function applyThemeVariables(theme, uiStyleId, fontId) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  if (theme) {
    root.style.setProperty("--color-primary", theme.primary);
    root.style.setProperty("--color-primary-hover", theme.primaryHover);
    root.style.setProperty("--color-primary-light", theme.primaryLight);
    root.style.setProperty("--color-primary-border", theme.primaryBorder);
    root.style.setProperty("--color-primary-dark", theme.primaryDark);
    root.style.setProperty("--color-theme-banner", theme.banner);
    root.style.setProperty("--color-theme-logo", theme.logo);
  }

  const styleConfig = UI_STYLES[uiStyleId] || UI_STYLES["neo-rounded"];
  root.style.setProperty("--theme-card-radius", styleConfig.radiusVal);

  const fontConfig = FONTS[fontId] || FONTS["jakarta"];
  root.style.setProperty("--font-primary", fontConfig.fontFamily);
  if (document.body) {
    document.body.style.setProperty("font-family", fontConfig.fontFamily, "important");
  }
}

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState("gold");
  const [uiStyle, setUiStyle] = useState("neo-rounded");
  const [uploadedBg, setUploadedBg] = useState("/theme-bg.jpg");
  const [bgOverlay, setBgOverlay] = useState("soft");
  const [bgType, setBgType] = useState("uploaded");
  const [navStyle, setNavStyle] = useState("colored");
  const [fontId, setFontId] = useState("jakarta");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [customLogo, setCustomLogo] = useState(() => {
    try {
      return localStorage.getItem("gang_cinta_custom_logo") || "/custom-logo.png";
    } catch {
      return "/custom-logo.png";
    }
  });

  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 10, 150));
  };

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 10, 75));
  };

  const resetZoom = () => {
    setZoomLevel(100);
  };

  // Apply variables & classes whenever settings change
  useEffect(() => {
    const active = THEMES[themeId] || THEMES.emerald;
    applyThemeVariables(active, uiStyle, fontId);

    // Apply UI style class to document root for global menu styling
    const root = document.documentElement;
    root.classList.remove(
      "ui-style-neo-rounded", 
      "ui-style-glassmorphism", 
      "ui-style-sharp", 
      "ui-style-playful"
    );
    root.classList.add(`ui-style-${uiStyle}`);
  }, [themeId, uiStyle, fontId]);

  // Load from server database or localStorage
  useEffect(() => {
    api.getTheme()
      .then((t) => {
        if (!t) return;
        if (typeof t === "string" && THEMES[t]) {
          setThemeId(t);
          applyThemeVariables(THEMES[t], "neo-rounded", "jakarta");
        } else if (typeof t === "object") {
          if (t.themeId && THEMES[t.themeId]) setThemeId(t.themeId);
          if (t.uiStyle && UI_STYLES[t.uiStyle]) setUiStyle(t.uiStyle);
          if (t.uploadedBg !== undefined) setUploadedBg(t.uploadedBg);
          if (t.bgOverlay && OVERLAYS[t.bgOverlay]) setBgOverlay(t.bgOverlay);
          if (t.bgType && BACKGROUND_PRESETS[t.bgType]) setBgType(t.bgType);
          if (t.navStyle && NAV_STYLES[t.navStyle]) setNavStyle(t.navStyle);
          if (t.fontId && FONTS[t.fontId]) setFontId(t.fontId);
          if (t.customLogo !== undefined) {
            setCustomLogo(t.customLogo);
            if (t.customLogo) localStorage.setItem("gang_cinta_custom_logo", t.customLogo);
          }
          const base = THEMES[t.themeId] || THEMES.emerald;
          applyThemeVariables(base, t.uiStyle || "neo-rounded", t.fontId || "jakarta");
        }
      })
      .catch(() => {
        const saved = themeService.getTheme();
        if (saved && THEMES[saved]) {
          setThemeId(saved);
          applyThemeVariables(THEMES[saved], "neo-rounded", "jakarta");
        }
      });
  }, []);

  const saveConfig = (newThemeId, newUiStyle, newUploadedBg, newOverlay, newBgType, newNavStyle, newFontId, newCustomLogo) => {
    const targetLogo = newCustomLogo !== undefined ? newCustomLogo : customLogo;
    const payload = {
      themeId: newThemeId,
      uiStyle: newUiStyle,
      uploadedBg: newUploadedBg,
      bgOverlay: newOverlay,
      bgType: newBgType !== undefined ? newBgType : bgType,
      navStyle: newNavStyle !== undefined ? newNavStyle : navStyle,
      fontId: newFontId !== undefined ? newFontId : fontId,
      customLogo: targetLogo
    };
    if (targetLogo) {
      try { localStorage.setItem("gang_cinta_custom_logo", targetLogo); } catch {}
    } else {
      try { localStorage.removeItem("gang_cinta_custom_logo"); } catch {}
    }
    themeService.setTheme(newThemeId);
    api.setTheme(payload).catch((err) => {
      console.warn("Could not save theme to server:", err);
    });
  };

  const changeTheme = (newThemeId) => {
    if (THEMES[newThemeId]) {
      const selected = THEMES[newThemeId];
      setThemeId(newThemeId);
      applyThemeVariables(selected, uiStyle, fontId);
      saveConfig(newThemeId, uiStyle, uploadedBg, bgOverlay, bgType, navStyle, fontId, customLogo);
    }
  };

  const changeUiStyle = (newStyleId) => {
    if (UI_STYLES[newStyleId]) {
      setUiStyle(newStyleId);
      const active = THEMES[themeId] || THEMES.emerald;
      applyThemeVariables(active, newStyleId, fontId);
      saveConfig(themeId, newStyleId, uploadedBg, bgOverlay, bgType, navStyle, fontId, customLogo);
    }
  };

  const changeUploadedBg = (bgDataUrl) => {
    setUploadedBg(bgDataUrl);
    const targetType = bgDataUrl ? "uploaded" : "aurora-mesh";
    setBgType(targetType);
    saveConfig(themeId, uiStyle, bgDataUrl, bgOverlay, targetType, navStyle, fontId, customLogo);
  };

  const changeBgOverlay = (overlayId) => {
    if (OVERLAYS[overlayId]) {
      setBgOverlay(overlayId);
      saveConfig(themeId, uiStyle, uploadedBg, overlayId, bgType, navStyle, fontId, customLogo);
    }
  };

  const changeBgType = (newBgType) => {
    if (BACKGROUND_PRESETS[newBgType]) {
      setBgType(newBgType);
      saveConfig(themeId, uiStyle, uploadedBg, bgOverlay, newBgType, navStyle, fontId, customLogo);
    }
  };

  const changeNavStyle = (newNavStyle) => {
    if (NAV_STYLES[newNavStyle]) {
      setNavStyle(newNavStyle);
      saveConfig(themeId, uiStyle, uploadedBg, bgOverlay, bgType, newNavStyle, fontId, customLogo);
    }
  };

  const changeFont = (newFontId) => {
    if (FONTS[newFontId]) {
      setFontId(newFontId);
      const active = THEMES[themeId] || THEMES.emerald;
      applyThemeVariables(active, uiStyle, newFontId);
      saveConfig(themeId, uiStyle, uploadedBg, bgOverlay, bgType, navStyle, newFontId, customLogo);
    }
  };

  const changeCustomLogo = (logoUrl) => {
    setCustomLogo(logoUrl);
    saveConfig(themeId, uiStyle, uploadedBg, bgOverlay, bgType, navStyle, fontId, logoUrl);
  };

  const resetCustomLogo = () => {
    setCustomLogo("");
    saveConfig(themeId, uiStyle, uploadedBg, bgOverlay, bgType, navStyle, fontId, "");
  };

  const currentTheme = THEMES[themeId] || THEMES.emerald;
  const currentUiStyle = UI_STYLES[uiStyle] || UI_STYLES["neo-rounded"];
  const currentOverlay = OVERLAYS[bgOverlay] || OVERLAYS.soft;
  const currentBgPreset = BACKGROUND_PRESETS[bgType] || BACKGROUND_PRESETS["aurora-mesh"];
  const currentFont = FONTS[fontId] || FONTS["jakarta"];

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeId,
        changeTheme,
        allThemes: THEMES,
        uiStyle,
        currentUiStyle,
        changeUiStyle,
        allUiStyles: UI_STYLES,
        uploadedBg,
        changeUploadedBg,
        bgOverlay,
        currentOverlay,
        changeBgOverlay,
        allOverlays: OVERLAYS,
        bgType,
        currentBgPreset,
        changeBgType,
        allBgPresets: BACKGROUND_PRESETS,
        navStyle,
        changeNavStyle,
        allNavStyles: NAV_STYLES,
        fontId,
        currentFont,
        changeFont,
        allFonts: FONTS,
        zoomLevel,
        setZoomLevel,
        zoomIn,
        zoomOut,
        resetZoom,
        customLogo,
        changeCustomLogo,
        resetCustomLogo
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
