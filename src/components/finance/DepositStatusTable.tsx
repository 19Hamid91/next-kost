'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { calculateDueDate, parseDurasiUnit } from '@/lib/dateUtils';
import type { DepositRow } from '@/hooks/useFinance';

const formatRupiah = (amount: string | number) =>
  `Rp ${parseInt(String(amount) || '0').toLocaleString('id-ID')}`;

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

interface DepositStatusTableProps {
  depositRows: DepositRow[];
  allRooms: any[];
  allTenants: any[];
  actionLoading: string | null;
  onRefund: (bookingId: string) => void;
  sectionRef?: React.RefObject<HTMLDivElement | null>;
}

// Inline confirm button — shows "Mark Returned" → click → shows ✓ and ✗ for confirmation
function MarkReturnedButton({
  bookingId,
  isLoading,
  onConfirm,
}: {
  bookingId: string;
  isLoading: boolean;
  onConfirm: () => void;
}) {
  const [pending, setPending] = useState(false);

  const handleInitialClick = () => setPending(true);
  const handleCancel = () => setPending(false);
  const handleConfirm = () => {
    setPending(false);
    onConfirm();
  };

  if (isLoading) {
    return (
      <div className="flex justify-end">
        <div className="h-8 w-8 flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end items-center gap-1.5 min-w-[120px]">
      <AnimatePresence mode="wait">
        {!pending ? (
          <motion.div
            key="initial"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ duration: 0.15 }}
          >
            <Button
              size="sm"
              variant="outline"
              onClick={handleInitialClick}
              className="h-8 px-4 rounded-xl text-xs font-bold border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-all"
            >
              Mark Returned
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5"
          >
            <span className="text-[10px] font-semibold text-muted-foreground mr-1 whitespace-nowrap">
              Confirm?
            </span>
            <Button
              size="icon"
              onClick={handleConfirm}
              className="h-8 w-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              title="Confirm refund"
            >
              <Check className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCancel}
              className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DepositStatusTable({
  depositRows,
  allRooms,
  allTenants,
  actionLoading,
  onRefund,
  sectionRef,
}: DepositStatusTableProps) {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const filteredRows = depositRows.filter((rental) => {
    const isActive = rental.Status_Sewa === 'AKTIF' || rental.Status_Sewa === 'BOOKING';
    if (isActive) return true;
    if (!rental.Tgl_Masuk) return false;
    return new Date(rental.Tgl_Masuk) >= threeMonthsAgo;
  });

  return (
    <Card
      ref={sectionRef}
      className="bg-white/70 backdrop-blur-xl border-border shadow-soft rounded-[2rem] overflow-hidden scroll-mt-24"
    >
      <CardHeader className="border-b border-border p-6">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold text-foreground">Deposit Status</CardTitle>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.18em]">
            Active tenants + last 3 months
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border">
                {['Tenant', 'Room', 'Check-in', 'Check-out', 'Deposit', 'Status', 'Action'].map((head, idx) => (
                  <TableHead
                    key={head}
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-4',
                      idx === 6 ? 'text-right pr-8' : ''
                    )}
                  >
                    {head}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                    No deposit records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((rental) => {
                  const room = allRooms.find((r: any) => r.ID_Kamar === rental.ID_Kamar);
                  const tenant = allTenants.find((t: any) => t.ID_Penghuni === rental.ID_Penghuni);
                  const isRefunded = rental.Deposit_Status === 'refunded';
                  const isLoading = actionLoading === `refund-${rental.ID_Sewa}`;

                  let endDateStr = '—';
                  if (rental.Tgl_Masuk) {
                    const startDate = new Date(rental.Tgl_Masuk);
                    const periode = parseInt(rental.Periode_Sewa) || 1;
                    const unit = parseDurasiUnit(rental.Unit_Durasi);
                    const endDate = calculateDueDate(startDate, periode, unit);
                    endDateStr = formatDate(endDate.toISOString());
                  }

                  return (
                    <TableRow
                      key={rental.ID_Sewa}
                      className={cn(
                        'border-border hover:bg-muted/20 transition-colors',
                        isRefunded ? 'opacity-60' : ''
                      )}
                    >
                      <TableCell className="font-bold text-foreground py-4">
                        {tenant?.Nama ?? rental.ID_Penghuni}
                      </TableCell>
                      <TableCell className="font-medium text-muted-foreground">
                        {room?.No_Kamar ?? rental.ID_Kamar}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(rental.Tgl_Masuk)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {endDateStr}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground text-right">
                        {formatRupiah(rental.Nominal_Deposit ?? 0)}
                      </TableCell>
                      <TableCell>
                        {isRefunded ? (
                          <Badge
                            variant="outline"
                            className="rounded-full text-[10px] font-bold px-3 border-0 bg-emerald-50 text-emerald-700 gap-1.5"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Refunded
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="rounded-full text-[10px] font-bold px-3 border-0 bg-amber-50 text-amber-700"
                          >
                            Held
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        {!isRefunded ? (
                          <MarkReturnedButton
                            bookingId={rental.ID_Sewa}
                            isLoading={isLoading}
                            onConfirm={() => onRefund(rental.ID_Sewa)}
                          />
                        ) : (
                          <span className="text-[10px] text-muted-foreground">
                            {rental.Deposit_Refunded_At ? formatDate(rental.Deposit_Refunded_At) : '—'}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
