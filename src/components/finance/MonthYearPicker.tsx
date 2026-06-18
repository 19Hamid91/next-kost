'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface MonthYearPickerProps {
  month: number;   // 1–12
  year: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function MonthYearPicker({ month, year, onPrev, onNext }: MonthYearPickerProps) {
  const now = new Date();
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  return (
    <div className="flex items-center gap-2 bg-white/70 backdrop-blur-xl border border-border rounded-2xl p-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrev}
        className="h-9 w-9 rounded-xl hover:bg-muted transition-all"
      >
        <ChevronLeft className="w-4 h-4 text-muted-foreground" />
      </Button>

      <div className="flex items-center gap-2 px-3 min-w-[160px] justify-center">
        <span className="text-sm font-bold text-foreground tracking-tight">
          {MONTH_NAMES_EN[month - 1]} {year}
        </span>
        {isCurrentMonth && (
          <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-primary/10 text-primary rounded-full">
            Now
          </span>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        className="h-9 w-9 rounded-xl hover:bg-muted transition-all"
      >
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </Button>
    </div>
  );
}
