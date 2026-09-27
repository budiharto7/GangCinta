import React from "react";
import { 
  Printer, 
  X, 
  FileSpreadsheet, 
  FileText,
  Download,
  ShieldCheck, 
  CheckCircle2,
  Sparkles
} from "lucide-react";
import GangCintaLogo from "../common/GangCintaLogo";
import { exportToWord, exportToExcelFormatted } from "../../utils/reportExporter";
import { formatRupiah, formatRupiahParts } from "../../utils/numberUtils";
import { authService, approvalService, signatureService } from "../../services/storageService";
import { useAuth } from "../../context/AuthContext";

export default function PrintFinanceModal({ 
  isOpen, 
  onClose, 
  summary, 
  currentMonthKey, 
  categories,
  onApprovalUpdate 
}) {
  const { user } = useAuth();

  if (!isOpen || !summary) return null;
  const allUsers = authService.getAllUsers() || [];
  const adminUser = allUsers.find(u => u.role === "admin");
  const bendaharaUser = allUsers.find(u => u.role === "bendahara");

  const adminName = adminUser?.name || "Suryadi S";
  const bendaharaName = bendaharaUser?.name || "Nogi";

  const monthApproval = approvalService.getMonthApproval(currentMonthKey);
  const signatures = signatureService.getSignatures();

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const getMonthName = (key) => {
    const months = {
      "2026-09": "September 2026",
      "2026-08": "Agustus 2026",
      "2026-07": "Juli 2026",
      "2026-10": "Oktober 2026",
      "2026-11": "November 2026",
      "2026-12": "Desember 2026"
    };
    return months[key] || key;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Container */}
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Top Control Bar (Hidden on Print) */}
        <div className="flex flex-wrap items-center justify-between p-4 sm:p-5 bg-slate-900 text-white print:hidden border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Pratinjau Cetak & Unduh Laporan Keuangan Kas
              </h3>
              <p className="text-xs text-slate-300">
                Periode: {getMonthName(currentMonthKey)} • Format Resmi Kop Surat
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportToWord(summary, currentMonthKey, categories)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow"
              title="Unduh dokumen format Microsoft Word (.doc) persis seperti tampilan ini"
            >
              <FileText className="w-4 h-4" />
              Download Word (.doc)
            </button>

            <button
              onClick={() => exportToExcelFormatted(summary, currentMonthKey, categories)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
              title="Unduh dokumen format Microsoft Excel (.xls) berpenampilan persis seperti tampilan ini"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Download Excel (.xls)
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow"
            >
              <Printer className="w-4 h-4" />
              Cetak / PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="p-6 sm:p-10 overflow-y-auto print:p-0 print:overflow-visible text-slate-900 bg-white">
          
          {/* Printable Styles for window.print() */}
          <style>{`
            @media print {
              @page {
                size: A4 portrait;
                margin: 12mm 15mm;
              }
              body * {
                visibility: hidden;
              }
              #printable-area, #printable-area * {
                visibility: visible;
              }
              .fixed.inset-0 {
                position: static !important;
                background: none !important;
                padding: 0 !important;
                backdrop-filter: none !important;
              }
              .max-h-\[90vh\] {
                max-height: none !important;
                overflow: visible !important;
              }
              #printable-area {
                position: static !important;
                left: auto !important;
                top: auto !important;
                width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
                background: white !important;
                color: black !important;
              }
              .print\\:hidden {
                display: none !important;
              }
              tr {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }
              .signature-block {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
                margin-top: 30px !important;
              }
            }
          `}</style>

          <div id="printable-area" className="space-y-6">
            
            {/* Kop Surat Header */}
            <div className="border-b-2 border-slate-900 pb-4 text-center">
              <div className="flex items-center justify-center gap-3 mb-1">
                <GangCintaLogo size="md" variant="plain" />
                <div className="text-left">
                  <h1 className="text-lg font-black tracking-wider uppercase text-slate-900">
                    PERUMAHAN BUMI NAGARA LESTARI
                  </h1>
                  <h2 className="text-sm font-bold text-slate-700">
                    RUKUN TETANGGA 028 RUKUN WARGA 005 - GANG CINTA
                  </h2>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                Portal Transparansi Kas & Administrasi Warga Lingkungan Gang Cinta
              </p>
            </div>

            {/* Document Title */}
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
                LAPORAN REKAPITULASI KEUANGAN & PEMBUKUAN KAS 5 POS
              </h3>
              <p className="text-xs font-semibold text-slate-600">
                Periode Bulan: <span className="underline font-bold">{getMonthName(currentMonthKey)}</span>
              </p>
            </div>

            {/* Overall Ringkasan Card */}
            <div className="grid grid-cols-4 gap-3 text-xs border border-slate-300 rounded-xl p-3 bg-slate-50">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Total Saldo Awal:</span>
                <div className="font-extrabold text-slate-800 text-sm">{formatRupiah(summary.startingBalance)}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Total Pemasukan (+):</span>
                <div className="font-extrabold text-emerald-700 text-sm">{formatRupiah(summary.totalIncome)}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Total Pengeluaran (-):</span>
                <div className="font-extrabold text-rose-700 text-sm">{formatRupiah(summary.totalExpense)}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Total Saldo Akhir (=):</span>
                <div className="font-extrabold text-indigo-900 text-sm">{formatRupiah(summary.endingBalance)}</div>
              </div>
            </div>

            {/* Table 1: Rincian 5 Pos Anggaran */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-700 border-l-4 border-indigo-600 pl-2">
                I. Rekapitulasi Saldo Awal & Saldo Akhir per Pos Anggaran
              </h4>
              <table className="w-full text-left text-xs border-collapse border border-slate-300">
                <thead className="bg-slate-100 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2 border border-slate-300">No</th>
                    <th className="p-2 border border-slate-300">Pos Anggaran</th>
                    <th className="p-2 border border-slate-300 text-right">Saldo Awal</th>
                    <th className="p-2 border border-slate-300 text-right">Pemasukan (+)</th>
                    <th className="p-2 border border-slate-300 text-right">Pengeluaran (-)</th>
                    <th className="p-2 border border-slate-300 text-right">Saldo Akhir (=)</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, idx) => {
                    const data = summary.categoryBreakdown[cat.id] || { starting: 0, income: 0, expense: 0, ending: 0 };
                    const starting = formatRupiahParts(data.starting);
                    const income = formatRupiahParts(data.income, data.income > 0 ? "+" : "");
                    const expense = formatRupiahParts(data.expense, data.expense > 0 ? "-" : "");
                    const ending = formatRupiahParts(data.ending);

                    return (
                      <tr key={cat.id} className="border-b border-slate-200">
                        <td className="p-2 border border-slate-300 text-center font-bold">{idx + 1}</td>
                        <td className="p-2 border border-slate-300 font-bold">{cat.name}</td>
                        <td className="p-2 border border-slate-300 font-mono">
                          <div className="w-full flex items-center justify-between gap-2">
                            <span className="text-slate-500 font-semibold text-left">{starting.symbol}</span>
                            <span className="font-bold text-slate-800 text-right tabular-nums">{starting.digits}</span>
                          </div>
                        </td>
                        <td className="p-2 border border-slate-300 font-mono text-emerald-700">
                          <div className="w-full flex items-center justify-between gap-2">
                            <span className="font-bold text-left">{income.symbol}</span>
                            <span className="font-bold text-right tabular-nums">{income.digits}</span>
                          </div>
                        </td>
                        <td className="p-2 border border-slate-300 font-mono text-rose-700">
                          <div className="w-full flex items-center justify-between gap-2">
                            <span className="font-bold text-left">{expense.symbol}</span>
                            <span className="font-bold text-right tabular-nums">{expense.digits}</span>
                          </div>
                        </td>
                        <td className="p-2 border border-slate-300 font-mono font-bold text-indigo-900">
                          <div className="w-full flex items-center justify-between gap-2">
                            <span className="font-bold text-left">{ending.symbol}</span>
                            <span className="font-extrabold text-right tabular-nums">{ending.digits}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100 font-black">
                  {(() => {
                    const startTot = formatRupiahParts(summary.startingBalance);
                    const incTot = formatRupiahParts(summary.totalIncome, "+");
                    const expTot = formatRupiahParts(summary.totalExpense, "-");
                    const endTot = formatRupiahParts(summary.endingBalance);
                    return (
                      <tr>
                        <td colSpan={2} className="p-2 border border-slate-300 text-right">TOTAL KESELURUHAN</td>
                        <td className="p-2 border border-slate-300 font-mono">
                          <div className="w-full flex items-center justify-between gap-2">
                            <span className="font-bold text-left">{startTot.symbol}</span>
                            <span className="font-black text-right tabular-nums">{startTot.digits}</span>
                          </div>
                        </td>
                        <td className="p-2 border border-slate-300 font-mono text-emerald-700">
                          <div className="w-full flex items-center justify-between gap-2">
                            <span className="font-bold text-left">{incTot.symbol}</span>
                            <span className="font-black text-right tabular-nums">{incTot.digits}</span>
                          </div>
                        </td>
                        <td className="p-2 border border-slate-300 font-mono text-rose-700">
                          <div className="w-full flex items-center justify-between gap-2">
                            <span className="font-bold text-left">{expTot.symbol}</span>
                            <span className="font-black text-right tabular-nums">{expTot.digits}</span>
                          </div>
                        </td>
                        <td className="p-2 border border-slate-300 font-mono text-indigo-900">
                          <div className="w-full flex items-center justify-between gap-2">
                            <span className="font-bold text-left">{endTot.symbol}</span>
                            <span className="font-black text-right tabular-nums">{endTot.digits}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })()}
                </tfoot>
              </table>
            </div>

            {/* Table 2: Rincian Transaksi */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase text-slate-700 border-l-4 border-indigo-600 pl-2">
                II. Histori Rincian Pemasukan & Pengeluaran Kas (Buku Jurnal)
              </h4>
              <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
                <thead className="bg-slate-100 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2 border border-slate-300">Tgl</th>
                    <th className="p-2 border border-slate-300">Tipe</th>
                    <th className="p-2 border border-slate-300">Pos Kategori</th>
                    <th className="p-2 border border-slate-300">Uraian Transaksi / Peruntukan</th>
                    <th className="p-2 border border-slate-300 text-right">Nominal</th>
                    <th className="p-2 border border-slate-300">Pencatat</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.transactions.map((t) => {
                    const isExp = t.type === "expense";
                    const catObj = categories.find(c => c.id === t.category);
                    return (
                      <tr key={t.id} className="border-b border-slate-200">
                        <td className="p-2 border border-slate-300 whitespace-nowrap">
                          {new Date(t.date).toLocaleDateString("id-ID", { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        </td>
                        <td className="p-2 border border-slate-300 font-semibold">
                          {isExp ? "Pengeluaran" : "Pemasukan"}
                        </td>
                        <td className="p-2 border border-slate-300">{catObj?.name || t.category}</td>
                        <td className="p-2 border border-slate-300 font-medium">
                          <div>{t.title}</div>
                          {t.description && <div className="text-[10px] text-slate-500">{t.description}</div>}
                        </td>
                        <td className="p-2 border border-slate-300 whitespace-nowrap font-mono">
                          {(() => {
                            const parts = formatRupiahParts(t.amount, isExp ? "-" : "+");
                            return (
                              <div className={`w-full flex items-center justify-between gap-2 font-bold ${isExp ? "text-rose-700" : "text-emerald-700"}`}>
                                <span className="text-left font-bold">{parts.symbol}</span>
                                <span className="text-right font-bold tabular-nums">{parts.digits}</span>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="p-2 border border-slate-300 text-slate-600">{t.recordedBy}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Tanda Tangan Block */}
            <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs text-slate-800 signature-block">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold mt-0.5">Ketua Gang Cinta RT 028 RW 005</p>
                
                <div className="h-16 flex items-center justify-center my-1">
                  {monthApproval.adminApproved ? (
                    signatures.adminSignature ? (
                      <img 
                        src={signatures.adminSignature} 
                        alt="TTD Ketua" 
                        className="max-h-16 max-w-full object-contain mx-auto"
                      />
                    ) : (
                      <div className="border-2 border-dashed border-emerald-600 rounded-xl px-3 py-1.5 text-[10px] text-emerald-800 font-mono font-bold bg-emerald-50/80 inline-block shadow-2xs">
                        ✅ DISETUJUI DIGITALLY<br/>
                        <span className="text-[9px] text-slate-500 font-normal">{monthApproval.adminApprovedAt || "Tercatat di Portal"}</span>
                      </div>
                    )
                  ) : (
                    <span className="text-[11px] text-slate-400 italic font-normal">
                      (Belum Disetujui)
                    </span>
                  )}
                </div>

                <p className="font-extrabold underline">{adminName}</p>
                <p className="text-[10px] text-slate-500">Penanggung Jawab Lingkungan Gang Cinta</p>
              </div>

              <div>
                <p>Dibuat oleh,</p>
                <p className="font-bold mt-0.5">Bendahara Gang Cinta</p>
                
                <div className="h-16 flex items-center justify-center my-1">
                  {monthApproval.bendaharaApproved ? (
                    signatures.bendaharaSignature ? (
                      <img 
                        src={signatures.bendaharaSignature} 
                        alt="TTD Bendahara" 
                        className="max-h-16 max-w-full object-contain mx-auto"
                      />
                    ) : (
                      <div className="border-2 border-dashed border-emerald-600 rounded-xl px-3 py-1.5 text-[10px] text-emerald-800 font-mono font-bold bg-emerald-50/80 inline-block shadow-2xs">
                        ✅ DISETUJUI DIGITALLY<br/>
                        <span className="text-[9px] text-slate-500 font-normal">{monthApproval.bendaharaApprovedAt || "Tercatat di Portal"}</span>
                      </div>
                    )
                  ) : (
                    <span className="text-[11px] text-slate-400 italic font-normal">
                      (Belum Disetujui)
                    </span>
                  )}
                </div>

                <p className="font-extrabold underline">{bendaharaName}</p>
                <p className="text-[10px] text-slate-500">Pengelola Keuangan Gang Cinta</p>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 text-center border-t border-slate-200 pt-2">
              Laporan ini dicetak secara otomatis dari Portal Gang Cinta - Perumahan Bumi Nagara Lestari RT 028 RW 005 pada {new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}.
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
