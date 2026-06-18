'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DepositReminder } from '@/hooks/useFinance';

interface DepositReminderBannerProps {
  reminders: DepositReminder[];
  dismissed: boolean;
  onDismiss: () => void;
  onViewDetails: () => void;
}

export default function DepositReminderBanner({
  reminders,
  dismissed,
  onDismiss,
  onViewDetails,
}: DepositReminderBannerProps) {
  const visible = reminders.length > 0 && !dismissed;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -12, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-[1.5rem] px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800">
                  {reminders.length} tenant{reminders.length > 1 ? 's' : ''} leaving within 7 days — deposit not yet returned
                </p>
                <p className="text-xs text-amber-700/70 mt-0.5">
                  {reminders.map(r => r.tenantName).join(', ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={onViewDetails}
                className="h-9 px-4 rounded-xl text-amber-700 hover:bg-amber-500/20 font-bold text-xs gap-1.5"
              >
                View Details
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={onDismiss}
                className="h-9 w-9 rounded-xl text-amber-600 hover:bg-amber-500/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
