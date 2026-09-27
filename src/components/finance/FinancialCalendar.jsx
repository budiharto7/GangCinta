import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  ArrowDownRight, 
  ArrowUpRight, 
  Plus, 
  X,
  Clock,
  Wallet,
  Edit3,
  Trash2
} from "lucide-react";
import { formatRupiahParts } from "../../utils/numberUtils";

export default function FinancialCalendar({ 
  currentMonthKey, 
  onMonthChange, 
  transactions, 
  categories, 
  onOpenAddTransactionWithDate,
  onEditTransaction,
  onDeleteTransaction
}) {
  const { user } = useAuth();
  const [selectedDateDetails, setSelectedDateDetails] = useState(null);

  // Parse current year and month from "YYYY-MM"
  const [yearStr, monthStr] = currentMonthKey.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // 0-indexed

  // Month date computations
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // In Indonesian calendar, week starts on Monday (1) to Sunday (0)
  // getDay(): 0 is Sunday, 1 is Monday...
  let startDayOfWeek = firstDayOfMonth.getDay();
  // Adjust so Monday is 0, Sunday is 6
  let startingIndex = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  // Build days grid
  const calendarCells = [];
  for (let i = 0; i < startingIndex; i++) {
    calendarCells.push({ isPadding: true, key: `pad-${i}` });
  }

  // Group transactions by "YYYY-MM-DD"
  const trxByDate = {};
  transactions.forEach((t) => {
    if (!trxByDate[t.date]) trxByDate[t.date] = [];
    trxByDate[t.date].push(t);
  });

  for (let d = 1; d <= daysInMonth; d++) {
    const dayPadded = String(d).padStart(2, "0");
    const dateKey = `${currentMonthKey}-${dayPadded}`;
    const dayTrx = trxByDate[dateKey] || [];
    
    const dayExpense = dayTrx.filter(t => t.type === "expense").reduce((acc, c) => acc + c.amount, 0);
    const dayIncome = dayTrx.filter(t => t.type === "income").reduce((acc, c) => acc + c.amount, 0);

    calendarCells.push({
      isPadding: false,
      dayNumber: d,
      dateKey,
      transactions: dayTrx,
      expense: dayExpense,
      income: dayIncome,
      key: dateKey
    });
  }

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const handlePrevMonth = () => {
    const prevDate = new Date(year, month - 1, 1);
    const m = String(prevDate.getMonth() + 1).padStart(2, "0");
    onMonthChange(`${prevDate.getFullYear()}-${m}`);
  };

  const handleNextMonth = () => {
    const nextDate = new Date(year, month + 1, 1);
    const m = String(nextDate.getMonth() + 1).padStart(2, "0");
    onMonthChange(`${nextDate.getFullYear()}-${m}`);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5 sm:p-7">
      
      {/* Calendar Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Kalender Keuangan Kas Terhubung Tanggal
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Klik pada tanggal mana pun untuk memeriksa rincian pengeluaran dan pemasukan pada hari tersebut.
          </p>
        </div>

        {/* Month switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 font-bold text-xs text-indigo-900 min-w-[150px] text-center">
            {monthNames[month]} {year}
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Bulan Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 py-1 uppercase tracking-wider">
        {dayNames.map((d, i) => (
          <div key={i} className={`py-1.5 ${i >= 5 ? "text-rose-500" : ""}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarCells.map((cell) => {
          if (cell.isPadding) {
            return (
              <div
                key={cell.key}
                className="aspect-square sm:aspect-[4/3] rounded-2xl bg-slate-50/50 border border-dashed border-slate-100 opacity-40"
              />
            );
          }

          const hasTrx = cell.transactions.length > 0;

          return (
            <div
              key={cell.key}
              onClick={() => setSelectedDateDetails(cell)}
              className={`aspect-square sm:aspect-[4/3] p-1.5 sm:p-2 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                hasTrx
                  ? "bg-white hover:bg-indigo-50/40 border-slate-200 hover:border-indigo-300 shadow-2xs hover:shadow-sm"
                  : "bg-slate-50/30 hover:bg-slate-100/70 border-slate-100 text-slate-400"
              }`}
            >
              {/* Day Number */}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${hasTrx ? "text-slate-800" : "text-slate-400"}`}>
                  {cell.dayNumber}
                </span>

                {hasTrx && (
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                )}
              </div>

              {/* Transactions Badges on Cell */}
              {hasTrx ? (
                <div className="space-y-0.5 sm:space-y-1">
                  {cell.income > 0 && (
                    <div className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 truncate flex items-center gap-0.5">
                      <ArrowUpRight className="w-2.5 h-2.5 flex-shrink-0" />
                      <span className="hidden sm:inline">+{formatRupiah(cell.income)}</span>
                      <span className="sm:hidden">+{Math.round(cell.income / 1000)}k</span>
                    </div>
                  )}
                  {cell.expense > 0 && (
                    <div className="text-[9px] sm:text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 truncate flex items-center gap-0.5">
                      <ArrowDownRight className="w-2.5 h-2.5 flex-shrink-0" />
                      <span className="hidden sm:inline">-{formatRupiah(cell.expense)}</span>
                      <span className="sm:hidden">-{Math.round(cell.expense / 1000)}k</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[10px] text-slate-300 hidden sm:block text-center py-1">
                  -
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Date Detail Modal */}
      {selectedDateDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in my-8">
            
            {/* Modal Header */}
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h4 className="font-bold text-base">
                    Transaksi Tanggal {selectedDateDetails.dayNumber} {monthNames[month]} {year}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {selectedDateDetails.transactions.length} Catatan Transaksi Kas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDateDetails(null)}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              
              {/* Daily Totals */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase text-emerald-800">Total Masuk</span>
                  <div className="text-sm font-extrabold text-emerald-700 mt-0.5">
                    {formatRupiah(selectedDateDetails.income)}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
                  <span className="text-[10px] font-bold uppercase text-rose-800">Total Keluar</span>
                  <div className="text-sm font-extrabold text-rose-700 mt-0.5">
                    {formatRupiah(selectedDateDetails.expense)}
                  </div>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-2.5 pt-2">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Rincian Transaksi:
                </h5>

                {selectedDateDetails.transactions.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs border border-dashed rounded-2xl">
                    Tidak ada transaksi tercatat pada tanggal ini.
                  </div>
                ) : (
                  selectedDateDetails.transactions.map((trx) => {
                    const catObj = categories.find(c => c.id === trx.category);
                    const isExp = trx.type === "expense";
                    return (
                      <div
                        key={trx.id}
                        className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-3 group hover:border-slate-300 transition"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-slate-800">
                              {trx.title}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${catObj?.badgeBg || 'bg-slate-100'}`}>
                              {catObj?.name || trx.category}
                            </span>
                          </div>
                          {trx.description && (
                            <p className="text-xs text-slate-500">
                              {trx.description}
                            </p>
                          )}
                          <div className="text-[10px] text-slate-400">
                            Pencatat: {trx.recordedBy}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 flex-shrink-0 font-mono">
                          {(() => {
                            const parts = formatRupiahParts(trx.amount, isExp ? "-" : "+");
                            return (
                              <div className={`flex items-center justify-between gap-2 text-xs sm:text-sm font-extrabold ${isExp ? "text-rose-600" : "text-emerald-600"}`}>
                                <span className="text-left font-bold">{parts.symbol}</span>
                                <span className="text-right font-extrabold tabular-nums">{parts.digits}</span>
                              </div>
                            );
                          })()}

                          {(user?.role === "bendahara" || user?.role === "admin") && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDateDetails(null);
                                  if (onEditTransaction) onEditTransaction(trx);
                                }}
                                className="p-1 rounded-lg text-indigo-600 hover:bg-indigo-100 bg-white border border-slate-200 transition"
                                title="Edit Transaksi Ini"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (onDeleteTransaction) onDeleteTransaction(trx.id, trx.title);
                                  setSelectedDateDetails(prev => ({
                                    ...prev,
                                    transactions: prev.transactions.filter(t => t.id !== trx.id)
                                  }));
                                }}
                                className="p-1 rounded-lg text-rose-600 hover:bg-rose-100 bg-white border border-slate-200 transition"
                                title="Hapus Transaksi Ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Add button for Bendahara & Admin */}
              {(user?.role === "bendahara" || user?.role === "admin") && (
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      const d = selectedDateDetails.dateKey;
                      setSelectedDateDetails(null);
                      onOpenAddTransactionWithDate(d);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
                  >
                    <Plus className="w-4 h-4" /> Catat Transaksi di Tanggal Ini ({selectedDateDetails.dayNumber} {monthNames[month]})
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
