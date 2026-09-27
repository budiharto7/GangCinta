import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import Navbar from "./components/common/Navbar";
import Sidebar from "./components/common/Sidebar";
import Toast from "./components/common/Toast";
import LoginModal from "./components/auth/LoginModal";
import ProfileModal from "./components/common/ProfileModal";
import ThemeModal from "./components/common/ThemeModal";
import Dashboard from "./components/dashboard/Dashboard";
import GalleryPage from "./components/gallery/GalleryPage";
import UploadMomentModal from "./components/gallery/UploadMomentModal";
import ResidentsPage from "./components/residents/ResidentsPage";
import FinancePage from "./components/finance/FinancePage";
import GuestReportsPage from "./components/guestReports/GuestReportsPage";
import CommunityChat from "./components/dashboard/CommunityChat";
import FloatingChatWidget from "./components/common/FloatingChatWidget";
import BottomNav from "./components/common/BottomNav";
import ErrorBoundary from "./components/common/ErrorBoundary";

function MainApp() {
  const { 
    user, 
    loading, 
    requireAuth, 
    isLoginModalOpen, 
    closeLoginModal, 
    pendingActionName 
  } = useAuth();
  const { currentTheme, uploadedBg, currentOverlay, bgType, currentBgPreset, zoomLevel } = useTheme();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(typeof window !== "undefined" ? window.innerWidth >= 1024 : true);

  React.useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Floating Chat Widget state
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Modals state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isUploadMomentOpen, setIsUploadMomentOpen] = useState(false);
  const [isRegisterKKOpen, setIsRegisterKKOpen] = useState(false);
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [isGuestReportOpen, setIsGuestReportOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-sm">
        Memuat Portal Gang Cinta - Perumahan Bumi Nagara Lestari (RT 028 RW 005)...
      </div>
    );
  }

  // Protected modal openers
  const handleOpenUploadMoment = () => {
    requireAuth(() => setIsUploadMomentOpen(true), "Upload Foto Momen Acara");
  };

  const handleOpenRegisterKK = () => {
    requireAuth(() => {
      setActiveTab("residents");
      setIsRegisterKKOpen(true);
    }, "Registrasi KK Baru");
  };

  const handleOpenNewTransaction = () => {
    requireAuth(() => {
      setActiveTab("finance");
      setIsNewTransactionOpen(true);
    }, "Input Transaksi Kas");
  };

  const handleOpenGuestReport = () => {
    requireAuth(() => {
      setActiveTab("guests");
      setIsGuestReportOpen(true);
    }, "Lapor Tamu Menginap");
  };

  const isUploadedBg = bgType === "uploaded" && !!uploadedBg;
  const bgStyle = isUploadedBg
    ? {
        backgroundImage: `${currentOverlay.gradient}, url(${uploadedBg})`
      }
    : (bgType === "dark-emerald-banner" || !currentBgPreset)
    ? {
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a34 45%, #0d1527 80%, #0f172a 100%)",
        backgroundAttachment: "fixed"
      }
    : undefined;

  const bgClass = isUploadedBg
    ? "theme-wallpaper-bg"
    : (currentBgPreset?.bgClass || "bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 text-white");

  return (
    <div 
      className={`h-screen w-full flex flex-col font-sans transition-colors duration-300 relative overflow-hidden ${bgClass}`}
      style={bgStyle}
    >
      {/* Ambient Glowing Color Orbs for Dark Emerald Banner Background */}
      {(bgType === "dark-emerald-banner" || !bgType) && !isUploadedBg && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-60">
          <div className="absolute -top-40 -left-40 w-[42rem] h-[42rem] rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
          <div className="absolute top-1/3 -right-40 w-[42rem] h-[42rem] rounded-full bg-teal-500/20 blur-3xl animate-pulse delay-1000" />
          <div className="absolute -bottom-40 left-1/3 w-[42rem] h-[42rem] rounded-full bg-amber-500/15 blur-3xl animate-pulse delay-700" />
          <div className="absolute top-1/2 left-10 w-[32rem] h-[32rem] rounded-full bg-emerald-600/15 blur-3xl animate-pulse delay-500" />
        </div>
      )}

      {bgType === "aurora-mesh" && !isUploadedBg && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-60">
          <div className="absolute -top-40 -left-40 w-[30rem] h-[30rem] rounded-full bg-emerald-300/35 blur-3xl animate-pulse" />
          <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-indigo-300/35 blur-3xl animate-pulse delay-1000" />
          <div className="absolute -bottom-40 left-1/3 w-[30rem] h-[30rem] rounded-full bg-amber-300/30 blur-3xl animate-pulse delay-700" />
        </div>
      )}

      {bgType === "gradient-sunset" && !isUploadedBg && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-60">
          <div className="absolute -top-40 -left-40 w-[30rem] h-[30rem] rounded-full bg-rose-300/35 blur-3xl animate-pulse" />
          <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-amber-300/35 blur-3xl animate-pulse delay-1000" />
        </div>
      )}

      {bgType === "gradient-ocean" && !isUploadedBg && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-60">
          <div className="absolute -top-40 -left-40 w-[30rem] h-[30rem] rounded-full bg-cyan-300/35 blur-3xl animate-pulse" />
          <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-blue-400/35 blur-3xl animate-pulse delay-1000" />
        </div>
      )}

      {bgType === "gradient-cyber" && !isUploadedBg && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-60">
          <div className="absolute -top-40 -left-40 w-[30rem] h-[30rem] rounded-full bg-purple-400/35 blur-3xl animate-pulse" />
          <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-pink-400/35 blur-3xl animate-pulse delay-1000" />
        </div>
      )}
      {/* Responsive App Layout - Automatically adapts between Mobile and Desktop */}
      <div className="w-full h-full flex flex-col relative z-10 overflow-hidden">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenTheme={() => setIsThemeOpen(true)}
          onOpenLogin={() => requireAuth(() => {}, "Masuk ke Akun Warga")}
        />

        {/* Scrollable Main Content Container - Navbar above is 100% frozen and never moves */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden w-full flex flex-col pt-16 sm:pt-18 scroll-smooth">
          <div className="flex-1 flex pb-24 lg:pb-8">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              mobileMenuOpen={mobileMenuOpen}
              setMobileMenuOpen={setMobileMenuOpen}
              onOpenTheme={() => setIsThemeOpen(true)}
            />

            {/* Main Content Area - Auto Responsive: fluid on mobile, max-w-7xl on PC */}
            <main 
              className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 transition-all duration-200"
              style={{ zoom: isDesktop && zoomLevel !== 100 ? `${zoomLevel}%` : undefined }}
            >
              {activeTab === "dashboard" && (
                <Dashboard
                  setActiveTab={setActiveTab}
                  onOpenUploadMoment={handleOpenUploadMoment}
                  onOpenNewTransaction={handleOpenNewTransaction}
                  onOpenRegisterKK={handleOpenRegisterKK}
                  onOpenChat={() => setIsChatOpen(true)}
                />
              )}

              {activeTab === "moments" && (
                <GalleryPage
                  onOpenUpload={handleOpenUploadMoment}
                />
              )}

              {activeTab === "residents" && (
                <ResidentsPage
                  isRegisterOpen={isRegisterKKOpen}
                  setIsRegisterOpen={setIsRegisterKKOpen}
                />
              )}

              {activeTab === "finance" && (
                <FinancePage
                  isTransactionOpen={isNewTransactionOpen}
                  setIsTransactionOpen={setIsNewTransactionOpen}
                />
              )}

              {activeTab === "guests" && (
                <GuestReportsPage
                  isReportOpen={isGuestReportOpen}
                  setIsReportOpen={setIsGuestReportOpen}
                />
              )}

              {activeTab === "chat" && (
                <div className="space-y-4">
                  <div className="relative overflow-hidden p-5 sm:p-6 rounded-3xl theme-gradient-banner text-white shadow-xl flex items-center justify-between border border-white/20">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                        <span>💬</span> Obrolan & Forum Warga Gang Cinta
                      </h2>
                      <p className="text-xs sm:text-sm text-white/80 mt-1">
                        Ruang komunikasi interaktif, berbagi info terkini, silaturahmi, dan guyub rukun RT 028 RW 005.
                      </p>
                    </div>
                  </div>
                  <CommunityChat />
                </div>
              )}
            </main>
          </div>
        </div>

        {/* Bottom Navigation Bar - Only on Mobile/Tablet */}
        <BottomNav 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      {/* Floating Live Chat Widget (Docked at Bottom-Right for All Pages) */}
      <FloatingChatWidget
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
      />

      {/* On-Demand Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        pendingActionName={pendingActionName}
      />

      {/* Profile & Theme Modals */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <ThemeModal
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
      />

      {/* Global Action Modals */}
      <UploadMomentModal
        isOpen={isUploadMomentOpen}
        onClose={() => setIsUploadMomentOpen(false)}
      />

      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
