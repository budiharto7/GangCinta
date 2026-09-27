import React from "react";
import { 
  LayoutDashboard, 
  Camera, 
  Users, 
  Wallet, 
  UserPlus,
  MessageSquare
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function BottomNav({ activeTab, setActiveTab }) {
  const { user, requireAuth } = useAuth();
  const { currentTheme } = useTheme();

  const navItems = [
    {
      id: "dashboard",
      label: "Beranda",
      icon: LayoutDashboard
    },
    {
      id: "moments",
      label: "Momen",
      icon: Camera
    },
    {
      id: "residents",
      label: "Warga",
      icon: Users
    },
    {
      id: "finance",
      label: "Kas Pos",
      icon: Wallet
    },
    {
      id: "chat",
      label: "Obrolan",
      icon: MessageSquare
    },
    {
      id: "guests",
      label: "Tamu",
      icon: UserPlus,
      requiresLogin: true
    }
  ];

  const handleTabClick = (item) => {
    if (item.requiresLogin && !user) {
      requireAuth(() => setActiveTab(item.id), item.label);
      return;
    }
    setActiveTab(item.id);
  };

  return (
    <nav 
      aria-label="Navigasi Bawah Aplikasi"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-slate-900/95 backdrop-blur-xl border-t border-white/15 px-1 py-1 transition-all shadow-[0_-8px_25px_rgba(0,0,0,0.4)]"
    >
      <div className="w-full max-w-lg mx-auto grid grid-cols-6 items-center gap-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item)}
              className={`relative flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-200 select-none group cursor-pointer ${
                isActive 
                  ? "text-white scale-105" 
                  : "text-slate-400 hover:text-slate-200 hover:scale-100"
              }`}
            >
              {/* Active Indicator Backdrop Pill */}
              {isActive && (
                <span className="absolute inset-0 bg-white/15 rounded-2xl theme-border-light border shadow-sm animate-fade-in" />
              )}

              {/* Icon Container with subtle glow when active */}
              <div className="relative z-10 flex items-center justify-center">
                <Icon 
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? "scale-110 theme-text-primary text-amber-300" : "group-hover:scale-105"
                  }`} 
                />
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                )}
              </div>

              {/* Text Label */}
              <span 
                className={`relative z-10 text-[9px] mt-0.5 font-bold tracking-tight truncate max-w-full text-center transition-colors ${
                  isActive ? "text-white font-extrabold" : "text-slate-300 group-hover:text-white"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
