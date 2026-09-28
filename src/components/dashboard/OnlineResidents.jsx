import React, { useState, useEffect } from "react";
import { chatService } from "../../services/storageService";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Users, Radio, Sparkles, Activity } from "lucide-react";
import GangCintaLogo from "../common/GangCintaLogo";

export default function OnlineResidents() {
  const { user, allUsers } = useAuth();
  const { currentTheme } = useTheme();
  const [onlineList, setOnlineList] = useState([]);

  const updateList = () => {
    setOnlineList(chatService.getOnlineUsers(user));
  };

  useEffect(() => {
    updateList();
    const interval = setInterval(updateList, 5000);

    window.addEventListener("users-data-changed", updateList);
    window.addEventListener("families-data-changed", updateList);
    window.addEventListener("storage", updateList);
    window.addEventListener("focus", updateList);

    return () => {
      clearInterval(interval);
      window.removeEventListener("users-data-changed", updateList);
      window.removeEventListener("families-data-changed", updateList);
      window.removeEventListener("storage", updateList);
      window.removeEventListener("focus", updateList);
    };
  }, [user]);

  const activeCount = onlineList.filter(u => u.isOnline).length;

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl theme-gradient-banner text-white p-3.5 sm:p-6 shadow-xl space-y-2.5 sm:space-y-4 transition-all">
      
      {/* Large Translucent Background Logo behind text */}
      <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-20 pointer-events-none z-0 hidden sm:block">
        <GangCintaLogo size="xl" variant="plain" />
      </div>

      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header - Compact on HP */}
      <div className="relative z-10 flex items-center justify-between gap-2 border-b border-white/20 pb-2.5 sm:pb-3.5">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl flex items-center justify-center bg-white/15 backdrop-blur-md border border-white/20 relative flex-shrink-0 shadow-2xs">
            <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400"></span>
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-xs sm:text-base text-white tracking-tight flex items-center gap-1.5 drop-shadow-xs truncate">
              <span>Warga yang Sedang Online</span>
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 flex-shrink-0" />
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-200 opacity-90 truncate hidden sm:block">
              Status aktivitas warga di portal Gang Cinta
            </p>
          </div>
        </div>

        <span className="inline-flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-extrabold px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white text-slate-900 shadow-md flex-shrink-0">
          <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
          <span>{activeCount} Aktif</span>
        </span>
      </div>

      {/* Horizontal Scroll Residents List - Compact, sleek & thumb-scrollable */}
      <div className="relative z-10 flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
        {onlineList.map((res) => {
          const isCurrentUser = res.id === user?.id;
          const userObj = (allUsers || []).find(u => u.id === res.id);
          const displayName = userObj?.name || res.name;
          const displayAvatar = userObj?.avatar || res.avatar;
          const displayHouseNo = userObj?.houseNo || res.houseNo;

          // Lebih ringkas di HP: jangan ulangi kata "Rumah"
          const shortHouse = displayHouseNo ? displayHouseNo.replace(/^Rumah\s+/i, "") : res.role;

          return (
            <div
              key={res.id}
              className={`flex items-center gap-2 sm:gap-2.5 p-1.5 sm:p-2.5 pr-2.5 sm:pr-3 rounded-xl sm:rounded-2xl border transition-all duration-200 flex-shrink-0 ${
                res.isOnline
                  ? "bg-white/20 backdrop-blur-md border-white/30 shadow-md hover:bg-white/30 hover:scale-[1.02]"
                  : "bg-white/10 backdrop-blur-xs border-white/15 opacity-60 hover:opacity-100"
              }`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={displayAvatar}
                  alt={displayName}
                  className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover border-2 shadow-xs ${
                    res.isOnline ? "border-amber-300 ring-2 ring-emerald-400/50" : "border-white/30"
                  }`}
                />
                {res.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400 border-2 border-slate-900 shadow-xs"></span>
                )}
              </div>

              <div className="min-w-0 pr-0.5 sm:pr-1.5">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-[11px] sm:text-xs font-extrabold text-white whitespace-nowrap drop-shadow-xs">
                    {displayName}
                  </span>
                  {isCurrentUser && (
                    <span className="text-[8px] sm:text-[9px] font-extrabold px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded bg-amber-400 text-slate-950 shadow-2xs">
                      Anda
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-200 whitespace-nowrap opacity-90">
                  <span className="truncate max-w-[85px] sm:max-w-none">{shortHouse}</span>
                  <span>•</span>
                  <span className={res.isOnline ? "text-emerald-300 font-bold" : "text-slate-300 font-medium"}>
                    {res.lastActive}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
