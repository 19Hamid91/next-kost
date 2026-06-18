import * as XLSX from 'xlsx';
import { calculateDueDate, parseDurasiUnit } from '@/lib/dateUtils';
import type { FinanceSummary, ExpenseRow, DepositRow } from '@/hooks/useFinance';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const CATEGORY_LABELS: Record<string, string> = {
  electricity: 'Electricity',
  water: 'Water',
  internet: 'Internet',
  repair: 'Repair',
  other: 'Other',
};

const formatRupiah = (amount: number | string) =>
  `Rp ${parseInt(String(amount) || '0').toLocaleString('id-ID')}`;

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

export function exportFinanceToExcel(params: {
  summary: FinanceSummary;
  expenses: ExpenseRow[];
  depositRows: DepositRow[];
  allRooms: any[];
  allTenants: any[];
  month: number;
  year: number;
}) {
  const { summary, expenses, depositRows, allRooms, allTenants, month, year } = params;
  const monthName = MONTH_NAMES[month - 1];
  const workbook = XLSX.utils.book_new();

  // ── Sheet 1: Summary ────────────────────────────────────────────────
  const summarySheetData = [
    ['NextKost Finance Summary', `${monthName} ${year}`],
    [],
    ['Category', 'Amount'],
    ['Rent Income', summary.totalRentIncome],
    ['DP Received', summary.totalDpReceived],
    ['DP Forfeited', summary.totalDpForfeited],
    ['Total Expenses', summary.totalExpenses],
    ['Deposit Refunded', summary.totalDepositRefunded],
    [],
    ['Net Cashflow', summary.netCashflow],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summarySheetData);
  summarySheet['!cols'] = [{ wch: 24 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // ── Sheet 2: Expenses ────────────────────────────────────────────────
  const expenseRows = [
    ['Date', 'Category', 'Amount', 'Notes'],
    ...expenses.map(expense => [
      formatDate(expense.Date),
      CATEGORY_LABELS[expense.Category] ?? expense.Category,
      parseInt(expense.Amount || '0'),
      expense.Notes ?? '',
    ]),
    [],
    ['Total', '', expenses.reduce((sum, expense) => sum + parseInt(expense.Amount || '0'), 0), ''],
  ];
  const expenseSheet = XLSX.utils.aoa_to_sheet(expenseRows);
  expenseSheet['!cols'] = [{ wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 32 }];
  XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Expenses');

  // ── Sheet 3: Deposit ─────────────────────────────────────────────────
  const depositData = depositRows.map((rental) => {
    const room = allRooms.find((r: any) => r.ID_Kamar === rental.ID_Kamar);
    const tenant = allTenants.find((t: any) => t.ID_Penghuni === rental.ID_Penghuni);

    let endDateStr = '—';
    if (rental.Tgl_Masuk) {
      const startDate = new Date(rental.Tgl_Masuk);
      const periode = parseInt(rental.Periode_Sewa) || 1;
      const unit = parseDurasiUnit(rental.Unit_Durasi);
      const endDate = calculateDueDate(startDate, periode, unit);
      endDateStr = formatDate(endDate.toISOString());
    }

    return [
      tenant?.Nama ?? rental.ID_Penghuni,
      room?.No_Kamar ?? rental.ID_Kamar,
      formatDate(rental.Tgl_Masuk),
      endDateStr,
      parseInt(rental.Nominal_Deposit || '0'),
      rental.Deposit_Status === 'refunded' ? 'Refunded' : 'Held',
      rental.Deposit_Refunded_At ? formatDate(rental.Deposit_Refunded_At) : '—',
    ];
  });

  const depositSheetData = [
    ['Tenant', 'Room', 'Check-in', 'Check-out', 'Deposit Amount', 'Status', 'Refunded Date'],
    ...depositData,
  ];
  const depositSheet = XLSX.utils.aoa_to_sheet(depositSheetData);
  depositSheet['!cols'] = [
    { wch: 20 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 12 }, { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(workbook, depositSheet, 'Deposit');

  // Download
  const fileName = `Finance_NextKost_${monthName}_${year}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
