import React, { useState, useEffect } from "react";
import { iuranService, duesConfigService, chatService, authService } from "../../services/storageService";
import { useAuth } from "../../context/AuthContext";
import DuesConfigModal from "./DuesConfigModal";
import { 
  CheckCircle2, 
  XCircle, 
  Search, 
  Send, 
  Copy, 
  ExternalLink, 
  MessageSquare, 
  PhoneCall, 
  AlertTriangle,
  UserCheck,
  UserX,
  Users,
  BellRing,
  Sparkles,
  DollarSign,
  Settings2
} from "lucide-react";
import { formatRupiah, formatRupiahParts } from "../../utils/numberUtils";

export default function DuesStatusTab({ currentMonthKey, setCurrentMonthKey }) {
  const { user, showToast, requireAuth } = useAuth();
  
  const [payments, setPayments] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all"); // 'all' | 'paid' | 'unpaid'
  const [searchQuery, setSearchQuery] = useState("");
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const loadData = () => {
    const list = iuranService.getPayments(currentMonthKey);
    setPayments(list);
  };

  useEffect(() => {
    loadData();

    const handleFinanceChange = () => {
      loadData();
    };

    window.addEventListener("finance-data-changed", handleFinanceChange);
    window.addEventListener("dues-config-changed", handleFinanceChange);
    window.addEventListener("storage", handleFinanceChange);
    window.addEventListener("focus", handleFinanceChange);

    return () => {
      window.removeEventListener("finance-data-changed", handleFinanceChange);
      window.removeEventListener("dues-config-changed", handleFinanceChange);
      window.removeEventListener("storage", handleFinanceChange);
      window.removeEventListener("focus", handleFinanceChange);
    };
  }, [currentMonthKey]);

  const monthlyConfig = duesConfigService.getMonthlyConfig(currentMonthKey);
  const targetAmountPerKK = monthlyConfig.totalAmount;

  const paidCount = payments.filter(p => p.status === "paid").length;
  const unpaidCount = payments.filter(p => p.status === "unpaid").length;
  const totalCount = payments.length;

  const paidTotalAmount = payments
    .filter(p => p.status === "paid")
    .reduce((sum, p) => sum + (Number(p.amount) || targetAmountPerKK), 0);
  const unpaidTotalAmount = unpaidCount * targetAmountPerKK;
  const targetTotalAmount = totalCount * targetAmountPerKK;

  const filteredPayments = payments.filter(p => {
    const matchStatus = 
      filterStatus === "all" ? true :
      filterStatus === "paid" ? p.status === "paid" :
      p.status === "unpaid";

    const matchSearch = 
      p.headOfFamily.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.houseNumber.toLowerCase().includes(searchQuery.toLowerCase());

    return matchStatus && matchSearch;
  });

  const handleTogglePaymentStatus = (p) => {
    if (user?.role !== "admin" && user?.role !== "bendahara") {
      showToast("Hanya Bendahara Kas dan Ketua Gang yang berhak memperbarui status iuran warga.", "warning");
      return;
    }

    if (p.status === "paid") {
      if (window.confirm(`Batalkan status lunas untuk ${p.headOfFamily} (${p.houseNumber})?`)) {
        iuranService.markAsUnpaid(currentMonthKey, p.familyId);
        loadData();
        showToast(`Status iuran ${p.headOfFamily} diubah menjadi Belum Bayar.`, "info");
      }
    } else {
      const note = window.prompt(`Catatan Pembayaran ${p.headOfFamily}:`, "Tunai Ke Bendahara") || "Tunai Ke Bendahara";
      iuranService.markAsPaid(currentMonthKey, p.familyId, note, targetAmountPerKK);
      loadData();
      showToast(`Iuran ${p.headOfFamily} berhasil ditandai LUNAS!`, "success");
    }
  };

  const handleSendWAReminder = (p) => {
    const res = iuranService.sendWAReminder(p.headOfFamily, p.houseNumber, p.phone, currentMonthKey, p.amount);
    if (!res.success) {
      navigator.clipboard.writeText(res.text);
      showToast(`${res.message} Teks telah disalin ke clipboard.`, "info");
    } else {
      showToast(`Membuka WhatsApp untuk pengingat iuran ${p.headOfFamily}...`, "success");
    }
  };

  const handleCopyWAText = (p) => {
    const text = iuranService.getWAReminderMessage(p.headOfFamily, p.houseNumber, currentMonthKey, p.amount);
    navigator.clipboard.writeText(text);
    showToast(`Draf pesan WA pengingat iuran untuk ${p.headOfFamily} telah disalin!`, "success");
  };

  const handleBroadcastToLiveChat = () => {
    if (!user) {
      requireAuth(() => {}, "Mengirim Pengingat Ke Chat");
      return;
    }

    const unpaidItems = payments.filter(p => p.status === "unpaid");

    if (unpaidItems.length === 0) {
      showToast("Semua warga sudah lunas! Tidak ada tunggakan iuran bulan ini.", "success");
      return;
    }

    const unpaidListFormatted = unpaidItems
      .map((p, idx) => {
        let hNo = p.houseNumber || "";
        if (hNo && !hNo.toLowerCase().includes("no")) {
          hNo = `No. ${hNo}`;
        }
        return `${idx + 1}. ${p.headOfFamily} (${hNo})`;
      })
      .join("\n");

    let monthTitle = currentMonthKey;
    try {
      const [y, m] = currentMonthKey.split("-");
      const d = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
      monthTitle = d.toLocaleString("id-ID", { month: "long", year: "numeric" });
    } catch {}

    const allUsers = authService.getAllUsers() || [];
    const bendaharaUser = allUsers.find(u => u.role === "bendahara");
    const bendaharaName = bendaharaUser?.name || "Bendahara Gang Cinta";
    let bendaharaHouse = bendaharaUser?.houseNo || "No. 02";
    if (!bendaharaHouse.toLowerCase().includes("rumah")) {
      bendaharaHouse = `Rumah ${bendaharaHouse}`;
    }

    const formattedTargetAmount = formatRupiah(targetAmountPerKK);

    const broadcastMsg = `📢 *PENGINGAT IURAN RT 028 GANG CINTA*
Periode: *${monthTitle}*

Mengingatkan bapak/ibu warga yang belum melunasi iuran bulanan (${unpaidItems.length} KK):

*Daftar Warga Belum Lunas:*
${unpaidListFormatted}

Mohon untuk dapat menyelesaikan pembayaran iuran sebesar *${formattedTargetAmount}* kepada Bendahara ${bendaharaName} (${bendaharaHouse}).

Terima kasih banyak atas perhatian dan partisipasinya dalam menjaga lingkungan Gang Cinta kita bersama! 🙏😊`;

    chatService.sendMessage({ user, message: broadcastMsg });
    showToast("Pengingat iuran (format list rapi) telah disiarkan ke Live Chat Obrolan Warga!", "success");
  };

  return (
    <div className="space-y-6">

      {/* Summary Cards - Proportional 2x2 on Mobile, 4 Cols on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/15 backdrop-blur-md border border-white/20 shadow-md flex items-center gap-2.5 sm:gap-4 text-white theme-gradient-banner">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/20 border border-white/30 text-amber-300 flex items-center justify-center font-bold text-lg sm:text-xl flex-shrink-0">
            <Users className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] sm:text-xs font-bold text-white/80 truncate">Total KK Warga</div>
            <div className="text-lg sm:text-2xl font-black text-white">{totalCount} KK</div>
            <div className="text-[10px] sm:text-[11px] text-white/70 truncate">Target: {formatRupiah(targetTotalAmount)}</div>
          </div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-emerald-500/25 backdrop-blur-md border border-emerald-300/30 shadow-md flex items-center gap-2.5 sm:gap-4 text-white theme-gradient-banner">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-400/30 border border-emerald-300/40 text-emerald-200 flex items-center justify-center font-bold text-lg sm:text-xl flex-shrink-0">
            <UserCheck className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] sm:text-xs font-bold text-emerald-200 truncate">Sudah Bayar</div>
            <div className="text-lg sm:text-2xl font-black text-emerald-200">{paidCount} KK</div>
            <div className="text-[10px] sm:text-[11px] font-semibold text-emerald-200/90 truncate">{formatRupiah(paidTotalAmount)}</div>
          </div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-rose-500/25 backdrop-blur-md border border-rose-300/30 shadow-md flex items-center gap-2.5 sm:gap-4 text-white theme-gradient-banner">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-rose-400/30 border border-rose-300/40 text-rose-200 flex items-center justify-center font-bold text-lg sm:text-xl flex-shrink-0">
            <UserX className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] sm:text-xs font-bold text-rose-200 truncate">Belum Bayar</div>
            <div className="text-lg sm:text-2xl font-black text-rose-200">{unpaidCount} KK</div>
            <div className="text-[10px] sm:text-[11px] font-semibold text-rose-200/90 truncate">{formatRupiah(unpaidTotalAmount)}</div>
          </div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-amber-500/25 backdrop-blur-md border border-amber-300/30 shadow-md flex items-center justify-center text-center text-white theme-gradient-banner">
          <div className="space-y-0.5 sm:space-y-1 w-full">
            <div className="text-[11px] sm:text-xs font-bold text-amber-200 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" /> Pelunasan
            </div>
            <div className="text-xl sm:text-3xl font-black text-amber-200">
              {totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0}%
            </div>
            <div className="w-full bg-white/20 h-1.5 sm:h-2 rounded-full overflow-hidden mt-1 border border-white/20">
              <div 
                className="bg-amber-300 h-full rounded-full transition-all duration-500 shadow-sm" 
                style={{ width: `${totalCount > 0 ? (paidCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Main Table Section - Theme Gradient & Glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl theme-gradient-banner text-white p-5 sm:p-7 shadow-xl space-y-5 border border-white/20 transition-all">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Header & Broadcast Buttons */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/20 pb-5">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-white/20 border border-white/30 text-amber-300">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              Daftar Status Pembayaran Iuran Warga Gang Cinta
            </h3>
            <p className="text-xs text-white/80 mt-1">
              Tarif iuran aktif saat ini: <span className="font-extrabold text-amber-300">{formatRupiah(targetAmountPerKK)} / KK</span> ({monthlyConfig.components.length} pos aktif).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Configure Dues Rates Button (Bendahara & Admin) */}
            {(user?.role === "admin" || user?.role === "bendahara") && (
              <button
                onClick={() => setIsConfigModalOpen(true)}
                className="px-4 py-2.5 rounded-full bg-amber-500/30 hover:bg-amber-500/40 text-amber-100 border border-amber-300/40 font-extrabold text-xs shadow-md flex items-center gap-2 transition backdrop-blur-md active:scale-95 cursor-pointer"
              >
                <Settings2 className="w-4 h-4 text-amber-300" />
                <span>⚙️ Atur Pos & Tarif Iuran</span>
              </button>
            )}

            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="px-4 py-2.5 rounded-full bg-emerald-500/30 hover:bg-emerald-500/40 text-emerald-100 border border-emerald-300/40 font-extrabold text-xs shadow-md flex items-center gap-2 transition backdrop-blur-md active:scale-95 cursor-pointer"
            >
              <BellRing className="w-4 h-4 text-emerald-300" />
              <span>📱 Reminder WA ({unpaidCount} Belum Bayar)</span>
            </button>

            <button
              onClick={handleBroadcastToLiveChat}
              className="px-4 py-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30 font-extrabold text-xs shadow-md flex items-center gap-2 transition backdrop-blur-md active:scale-95 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-amber-300" />
              <span>📢 Siarkan Ke Live Chat</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md p-1 rounded-2xl border border-white/20 text-xs font-bold w-full sm:w-auto">
            <button
              onClick={() => setFilterStatus("all")}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl transition ${
                filterStatus === "all" ? "bg-amber-300 text-slate-900 shadow-md font-extrabold" : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              Semua ({totalCount})
            </button>
            <button
              onClick={() => setFilterStatus("paid")}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl transition ${
                filterStatus === "paid" ? "bg-emerald-500 text-white shadow-md font-extrabold border border-emerald-300" : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              ✅ Lunas ({paidCount})
            </button>
            <button
              onClick={() => setFilterStatus("unpaid")}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl transition ${
                filterStatus === "unpaid" ? "bg-rose-500 text-white shadow-md font-extrabold border border-rose-300" : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              ⚠️ Belum Bayar ({unpaidCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-white/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama warga / no. rumah..."
              className="w-full pl-9 pr-4 py-2 rounded-2xl border border-white/30 text-xs text-white placeholder-white/70 bg-white/20 backdrop-blur-md focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 focus:ring-2 focus:ring-amber-300 focus:outline-none transition shadow-inner"
            />
          </div>

        </div>

        {/* Table List */}
        <div className="relative z-10 w-full max-w-full overflow-x-auto rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-md">
          <table className="w-full text-left text-xs min-w-[580px]">
            <thead className="bg-white/20 text-white font-extrabold border-b border-white/20">
              <tr>
                <th className="p-3.5">Rumah & Kepala Keluarga</th>
                <th className="p-3.5">No. Kontak WA</th>
                <th className="p-3.5">Nominal Iuran</th>
                <th className="p-3.5">Status Pembayaran</th>
                <th className="p-3.5 text-center">Aksi / Kirim Pengingat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-white/70 font-medium">
                    Tidak ditemukan data warga yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const isPaid = p.status === "paid";
                  return (
                    <tr key={p.familyId} className="hover:bg-white/15 transition text-white">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center flex-shrink-0 ${
                            isPaid ? "bg-emerald-500/30 text-emerald-200 border border-emerald-300/40" : "bg-rose-500/30 text-rose-200 border border-rose-300/40"
                          }`}>
                            {p.houseNumber.replace("No. ", "")}
                          </div>
                          <div>
                            <div className="font-extrabold text-white text-xs sm:text-sm">
                              {p.headOfFamily}
                            </div>
                            <div className="text-[11px] text-white/70">
                              Rumah {p.houseNumber} • Gang Cinta
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-mono text-white/90 font-semibold text-xs flex items-center gap-1.5">
                          <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
                          {p.phone || "-"}
                        </div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap font-mono">
                        {(() => {
                          const parts = formatRupiahParts(p.amount);
                          return (
                            <div className="flex items-center justify-between gap-2 max-w-[110px]">
                              <span className="text-white/70 font-semibold text-left">{parts.symbol}</span>
                              <span className="font-extrabold text-white text-right tabular-nums">{parts.digits}</span>
                            </div>
                          );
                        })()}
                      </td>

                      <td className="p-3.5">
                        {isPaid ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/30 text-emerald-200 border border-emerald-300/40">
                              <CheckCircle2 className="w-3 h-3 text-emerald-300" /> LUNAS
                            </span>
                            {p.paidAt && (
                              <div className="text-[10px] text-white/70 mt-1">
                                Tgl: {p.paidAt} ({p.note || "Lunas"})
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/30 text-rose-200 border border-rose-300/40">
                              <XCircle className="w-3 h-3 text-rose-300" /> BELUM BAYAR
                            </span>
                            <div className="text-[10px] text-rose-300 font-semibold mt-1">
                              Tunggakan 1 Bulan
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          
                          {/* Toggle Paid Button (Bendahara/Admin) */}
                          {(user?.role === "admin" || user?.role === "bendahara") && (
                            <button
                              onClick={() => handleTogglePaymentStatus(p)}
                              className={`px-3 py-1.5 rounded-full font-extrabold text-[11px] transition shadow-xs cursor-pointer ${
                                isPaid
                                  ? "bg-white/20 hover:bg-white/30 text-white border border-white/30"
                                  : "bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-300"
                              }`}
                              title={isPaid ? "Batalkan Lunas" : "Tandai LUNAS"}
                            >
                              {isPaid ? "Ubah Status" : "Tandai Lunas"}
                            </button>
                          )}

                          {/* WhatsApp Reminder Button */}
                          {!isPaid && (
                            <>
                              <button
                                onClick={() => handleSendWAReminder(p)}
                                className="px-3 py-1.5 rounded-full bg-emerald-500/30 hover:bg-emerald-500/40 text-emerald-100 border border-emerald-300/40 font-extrabold text-[11px] flex items-center gap-1 transition shadow-xs cursor-pointer"
                                title="Kirim Pengingat WhatsApp"
                              >
                                <Send className="w-3 h-3 text-emerald-300" />
                                <span>📱 Kirim WA</span>
                              </button>

                              <button
                                onClick={() => handleCopyWAText(p)}
                                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30 transition cursor-pointer"
                                title="Salin Teks Pesan WA"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* BROADCAST REMINDER MODAL */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 border border-slate-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Pengingat Iuran WA untuk Warga ({unpaidCount} KK)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kirim pesan WhatsApp pengingat iuran langsung ke masing-masing warga yang belum bayar.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* List of Unpaid Residents with 1-click WA launch */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Daftar Warga Menunggak Iuran:
              </h4>

              {payments.filter(p => p.status === "unpaid").length === 0 ? (
                <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center border border-emerald-200">
                  🎉 Luar biasa! Semua warga telah melunasi iuran bulan ini!
                </div>
              ) : (
                payments.filter(p => p.status === "unpaid").map((p) => (
                  <div key={p.familyId} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-extrabold text-xs text-slate-900">{p.headOfFamily} ({p.houseNumber})</div>
                      <div className="text-[11px] text-slate-500 font-mono">No. WA: {p.phone || "Belum ada"}</div>
                    </div>

                    <button
                      onClick={() => handleSendWAReminder(p)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Buka WA</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Broadcast List Template Preview */}
            {(() => {
              const unpaidItems = payments.filter(p => p.status === "unpaid");
              const unpaidListFormatted = unpaidItems.length > 0
                ? unpaidItems.map((p, idx) => `${idx + 1}. ${p.headOfFamily} (${p.houseNumber})`).join("\n")
                : "Semua warga telah lunas!";
              
              let monthTitle = currentMonthKey;
              try {
                const [y, m] = currentMonthKey.split("-");
                const d = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
                monthTitle = d.toLocaleString("id-ID", { month: "long", year: "numeric" });
              } catch {}

              const allUsers = authService.getAllUsers() || [];
              const bendaharaUser = allUsers.find(u => u.role === "bendahara");
              const bendaharaName = bendaharaUser?.name || "Bendahara Gang Cinta";
              const bendaharaHouse = bendaharaUser?.houseNo ? ` (${bendaharaUser.houseNo})` : "";

              const broadcastMsgText = `📢 *PENGINGAT IURAN RT 028 GANG CINTA*
Periode: *${monthTitle}*

Mengingatkan bapak/ibu warga yang belum melunasi iuran bulanan (${unpaidItems.length} KK):

*Daftar Warga Belum Lunas:*
${unpaidListFormatted}

Mohon untuk dapat menyelesaikan pembayaran iuran sebesar *${formatRupiah(targetAmountPerKK)}* kepada Bendahara ${bendaharaName}${bendaharaHouse}.

Terima kasih banyak atas perhatian dan partisipasinya! 🙏😊`;

              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700">Format Draf Pesan Siaran List Rapi (Grup WA / Live Chat):</h4>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(broadcastMsgText);
                        showToast("Format pengingat list rapi berhasil disalin ke clipboard!", "success");
                      }}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 transition"
                    >
                      <Copy className="w-3.5 h-3.5" /> Salin List WA
                    </button>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono leading-relaxed whitespace-pre-wrap border border-slate-800 shadow-inner">
                    {broadcastMsgText}
                  </div>
                </div>
              );
            })()}

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DUES CONFIGURATION MODAL FOR BENDAHARA & ADMIN */}
      <DuesConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        monthKey={currentMonthKey}
      />

    </div>
  );
}
