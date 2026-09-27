import React, { useRef, useEffect } from "react";
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Type, 
  Baseline, 
  Palette,
  Sparkles
} from "lucide-react";

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Tuliskan teks di sini...",
  minHeight = "90px" 
}) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && value !== undefined && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const applyCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const applySpanStyle = (styleProp, styleVal) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      // If no text is highlighted/blocked, fallback to execCommand or prompt
      document.execCommand(styleProp === 'fontFamily' ? 'fontName' : 'fontSize', false, styleVal);
      if (editorRef.current && onChange) onChange(editorRef.current.innerHTML);
      return;
    }

    try {
      const range = selection.getRangeAt(0);
      const span = document.createElement("span");
      if (styleProp === "fontSize") span.style.fontSize = styleVal;
      if (styleProp === "fontFamily") span.style.fontFamily = styleVal;
      if (styleProp === "color") span.style.color = styleVal;

      span.appendChild(range.extractContents());
      range.insertNode(span);
      selection.removeAllRanges();
      if (editorRef.current && onChange) onChange(editorRef.current.innerHTML);
    } catch {
      // Fallback
      document.execCommand(styleProp === 'fontFamily' ? 'fontName' : 'fontSize', false, styleVal);
      if (editorRef.current && onChange) onChange(editorRef.current.innerHTML);
    }
  };

  const FONT_FAMILIES = [
    { label: "Modern Sans (Standard)", value: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
    { label: "Resmi Serif (Playfair / Georgia)", value: '"Playfair Display", Georgia, "Times New Roman", serif' },
    { label: "Latin Indah (Dancing / Cursive)", value: '"Dancing Script", "Comic Sans MS", cursive' },
    { label: "Ketik Komputer (Monospace)", value: '"Fira Code", Consolas, "Courier New", monospace' },
    { label: "Poster Bold (Montserrat / Impact)", value: 'Montserrat, Impact, "Arial Black", sans-serif' },
    { label: "Mewah Elegan (Cinzel / Garamond)", value: 'Cinzel, Garamond, "Times New Roman", serif' },
    { label: "Santai Ceria (Comic / Chalkboard)", value: '"Comic Sans MS", "Chalkboard SE", sans-serif' }
  ];

  const FONT_SIZES = [
    { label: "Kecil (12px)", value: "12px" },
    { label: "Normal (14px)", value: "14px" },
    { label: "Sedang (16px)", value: "16px" },
    { label: "Besar (18px)", value: "18px" },
    { label: "Sangat Besar (22px)", value: "22px" },
    { label: "Judul (26px)", value: "26px" }
  ];

  const TEXT_COLORS = [
    { label: "Emas / Amber", value: "#fbbf24" },
    { label: "Hijau Emerald", value: "#10b981" },
    { label: "Biru Laut", value: "#3b82f6" },
    { label: "Merah Rose", value: "#f43f5e" },
    { label: "Ungu Purple", value: "#a855f7" },
    { label: "Putih", value: "#ffffff" },
    { label: "Gelap Slate", value: "#1e293b" }
  ];

  return (
    <div className="w-full rounded-2xl border-2 border-emerald-400 bg-white overflow-hidden shadow-md space-y-0">
      
      {/* Rich Formatting Toolbar */}
      <div className="flex items-center gap-1.5 flex-wrap p-2 bg-slate-100 border-b border-slate-200 text-slate-800">
        
        {/* Bold */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); applyCommand("bold"); }}
          className="p-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-200 text-slate-800 transition shadow-2xs cursor-pointer active:scale-95"
          title="Tebal (Bold) - Blok teks terlebih dahulu"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        {/* Italic */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); applyCommand("italic"); }}
          className="p-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-200 text-slate-800 transition shadow-2xs cursor-pointer active:scale-95"
          title="Miring (Italic) - Blok teks terlebih dahulu"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        {/* Underline */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); applyCommand("underline"); }}
          className="p-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-200 text-slate-800 transition shadow-2xs cursor-pointer active:scale-95"
          title="Garis Bawah (Underline) - Blok teks terlebih dahulu"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>

        {/* Strikethrough */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); applyCommand("strikeThrough"); }}
          className="p-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-200 text-slate-800 transition shadow-2xs cursor-pointer active:scale-95"
          title="Coret (Strikethrough) - Blok teks terlebih dahulu"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-5 bg-slate-300 my-auto mx-0.5"></div>

        {/* Bentuk Huruf / Font Family Select */}
        <div className="flex items-center gap-1">
          <Baseline className="w-3.5 h-3.5 text-slate-600 ml-1" />
          <select
            onChange={(e) => applySpanStyle("fontFamily", e.target.value)}
            className="px-2 py-1 rounded-xl bg-white text-slate-900 text-xs font-bold border border-slate-300 focus:outline-none cursor-pointer max-w-[150px] truncate"
            title="Pilih Bentuk Huruf untuk Teks yang Diblok"
            defaultValue=""
          >
            <option value="" disabled>-- Bentuk Huruf --</option>
            {FONT_FAMILIES.map((f, i) => (
              <option key={i} value={f.value} style={{ fontFamily: f.value }}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* Ukuran Huruf / Font Size Select */}
        <div className="flex items-center gap-1">
          <Type className="w-3.5 h-3.5 text-slate-600 ml-1" />
          <select
            onChange={(e) => applySpanStyle("fontSize", e.target.value)}
            className="px-2 py-1 rounded-xl bg-white text-slate-900 text-xs font-bold border border-slate-300 focus:outline-none cursor-pointer"
            title="Pilih Ukuran Huruf untuk Teks yang Diblok"
            defaultValue=""
          >
            <option value="" disabled>-- Ukuran --</option>
            {FONT_SIZES.map((s, i) => (
              <option key={i} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Warna Teks Selector */}
        <div className="flex items-center gap-1">
          <Palette className="w-3.5 h-3.5 text-slate-600 ml-1" />
          <select
            onChange={(e) => applySpanStyle("color", e.target.value)}
            className="px-2 py-1 rounded-xl bg-white text-slate-900 text-xs font-bold border border-slate-300 focus:outline-none cursor-pointer"
            title="Pilih Warna untuk Teks yang Diblok"
            defaultValue=""
          >
            <option value="" disabled>-- Warna --</option>
            {TEXT_COLORS.map((c, i) => (
              <option key={i} value={c.value} style={{ color: c.value, fontWeight: "bold" }}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Editable HTML Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="p-3 text-slate-900 focus:outline-none leading-relaxed overflow-y-auto"
        style={{ minHeight }}
        data-placeholder={placeholder}
      />
    </div>
  );
}
