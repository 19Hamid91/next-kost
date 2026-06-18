'use client';

import { useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import { toast } from 'sonner';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface FinanceSummary {
  totalRentIncome: number;
  totalDpReceived: number;
  totalDpForfeited: number;
  totalExpenses: number;
  totalDepositRefunded: number;
  netCashflow: number;
  month: number;
  year: number;
}

export interface ExpenseRow {
  ID_Expense: string;
  Date: string;
  Category: string;
  Amount: string;
  Notes: string;
  Created_At: string;
}

export interface DepositRow {
  ID_Sewa: string;
  ID_Kamar: string;
  ID_Penghuni: string;
  Tgl_Masuk: string;
  Nominal_Deposit: string;
  Deposit_Status: string;
  Deposit_Refunded_At: string;
  DP_Amount: string;
  DP_Status: string;
  Monthly_Rent: string;
  Status_Sewa: string;
  Periode_Sewa: string;
  Unit_Durasi: string;
}

export interface DepositReminder {
  bookingId: string;
  tenantName: string;
  roomNumber: string;
  endDate: string;
  depositAmount: number;
  daysUntilEnd: number;
}

export function useFinance(kostId: string) {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [dismissedReminder, setDismissedReminder] = useState(false);

  const summaryKey = `/api/finance/summary?month=${selectedMonth}&year=${selectedYear}&kostId=${kostId}`;
  const expensesKey = `/api/finance/expenses?month=${selectedMonth}&year=${selectedYear}&limit=100`;
  const remindersKey = `/api/finance/deposit/reminders`;
  const rentalsKey = `/api/data/Transaksi_Sewa`;
  const roomsKey = `/api/data/Master_Kamar`;
  const tenantsKey = `/api/data/Master_Penghuni`;

  const { data: summaryData, isLoading: summaryLoading } = useSWR<{ data: FinanceSummary }>(summaryKey, fetcher);
  const { data: expensesData, isLoading: expensesLoading } = useSWR<{ data: ExpenseRow[]; RecordCount: number }>(expensesKey, fetcher);
  const { data: remindersData } = useSWR<{ data: DepositReminder[] }>(remindersKey, fetcher);
  const { data: rentalsData } = useSWR<{ data: DepositRow[] }>(rentalsKey, fetcher);
  const { data: roomsData } = useSWR<{ data: any[] }>(roomsKey, fetcher);
  const { data: tenantsData } = useSWR<{ data: any[] }>(tenantsKey, fetcher);

  const summary = summaryData?.data ?? null;
  const expenses = expensesData?.data ?? [];
  const reminders = remindersData?.data ?? [];
  const allRentals = rentalsData?.data ?? [];
  const allRooms = roomsData?.data ?? [];
  const allTenants = tenantsData?.data ?? [];

  // Filter rentals to this kost's rooms
  const kostRoomIds = allRooms
    .filter((room: any) => room.ID_Kost === kostId)
    .map((room: any) => room.ID_Kamar);

  const depositRows = allRentals.filter((rental: DepositRow) =>
    kostRoomIds.includes(rental.ID_Kamar)
  );

  const prevMonth = useCallback(() => {
    setDismissedReminder(false);
    if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(prev => prev - 1); }
    else setSelectedMonth(prev => prev - 1);
  }, [selectedMonth]);

  const nextMonth = useCallback(() => {
    setDismissedReminder(false);
    if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(prev => prev + 1); }
    else setSelectedMonth(prev => prev + 1);
  }, [selectedMonth]);

  // Add expense
  const addExpense = useCallback(async (payload: {
    date: string;
    category: string;
    amount: number;
    notes?: string;
  }) => {
    setActionLoading('add-expense');
    try {
      const res = await fetch('/api/finance/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Expense added');
        mutate(expensesKey);
        mutate(summaryKey);
        return true;
      } else {
        toast.error(result.message || 'Failed to add expense');
        return false;
      }
    } catch (error: any) {
      toast.error(error.message || 'Error adding expense');
      return false;
    } finally {
      setActionLoading(null);
    }
  }, [expensesKey, summaryKey]);

  // Delete expense
  const deleteExpense = useCallback(async (expenseId: string) => {
    setActionLoading(`delete-${expenseId}`);
    try {
      const res = await fetch(`/api/finance/expenses/${expenseId}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        toast.success('Expense deleted');
        mutate(expensesKey);
        mutate(summaryKey);
      } else {
        toast.error(result.message || 'Failed to delete expense');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error deleting expense');
    } finally {
      setActionLoading(null);
    }
  }, [expensesKey, summaryKey]);

  // Refund deposit
  const refundDeposit = useCallback(async (bookingId: string) => {
    setActionLoading(`refund-${bookingId}`);
    try {
      const res = await fetch(`/api/finance/deposit/${bookingId}/refund`, { method: 'PATCH' });
      const result = await res.json();
      if (result.success) {
        toast.success('Deposit marked as refunded');
        mutate(rentalsKey);
        mutate(remindersKey);
        mutate(summaryKey);
      } else {
        toast.error(result.message || 'Failed to refund deposit');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error refunding deposit');
    } finally {
      setActionLoading(null);
    }
  }, [rentalsKey, remindersKey, summaryKey]);

  return {
    selectedMonth,
    selectedYear,
    summary,
    expenses,
    depositRows,
    reminders,
    allRooms,
    allTenants,
    isLoading: summaryLoading || expensesLoading,
    actionLoading,
    dismissedReminder,
    setDismissedReminder,
    prevMonth,
    nextMonth,
    addExpense,
    deleteExpense,
    refundDeposit,
  };
}
