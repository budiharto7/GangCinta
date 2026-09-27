import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { api } from "../../services/apiService";
import { chatService } from "../../services/storageService";
import { 
  MessageSquare, 
  X, 
  Minus, 
  Send, 
  Radio, 
  Sparkles, 
  LogIn, 
  Lock, 
  Users, 
  Smile,
  ChevronDown
} from "lucide-react";

export default function FloatingChatWidget({ isOpen, setIsOpen }) {
  const { user, allUsers, requireAuth } = useAuth();
  const { currentTheme } = useTheme();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [onlineList, setOnlineList] = useState([]);
  const [showTeaser, setShowTeaser] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  const getSenderName = (msg) => {
    if (!msg) return "";
    const found = (allUsers || []).find(u => u.id === msg.senderId);
    if (found?.name) return found.name;
    return msg.senderName || "Warga Gang Cinta";
  };

  const getSenderAvatar = (msg) => {
    if (!msg) return "";
    const found = (allUsers || []).find(u => u.id === msg.senderId);
    if (found?.avatar) return found.avatar;
    return msg.senderAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";
  };

  const getSenderRole = (msg) => {
    if (!msg) return "anggota";
    const found = (allUsers || []).find(u => u.id === msg.senderId);
    if (found?.role) return found.role;
    return msg.senderRole || "anggota";
  };

  // Load chat messages
  const loadMessages = () => {
    api.getChatMessages()
      .then((msgs) => setMessages(msgs))
      .catch(() => setMessages(chatService.getMessages()));
  };

  // Load online residents
  const loadOnline = () => {
    try {
      const list = chatService.getOnlineUsers(user);
      setOnlineList(list);
    } catch {
      setOnlineList([]);
    }
  };

  useEffect(() => {
    loadMessages();
    loadOnline();

    const interval = setInterval(() => {
      loadMessages();
      loadOnline();
    }, 6000);

    return () => clearInterval(interval);
  }, [user]);

  // Scroll to bottom when messages update and chat is open
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  const activeCount = onlineList.filter((u) => u.isOnline).length;
  const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!user) {
      requireAuth(() => {}, "Mengirim Pesan Obrolan Warga");
      return;
    }
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText("");

    try {
      await api.sendChatMessage({ user, message: textToSend });
      loadMessages();
    } catch {
      chatService.sendMessage({ user, message: textToSend });
      loadMessages();
    }
  };

  const sendQuickPhrase = (phrase) => {
    if (!user) {
      requireAuth(() => {}, "Mengirim Pesan Obrolan Warga");
      return;
    }
    setInputText(phrase);
  };

  const formatTime = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">Admin</span>;
      case "bendahara":
        return <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800">Bendahara</span>;
      default:
        return <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">Warga</span>;
    }
  };

  const quickPhrases = [
    "Halo tetangga! 👋",
    "Selamat pagi Gang Cinta ☀️",
    "Ada info kerja bakti? 🧹",
    "Terima kasih infonya 🙏",
    "Siap hadir! 👍"
  ];

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activePickerTab, setActivePickerTab] = useState("emoji"); // 'emoji' | 'sticker'

  const EMOJI_LIST = [
    "😀", "😊", "😃", "🥰", "😂", "🤣", "🥳", "🤩", "😎", "😇", "😍", "🫣", "🫡", "🤫", 
    "💡", "👍", "👏", "🙌", "🙏", "🤝", "🔥", "❤️", "✨", "💯", "⚡", "🏡", "🏘️", "🧹", 
    "☕", "⚽", "🏸", "🍲", "📢", "🚨", "💰", "🏆", "📦", "📍", "🔑", "🛵", "🚪", "🌳"
  ];

  const STICKER_LIST = [
    { id: 'kerjabakti', icon: '🧹', title: 'Kerja Bakti Yuk!', subtitle: 'Sapu & Cangkul Siap! 🌾' },
    { id: 'ronda', icon: '☕', title: 'Kopi Pos Ronda', subtitle: 'Kopi Hitam Mantap ☕' },
    { id: 'kaslunas', icon: '💳', title: 'Iuran Kas Lunas!', subtitle: 'Warga Taat & Amanah 💰' },
    { id: 'siskamling', icon: '🚨', title: 'Siskamling Aman', subtitle: 'Gang Cinta Sentosa 🌙' },
    { id: 'badminton', icon: '🏸', title: 'Main Badminton', subtitle: 'Semangat Olahraga 🏸' },
    { id: 'makanmakan', icon: '🍲', title: 'Syukuran RT', subtitle: 'Makan-Makan Warga 🍲' },
    { id: 'apresiasi', icon: '🌟', title: 'Mantap Pak RT!', subtitle: 'Apresiasi Warga 👏' },
    { id: 'guyub', icon: '❤️', title: 'Tetangga Idaman', subtitle: 'Guyub Rukun Selalu 🏡' }
  ];

  const handleSendSticker = async (sticker) => {
    if (!user) {
      requireAuth(() => {}, "Mengirim Pesan Obrolan Warga");
      return;
    }
    setShowEmojiPicker(false);
    const stickerText = `[STIKER:${sticker.icon}|${sticker.title}|${sticker.subtitle}]`;
    try {
      await api.sendChatMessage({ user, message: stickerText });
      loadMessages();
    } catch {
      chatService.sendMessage({ user, message: stickerText });
      loadMessages();
    }
  };

  const renderMessageContent = (msgText) => {
    if (typeof msgText !== "string") return msgText;

    // 1. Sticker renderer
    if (msgText.startsWith("[STIKER:")) {
      const content = msgText.slice(8, -1);
      const [icon, title, subtitle] = content.split("|");
      return (
        <div className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-md flex items-center gap-2.5 my-0.5 border border-white/30">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-xl shadow-inner flex-shrink-0">
            {icon || "✨"}
          </div>
          <div className="min-w-0 text-left">
            <div className="font-extrabold text-xs leading-tight text-white drop-shadow-xs">
              {title || "Stiker Gang Cinta"}
            </div>
            {subtitle && (
              <div className="text-[10px] font-medium text-white/95 mt-0.5 bg-black/15 px-1.5 py-0.2 rounded-md inline-block">
                {subtitle}
              </div>
            )}
          </div>
        </div>
      );
    }

    // 2. Rich Broadcast Card renderer (PENGINGAT IURAN / PENGUMUMAN)
    if (msgText.includes("PENGINGAT IURAN") || msgText.startsWith("📢") || msgText.includes("PENGUMUMAN")) {
      const cleanText = msgText.replace(/\r/g, "");

      // Extract Period
      const periodMatch = cleanText.match(/Periode:\s*\*?([^*]+?)\*?(?:\s|$|Mengingatkan)/i);
      const cleanPeriod = periodMatch ? periodMatch[1].trim() : "September 2026";

      // Extract Title
      const titleMatch = cleanText.match(/📢\s*\*?([^*\n]+?)\*?(?:\s+Periode:|$|\n)/i);
      const cleanTitle = titleMatch ? titleMatch[1].trim() : "PENGINGAT IURAN RT 028 GANG CINTA";

      // Extract Note / Subtitle
      const noteMatch = cleanText.match(/(Mengingatkan bapak\/ibu[^\:]+\:)/i);
      const noteLine = noteMatch ? noteMatch[1].trim() : "Mengingatkan bapak/ibu warga yang belum melunasi iuran bulanan:";

      // Extract list items like "1. Yani (No. 02)", "2. Udin (No. 10)", "3. Dedi (No. 07)"
      const listItems = [];
      const itemRegex = /(\d+\.\s*[^0-9\n\*\:]+?\s*(?:\([^)]+\))?)(?=\s*\d+\.|\s*Mohon|\s*\*|\n|$)/gi;
      let match;
      while ((match = itemRegex.exec(cleanText)) !== null) {
        const itemStr = match[1].replace(/[\*]/g, "").trim();
        if (itemStr && !listItems.includes(itemStr)) {
          listItems.push(itemStr);
        }
      }

      // Extract Recipient instruction
      const recipientMatch = cleanText.match(/(Mohon untuk dapat menyelesaikan[^\.]+\.)/i);
      const recipientLine = recipientMatch ? recipientMatch[1].replace(/[\*]/g, "").trim() : "Mohon untuk dapat menyelesaikan pembayaran iuran sebesar Rp 110.000 kepada Bendahara Nogi (No. 02).";

      // Extract Closing note
      const closingMatch = cleanText.match(/(Terima kasih banyak[^\n]+)/i);
      const closingLine = closingMatch ? closingMatch[1].replace(/[\*]/g, "").trim() : "Terima kasih banyak atas perhatian dan partisipasinya dalam menjaga lingkungan Gang Cinta kita bersama! 🙏😊";

      return (
        <div className="my-1 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-3.5 shadow-xl border border-emerald-500/30 text-left space-y-2.5 w-full">
          {/* Header Badge */}
          <div className="flex items-center justify-between gap-1.5 border-b border-white/10 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/90 px-2 py-0.5 rounded-full border border-emerald-500/40">
                📢 SIARAN RESMI RT
              </span>
            </div>
            {cleanPeriod && (
              <span className="text-[9px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40">
                🗓️ {cleanPeriod}
              </span>
            )}
          </div>

          {/* Title */}
          <div>
            <h4 className="font-black text-xs text-white tracking-wide flex items-center gap-1">
              <span>📢</span> {cleanTitle}
            </h4>
            {noteLine && (
              <p className="text-[10.5px] text-slate-300 mt-1 leading-relaxed">
                {noteLine.replace(/[\*]/g, "")}
              </p>
            )}
          </div>

          {/* Unpaid List Section */}
          {listItems.length > 0 && (
            <div className="bg-black/40 rounded-xl p-2.5 border border-white/10 space-y-1.5">
              <div className="text-[9.5px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                <span>📋 Daftar Belum Lunas ({listItems.length} KK)</span>
                <span className="text-rose-400 font-mono">Belum Bayar</span>
              </div>
              <div className="space-y-1">
                {listItems.map((item, idx) => {
                  const cleanItem = item.replace(/^\d+\.\s*/, "").replace(/[\*]/g, "").trim();
                  return (
                    <div key={idx} className="flex items-center justify-between bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg text-[11px] transition">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[9px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-100">{cleanItem}</span>
                      </div>
                      <span className="text-[9px] font-bold text-rose-300 bg-rose-950/80 px-1.5 py-0.2 rounded border border-rose-500/30">
                        Rp 110rb
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Amount & Bendahara Recipient Box */}
          {recipientLine && (
            <div className="bg-emerald-950/70 rounded-xl p-2 border border-emerald-500/30 text-[10.5px] text-emerald-200 flex items-center gap-1.5">
              <div className="text-base">💰</div>
              <div className="font-medium leading-tight text-[10.5px]">
                {recipientLine}
              </div>
            </div>
          )}

          {/* Footer closing note */}
          {closingLine && (
            <div className="text-[9.5px] text-slate-400 italic pt-1 border-t border-white/5">
              {closingLine}
            </div>
          )}
        </div>
      );
    }

    // 3. General Multiline & WhatsApp Markdown (*bold*) renderer
    const lines = msgText.split("\n");
    return (
      <div className="space-y-1 text-left leading-relaxed">
        {lines.map((line, lIdx) => {
          if (!line.trim()) return <div key={lIdx} className="h-1.5" />;
          const parts = line.split(/(\*[^*]+\*)/g);
          return (
            <div key={lIdx}>
              {parts.map((part, pIdx) => {
                if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
                  return <strong key={pIdx} className="font-black text-amber-300">{part.slice(1, -1)}</strong>;
                }
                return part;
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 lg:bottom-16 lg:right-8 z-50 flex flex-col items-end pointer-events-none">
      
      {/* POPUP CHAT WINDOW (Expanded State) */}
      {isOpen && (
        <div className="pointer-events-auto w-[380px] max-w-[calc(100vw-2.5rem)] h-[540px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden mb-3 animate-fade-in">
          
          {/* Header */}
          <div className="px-4 py-3.5 theme-gradient-banner text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white shadow-xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm leading-tight text-white">Live Chat Gang Cinta</h4>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-white/20 text-white border border-white/30">
                    RT 028
                  </span>
                </div>
                <p className="text-[10px] text-white/95 leading-tight flex items-center gap-1 mt-0.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {activeCount} Warga Sedang Online
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/90 hover:text-white transition"
                title="Kecilkan Chat"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/90 hover:text-white transition"
                title="Tutup Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Online Residents Mini Strip */}
          <div className="bg-slate-50 px-3 py-2 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 flex-shrink-0">
              <Radio className="w-3 h-3 text-emerald-500" /> Online:
            </span>
            <div className="flex items-center gap-1.5">
              {onlineList.filter(u => u.isOnline).slice(0, 6).map((u) => (
                <div
                  key={u.id}
                  className="relative group cursor-pointer"
                  title={`${u.name} (${u.houseNo ? `Rumah ${u.houseNo}` : u.role})`}
                >
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-6 h-6 rounded-full object-cover border border-white shadow-2xs"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                </div>
              ))}
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-slate-50/50">
            {messages.map((m) => {
              const isMe = m.senderId === user?.id;
              const isSticker = typeof m.message === "string" && m.message.startsWith("[STIKER:");
              const isBroadcast = typeof m.message === "string" && (m.message.includes("PENGINGAT IURAN") || m.message.startsWith("📢") || m.message.includes("PENGUMUMAN"));
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                >
                  <img
                    src={getSenderAvatar(m)}
                    alt={getSenderName(m)}
                    className="w-7 h-7 rounded-full object-cover border flex-shrink-0 mt-0.5 shadow-2xs"
                  />

                  <div className={`${isBroadcast ? "w-full max-w-[96%]" : "max-w-[80%]"} space-y-1 ${isMe ? "items-end text-right" : "items-start text-left"}`}>
                    <div className={`flex items-center gap-1.5 ${isMe ? "justify-end" : "justify-start"}`}>
                      <span className="font-bold text-[11px] text-slate-800">
                        {isMe ? "Anda" : getSenderName(m)}
                      </span>
                      {getRoleBadge(getSenderRole(m))}
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatTime(m.timestamp)}
                      </span>
                    </div>

                    <div
                      className={`p-2.5 rounded-2xl text-xs leading-relaxed inline-block shadow-2xs ${
                        isSticker || isBroadcast
                          ? "bg-transparent p-0 border-none shadow-none w-full"
                          : isMe
                          ? "bg-slate-900 text-white rounded-tr-none font-medium border border-slate-800"
                          : "bg-white text-slate-800 rounded-tl-none border border-slate-200"
                      }`}
                    >
                      {renderMessageContent(m.message)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Phrases */}
          <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {quickPhrases.map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => sendQuickPhrase(phrase)}
                className="text-[10px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex-shrink-0"
              >
                {phrase}
              </button>
            ))}
          </div>

          {/* Input Bar & Emoji/Sticker Popup */}
          <div className="p-3 bg-white border-t border-slate-200 relative">
            
            {/* Emoji & Sticker Picker Popover */}
            {showEmojiPicker && (
              <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-20 animate-fade-in">
                {/* Tab Header */}
                <div className="flex border-b border-slate-100 bg-slate-50 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActivePickerTab("emoji")}
                    className={`flex-1 py-2 text-center transition ${
                      activePickerTab === "emoji"
                        ? "bg-white text-amber-600 border-b-2 border-amber-500 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    😀 Emoji
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePickerTab("sticker")}
                    className={`flex-1 py-2 text-center transition ${
                      activePickerTab === "sticker"
                        ? "bg-white text-orange-600 border-b-2 border-orange-500 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    🎨 Stiker Lucu
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-3 max-h-48 overflow-y-auto">
                  {activePickerTab === "emoji" ? (
                    <div className="grid grid-cols-7 gap-1.5 text-center">
                      {EMOJI_LIST.map((emo, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setInputText((prev) => prev + emo);
                          }}
                          className="p-1.5 text-lg hover:bg-amber-50 rounded-xl hover:scale-125 transition-transform"
                        >
                          {emo}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {STICKER_LIST.map((stk) => (
                        <button
                          key={stk.id}
                          type="button"
                          onClick={() => handleSendSticker(stk)}
                          className="p-2 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/80 hover:border-orange-400 hover:shadow-sm flex items-center gap-2 text-left transition transform active:scale-95 group"
                        >
                          <span className="text-2xl group-hover:scale-110 transition-transform">
                            {stk.icon}
                          </span>
                          <div className="min-w-0">
                            <div className="text-[11px] font-bold text-slate-800 truncate">
                              {stk.title}
                            </div>
                            <div className="text-[9px] text-slate-500 truncate">
                              {stk.subtitle}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {user ? (
              <form onSubmit={handleSend} className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-2 rounded-xl border transition ${
                    showEmojiPicker 
                      ? "bg-amber-100 border-amber-300 text-amber-700" 
                      : "bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200"
                  }`}
                  title="Pilih Emoji & Stiker Lucu"
                >
                  <Smile className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Tulis pesan ke warga..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-slate-50 focus:bg-white transition"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2 rounded-xl theme-bg-primary text-white transition disabled:opacity-40 shadow-xs"
                  title="Kirim Pesan"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div 
                onClick={() => requireAuth(() => {}, "Mengirim Pesan Obrolan Warga")}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 cursor-pointer transition text-xs"
              >
                <span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Masuk akun untuk mengobrol
                </span>
                <span className="px-2.5 py-1 rounded-lg theme-bg-primary text-white font-bold text-[10px] flex items-center gap-1 shadow-xs">
                  <LogIn className="w-3 h-3" /> Masuk
                </span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* FLOATING LAUNCHER BUBBLE (Minimized State) */}
      <div className="pointer-events-auto flex items-center gap-3">
        
        {/* Teaser pill on the left of the button when closed */}
        {!isOpen && showTeaser && latestMessage && (
          <div className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur px-3 py-2 rounded-2xl shadow-xl border border-slate-200 animate-fade-in max-w-xs">
            <img
              src={getSenderAvatar(latestMessage)}
              alt={getSenderName(latestMessage)}
              className="w-7 h-7 rounded-full object-cover border"
            />
            <div className="min-w-0 pr-1">
              <p className="text-[10px] font-bold text-slate-800 truncate">
                {getSenderName(latestMessage)}
              </p>
              <p className="text-[11px] text-slate-600 truncate max-w-[170px]">
                {latestMessage.message}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTeaser(false);
              }}
              className="p-1 rounded text-slate-400 hover:text-slate-600"
              title="Tutup Pratinjau"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Main Floating Button - Highly Visible, Sleek & Compact on Mobile */}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTeaser(false);
          }}
          className={`pointer-events-auto flex items-center justify-center gap-2 w-11 h-11 sm:w-auto sm:h-auto p-2 sm:px-4 sm:py-2.5 rounded-full theme-bg-primary text-white shadow-2xl hover:shadow-[0_12px_28px_rgba(0,0,0,0.35)] border-2 border-white/50 transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none cursor-pointer group`}
          title="Buka Live Chat Warga Gang Cinta"
        >
          {isOpen ? (
            <div className="flex items-center justify-center gap-1.5 px-1 sm:px-3">
              <X className="w-5 h-5 text-white" />
              <span className="text-xs font-black tracking-wide hidden sm:inline">Tutup Chat</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 border border-white"></span>
                </span>
                {/* Mobile count indicator */}
                <span className="sm:hidden absolute -bottom-2 -right-2 bg-slate-900/90 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full border border-white/50">
                  {activeCount}
                </span>
              </div>
              <div className="hidden sm:flex flex-col text-left pr-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black tracking-tight leading-tight text-white drop-shadow-2xs whitespace-nowrap">
                    Live Chat Warga
                  </span>
                  <span className="text-[10px] bg-white/30 text-white px-2 py-0.2 rounded-full font-black">
                    {activeCount} Online
                  </span>
                </div>
                <span className="text-[9px] text-white/90 leading-tight">
                  Klik untuk kirim pesan
                </span>
              </div>
            </div>
          )}
        </button>

      </div>

    </div>
  );
}
