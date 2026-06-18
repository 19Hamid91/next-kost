'use client';

import { useParams } from 'next/navigation';
import { useRef } from 'react';
import Header from '@/components/dashboard/Header';
import { Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useFinance } from '@/hooks/useFinance';
import SummaryCards from '@/components/finance/SummaryCards';
import MonthYearPicker from '@/components/finance/MonthYearPicker';
import DepositReminderBanner from '@/components/finance/DepositReminderBanner';
import ExpensesTable from '@/components/finance/ExpensesTable';
import DepositStatusTable from '@/components/finance/DepositStatusTable';
import { exportFinanceToExcel } from '@/lib/exportFinance';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function FinancePage() {
  const params = useParams();
  const kostId = params.kostId as string;
  const depositSectionRef = useRef<HTMLDivElement | null>(null);

  const {
    selectedMonth,
    selectedYear,
    summary,
    expenses,
    depositRows,
    reminders,
    allRooms,
    allTenants,
    isLoading,
    actionLoading,
    dismissedReminder,
    setDismissedReminder,
    prevMonth,
    nextMonth,
    addExpense,
    deleteExpense,
    refundDeposit,
  } = useFinance(kostId);

  const handleExport = () => {
    if (!summary) return;
    exportFinanceToExcel({
      summary,
      expenses,
      depositRows,
      allRooms,
      allTenants,
      month: selectedMonth,
      year: selectedYear,
    });
  };

  const scrollToDeposit = () => {
    depositSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (isLoading && !summary) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.2em] animate-pulse">
            Loading Finance Data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 text-foreground flex flex-col font-sans">
      <Header />

      <main className="p-6 md:p-12 max-w-[1440px] mx-auto w-full space-y-8 flex-1">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Finance
            </h1>
            <p className="text-muted-foreground text-sm font-medium flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
              Cash flow overview — {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <MonthYearPicker
              month={selectedMonth}
              year={selectedYear}
              onPrev={prevMonth}
              onNext={nextMonth}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={!summary}
              className="h-11 px-5 rounded-2xl border-border font-bold text-xs gap-2 hover:bg-primary/5 hover:border-primary/30"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </Button>
          </div>
        </motion.div>

        {/* Deposit Reminder Banner */}
        <DepositReminderBanner
          reminders={reminders}
          dismissed={dismissedReminder}
          onDismiss={() => setDismissedReminder(true)}
          onViewDetails={scrollToDeposit}
        />

        {/* Summary Cards + Net Cashflow */}
        <SummaryCards summary={summary} isLoading={isLoading} />

        {/* Two-column section: Expenses | Deposit */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <ExpensesTable
            expenses={expenses}
            actionLoading={actionLoading}
            onAdd={addExpense}
            onDelete={deleteExpense}
          />

          <DepositStatusTable
            depositRows={depositRows}
            allRooms={allRooms}
            allTenants={allTenants}
            actionLoading={actionLoading}
            onRefund={refundDeposit}
            sectionRef={depositSectionRef}
          />
        </div>

      </main>

      <footer className="p-12 text-center opacity-40 select-none">
        <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-muted-foreground">
          NextKost Finance Module
        </p>
      </footer>
    </div>
  );
}
