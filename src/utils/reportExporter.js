import { formatRupiah, formatRupiahParts } from "./numberUtils";
import { authService, approvalService, signatureService } from "../services/storageService";

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

// Helper for generating 100% width borderless nested table for Excel & Word currency alignment (Symbol Left, Digits Right)
const formatCurrencyCellHTML = (num, prefix = "", color = "#0f172a") => {
  const parts = formatRupiahParts(num, prefix);
  return `
    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border: none; width: 100%;">
      <tr>
        <td align="left" style="border: none; padding: 0; font-weight: bold; color: ${color}; text-align: left; font-family: 'Courier New', monospace;">${parts.symbol}</td>
        <td align="right" style="border: none; padding: 0; font-weight: bold; color: ${color}; text-align: right; font-family: 'Courier New', monospace;">${parts.digits}</td>
      </tr>
    </table>
  `;
};

// Generate HTML string specially formatted for Excel (.xls) with strict colspan="3" column alignment
const generateExcelHTML = (summary, currentMonthKey, categories) => {
  const monthTitle = getMonthName(currentMonthKey);
  const downloadDate = new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });

  const allUsers = authService.getAllUsers() || [];
  const adminUser = allUsers.find(u => u.role === "admin");
  const bendaharaUser = allUsers.find(u => u.role === "bendahara");

  const adminName = adminUser?.name || "Suryadi S";
  const bendaharaName = bendaharaUser?.name || "Nogi";

  const monthApproval = approvalService.getMonthApproval(currentMonthKey);
  const signatures = signatureService.getSignatures();

  const adminSigHTML = monthApproval.adminApproved
    ? (signatures.adminSignature 
        ? `<img src="${signatures.adminSignature}" height="55" style="max-height: 55px;" />` 
        : `<font color="#059669"><b>[DISETUJUI DIGITALLY]</b><br><font size="1" color="#64748b">${monthApproval.adminApprovedAt || ""}</font></font>`)
    : `<font color="#94a3b8"><i>(Belum Disetujui)</i></font>`;

  const bendaharaSigHTML = monthApproval.bendaharaApproved
    ? (signatures.bendaharaSignature 
        ? `<img src="${signatures.bendaharaSignature}" height="55" style="max-height: 55px;" />` 
        : `<font color="#059669"><b>[DISETUJUI DIGITALLY]</b><br><font size="1" color="#64748b">${monthApproval.bendaharaApprovedAt || ""}</font></font>`)
    : `<font color="#94a3b8"><i>(Belum Disetujui)</i></font>`;

  const categoriesRows = categories.map((cat, idx) => {
    const data = summary.categoryBreakdown[cat.id] || { starting: 0, income: 0, expense: 0, ending: 0 };
    return `
      <tr>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${idx + 1}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: bold;">${cat.name}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">${formatCurrencyCellHTML(data.starting, "", "#334155")}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">${formatCurrencyCellHTML(data.income, data.income > 0 ? "+" : "", "#059669")}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">${formatCurrencyCellHTML(data.expense, data.expense > 0 ? "-" : "", "#dc2626")}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">${formatCurrencyCellHTML(data.ending, "", "#1e1b4b")}</td>
      </tr>
    `;
  }).join("");

  const transactionRows = summary.transactions.map((t) => {
    const isExp = t.type === "expense";
    const catObj = categories.find(c => c.id === t.category);
    const dateFormatted = new Date(t.date).toLocaleDateString("id-ID", { day: '2-digit', month: '2-digit', year: '2-digit' });
    const color = isExp ? "#dc2626" : "#059669";
    const prefix = isExp ? "-" : "+";
    return `
      <tr>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center;">${dateFormatted}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 600;">${isExp ? "Pengeluaran" : "Pemasukan"}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">${catObj?.name || t.category}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">
          <b>${t.title}</b>
          ${t.description ? `<br><font size="1" color="#64748b">${t.description}</font>` : ""}
        </td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">
          ${formatCurrencyCellHTML(t.amount, prefix, color)}
        </td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; color: #475569; font-size: 11px;">${t.recordedBy}</td>
      </tr>
    `;
  }).join("");

  return `
    <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11px; color: #0f172a;">
      <!-- Kop Surat -->
      <tr>
        <td colspan="6" align="center" style="padding-bottom: 2px;">
          <font size="4" color="#0f172a"><b>PERUMAHAN BUMI NAGARA LESTARI</b></font>
        </td>
      </tr>
      <tr>
        <td colspan="6" align="center" style="padding-bottom: 2px;">
          <font size="2" color="#334155"><b>RUKUN TETANGGA 028 RUKUN WARGA 005 – GANG CINTA</b></font>
        </td>
      </tr>
      <tr>
        <td colspan="6" align="center" style="padding-bottom: 10px;">
          <font size="1" color="#64748b"><i>Portal Transparansi Kas & Administrasi Warga Lingkungan Gang Cinta</i></font>
        </td>
      </tr>
      <tr>
        <td colspan="6" style="border-bottom: 2px solid #0f172a; height: 2px; padding: 0;"></td>
      </tr>

      <tr><td colspan="6" style="height: 15px;"></td></tr>

      <!-- Title -->
      <tr>
        <td colspan="6" align="center">
          <font size="3" color="#0f172a"><b>LAPORAN REKAPITULASI KEUANGAN & PEMBUKUAN KAS 5 POS</b></font>
        </td>
      </tr>
      <tr>
        <td colspan="6" align="center">
          <font size="2" color="#475569">Periode Bulan: <u><b>${monthTitle}</b></u></font>
        </td>
      </tr>

      <tr><td colspan="6" style="height: 15px;"></td></tr>

      <!-- 4 Summary Blocks -->
      <tr style="background: #f8fafc;">
        <td colspan="1" style="padding: 10px; border: 1px solid #cbd5e1; background: #f8fafc;">
          <font size="1" color="#64748b"><b>TOTAL SALDO AWAL:</b></font><br>
          <font size="3" color="#0f172a"><b>${formatRupiah(summary.startingBalance)}</b></font>
        </td>
        <td colspan="2" style="padding: 10px; border: 1px solid #a7f3d0; background: #ecfdf5;">
          <font size="1" color="#047857"><b>TOTAL PEMASUKAN (+):</b></font><br>
          <font size="3" color="#047857"><b>+${formatRupiah(summary.totalIncome)}</b></font>
        </td>
        <td colspan="1" style="padding: 10px; border: 1px solid #fecdd3; background: #fff1f2;">
          <font size="1" color="#be123c"><b>TOTAL PENGELUARAN (-):</b></font><br>
          <font size="3" color="#be123c"><b>-${formatRupiah(summary.totalExpense)}</b></font>
        </td>
        <td colspan="2" style="padding: 10px; border: 1px solid #c7d2fe; background: #e0e7ff;">
          <font size="1" color="#3730a3"><b>TOTAL SALDO AKHIR (=):</b></font><br>
          <font size="3" color="#312e81"><b>${formatRupiah(summary.endingBalance)}</b></font>
        </td>
      </tr>

      <tr><td colspan="6" style="height: 20px;"></td></tr>

      <!-- Section I Header -->
      <tr>
        <td colspan="6" style="font-weight: bold; font-size: 12px; color: #1e1b4b; background: #e0e7ff; padding: 6px 10px; border: 1px solid #c7d2fe;">
          I. REKAPITULASI SALDO AWAL & SALDO AKHIR PER POS ANGGARAN
        </td>
      </tr>

      <tr style="background: #f1f5f9; font-weight: bold;">
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">No</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">Pos Anggaran</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Saldo Awal</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Pemasukan (+)</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Pengeluaran (-)</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Saldo Akhir (=)</td>
      </tr>

      ${categoriesRows}

      <tr style="background: #f8fafc; font-weight: bold;">
        <td colspan="2" style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">TOTAL KESELURUHAN</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">${formatCurrencyCellHTML(summary.startingBalance, "", "#0f172a")}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">${formatCurrencyCellHTML(summary.totalIncome, "+", "#059669")}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">${formatCurrencyCellHTML(summary.totalExpense, "-", "#dc2626")}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">${formatCurrencyCellHTML(summary.endingBalance, "", "#1e1b4b")}</td>
      </tr>

      <tr><td colspan="6" style="height: 25px;"></td></tr>

      <!-- Section II Header -->
      <tr>
        <td colspan="6" style="font-weight: bold; font-size: 12px; color: #1e1b4b; background: #e0e7ff; padding: 6px 10px; border: 1px solid #c7d2fe;">
          II. HISTORI RINCIAN PEMASUKAN & PENGELUARAN KAS (BUKU JURNAL)
        </td>
      </tr>

      <tr style="background: #f1f5f9; font-weight: bold;">
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Tgl</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">Tipe</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">Pos Kategori</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">Uraian Transaksi / Peruntukan</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Nominal</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">Pencatat</td>
      </tr>

      ${transactionRows}

      <tr><td colspan="6" style="height: 35px;"></td></tr>

      <!-- Signatures Block with strict Colspan (Left 3 cols, Right 3 cols) -->
      <tr>
        <td colspan="3" align="center">Mengetahui,</td>
        <td colspan="3" align="center">Dibuat oleh,</td>
      </tr>
      <tr>
        <td colspan="3" align="center"><b>Ketua Gang Cinta RT 028 RW 005</b></td>
        <td colspan="3" align="center"><b>Bendahara Gang Cinta</b></td>
      </tr>
      <tr>
        <td colspan="3" align="center" style="height: 60px; vertical-align: middle;">${adminSigHTML}</td>
        <td colspan="3" align="center" style="height: 60px; vertical-align: middle;">${bendaharaSigHTML}</td>
      </tr>
      <tr>
        <td colspan="3" align="center"><b><u>${adminName}</u></b></td>
        <td colspan="3" align="center"><b><u>${bendaharaName}</u></b></td>
      </tr>
      <tr>
        <td colspan="3" align="center"><font size="1" color="#64748b">Penanggung Jawab Lingkungan Gang Cinta</font></td>
        <td colspan="3" align="center"><font size="1" color="#64748b">Pengelola Keuangan Gang Cinta</font></td>
      </tr>

      <tr><td colspan="6" style="height: 25px;"></td></tr>

      <!-- Footnote -->
      <tr>
        <td colspan="6" align="center" style="border-top: 1px solid #cbd5e1; padding-top: 10px;">
          <font size="1" color="#94a3b8">Laporan ini diunduh dari Portal Gang Cinta - Perumahan Bumi Nagara Lestari RT 028 RW 005 pada ${downloadDate}.</font>
        </td>
      </tr>
    </table>
  `;
};

// Export to Microsoft Word (.doc)
export const exportToWord = (summary, currentMonthKey, categories) => {
  const monthTitle = getMonthName(currentMonthKey);
  const contentHTML = generateExcelHTML(summary, currentMonthKey, categories);
  
  const fullDocumentHTML = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Laporan Keuangan Gang Cinta ${monthTitle}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #ffffff; padding: 20px; }
      </style>
    </head>
    <body>
      ${contentHTML}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + fullDocumentHTML], { type: 'application/msword;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Laporan_Keuangan_Kas_Gang_Cinta_${currentMonthKey}.doc`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export to Microsoft Excel (.xls formatted HTML table)
export const exportToExcelFormatted = (summary, currentMonthKey, categories) => {
  const monthTitle = getMonthName(currentMonthKey);
  const contentHTML = generateExcelHTML(summary, currentMonthKey, categories);

  const fullExcelHTML = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Laporan Keuangan Gang Cinta ${monthTitle}</title>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Laporan Kas Gang Cinta</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body { font-family: Arial, sans-serif; }
      </style>
    </head>
    <body>
      ${contentHTML}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + fullExcelHTML], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Laporan_Keuangan_Kas_Gang_Cinta_${currentMonthKey}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
