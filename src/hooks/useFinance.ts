'use client';

import { useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import { toast } from 'sonner';
import { fetcher } from '@/lib/fetcher';
import { Expense as ExpenseRow, Rental as DepositRow, Room, Tenant, ApiResponse } from '@/types';
import { FinanceSummary, DepositReminder } from '@/types/finance';

export type { FinanceSummary, DepositReminder, ExpenseRow, DepositRow };

export function useFinance(kostId: string) {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [dismissedReminder, setDismissedReminder] = useState(false);

  const summaryKey = `/api/finance/summary?month=${selectedMonth}&year=${selectedYear}&kostId=${kostId}`;
  const expensesKey = `/api/finance/expenses?month=${selectedMonth}&year=${selectedYear}&limit=100&kostId=${kostId}`;
  const remindersKey = `/api/finance/deposit/reminders`;
  const rentalsKey = `/api/data/Transaksi_Sewa`;
  const roomsKey = `/api/data/Master_Kamar`;
  const tenantsKey = `/api/data/Master_Penghuni`;

  const { data: summaryData, isLoading: summaryLoading } = useSWR<ApiResponse<FinanceSummary>>(summaryKey, fetcher);
  const { data: expensesData, isLoading: expensesLoading } = useSWR<ApiResponse<ExpenseRow[]>>(expensesKey, fetcher);
  const { data: remindersData } = useSWR<ApiResponse<DepositReminder[]>>(remindersKey, fetcher);
  const { data: rentalsData } = useSWR<ApiResponse<DepositRow[]>>(rentalsKey, fetcher);
  const { data: roomsData } = useSWR<ApiResponse<Room[]>>(roomsKey, fetcher);
  const { data: tenantsData } = useSWR<ApiResponse<Tenant[]>>(tenantsKey, fetcher);

  const summary = summaryData?.data ?? null;
  const expenses = expensesData?.data ?? [];
  const reminders = remindersData?.data ?? [];
  const allRentals = rentalsData?.data ?? [];
  const allRooms = roomsData?.data ?? [];
  const allTenants = tenantsData?.data ?? [];

  const kostRoomIds = allRooms
    .filter((room) => room.ID_Kost === kostId)
    .map((room) => room.ID_Kamar);

  const depositRows = allRentals.filter((rental) =>
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
        body: JSON.stringify({ ...payload, kostId }),
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
