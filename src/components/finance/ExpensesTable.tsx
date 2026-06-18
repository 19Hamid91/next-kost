'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Loader2, X, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExpenseRow } from '@/hooks/useFinance';

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'electricity', label: 'Electricity' },
  { value: 'water', label: 'Water' },
  { value: 'internet', label: 'Internet' },
  { value: 'repair', label: 'Repair' },
  { value: 'other', label: 'Other' },
];

const categoryLabel = (value: string) =>
  CATEGORIES.find(c => c.value === value)?.label ?? value;

const formatRupiah = (amount: string | number) =>
  `Rp ${parseInt(String(amount) || '0').toLocaleString('id-ID')}`;

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

interface ExpensesTableProps {
  expenses: ExpenseRow[];
  actionLoading: string | null;
  onAdd: (payload: { date: string; category: string; amount: number; notes?: string }) => Promise<boolean>;
  onDelete: (expenseId: string) => void;
}

const EMPTY_FORM = { date: '', category: 'electricity', amount: '', notes: '' };

export default function ExpensesTable({ expenses, actionLoading, onAdd, onDelete }: ExpensesTableProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const handleSubmit = async () => {
    if (!form.date || !form.amount) return;
    const success = await onAdd({
      date: form.date,
      category: form.category,
      amount: parseInt(form.amount),
      notes: form.notes || undefined,
    });
    if (success) {
      setForm(EMPTY_FORM);
      setShowForm(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/^0+(?=\d)/, '');
    setForm(prev => ({ ...prev, amount: raw }));
  };

  const isSubmitting = actionLoading === 'add-expense';

  return (
    <Card className="bg-white/70 backdrop-blur-xl border-border shadow-soft rounded-[2rem] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border p-6">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold text-foreground">Expenses</CardTitle>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.18em]">
            Operational costs this month
          </p>
        </div>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)} className="rounded-xl shadow-lg shadow-orange-500/10">
            <Plus className="w-4 h-4 mr-2" /> Add Expense
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Add form */}
        {showForm && (
          <div className="border-b border-border bg-orange-50/30 p-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">New Expense</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Date</label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                  className="h-10 rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                  className="h-10 rounded-xl border border-border bg-white text-foreground text-sm font-semibold px-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Amount (Rp)</label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={handleAmountChange}
                  onFocus={e => { if (e.target.value === '0') setForm(prev => ({ ...prev, amount: '' })); }}
                  placeholder="150000"
                  className="h-10 rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Notes (optional)</label>
                <Input
                  type="text"
                  value={form.notes}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Description..."
                  className="h-10 rounded-xl"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={isSubmitting || !form.date || !form.amount}
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-6 rounded-xl font-bold"
              >
                {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />}
                Save
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                className="h-10 w-10 rounded-xl"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border">
                {['Date', 'Category', 'Amount', 'Notes', ''].map((head, idx) => (
                  <TableHead
                    key={idx}
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-4',
                      idx === 4 ? 'text-right pr-8 w-16' : ''
                    )}
                  >
                    {head}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                    No expenses recorded this month
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow key={expense.ID_Expense} className="border-border hover:bg-muted/20 transition-colors">
                    <TableCell className="font-medium text-muted-foreground py-4">
                      {formatDate(expense.Date)}
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-muted rounded-full text-muted-foreground">
                        {categoryLabel(expense.Category)}
                      </span>
                    </TableCell>
                    <TableCell className="font-bold text-destructive text-right">
                      {formatRupiah(expense.Amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                      {expense.Notes || '—'}
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={actionLoading === `delete-${expense.ID_Expense}`}
                        onClick={() => onDelete(expense.ID_Expense)}
                        className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                      >
                        {actionLoading === `delete-${expense.ID_Expense}`
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
