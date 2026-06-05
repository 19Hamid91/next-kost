'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, CheckCircle2, XCircle, ChevronUp, Loader2 } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';

// ── Action definitions ──────────────────────────────────────────────

export interface FabAction {
  label: string;
  icon?: React.ElementType;
  variant?: 'default' | 'destructive' | 'outline';
  className?: string;
  confirmTitle?: string;
  confirmDescription?: string;
  onExecute: () => Promise<boolean>;
}

interface FloatingActionBarProps {
  selectedCount: number;
  actions: FabAction[];
  onClearSelection: () => void;
  loading?: boolean;
}

// ── Main Component ────────────────────────────────────────────────

export default function FloatingActionBar({
  selectedCount,
  actions,
  onClearSelection,
  loading = false,
}: FloatingActionBarProps) {
  const [pendingAction, setPendingAction] = useState<FabAction | null>(null);

  const handleAction = (action: FabAction) => {
    if (action.confirmTitle) {
      setPendingAction(action);
    } else {
      action.onExecute();
    }
  };

  return (
    <>
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            key="fab"
            initial={{ y: 120, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 120, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-foreground/95 backdrop-blur-xl text-background rounded-[2rem] shadow-2xl shadow-black/20 border border-white/10"
          >
            {/* Slide up icon */}
            <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <ChevronUp className="w-4 h-4 text-white/60" />
            </div>

            {/* Count badge */}
            <Badge className="bg-primary text-white border-0 font-bold rounded-xl px-3 shrink-0 shadow-lg shadow-orange-500/20">
              {selectedCount} dipilih
            </Badge>

            {/* Divider */}
            <div className="w-px h-6 bg-white/10 shrink-0" />

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {actions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={idx}
                    size="sm"
                    disabled={loading}
                    onClick={() => handleAction(action)}
                    className={
                      action.className ||
                      (action.variant === 'destructive'
                        ? 'bg-rose-500 hover:bg-rose-600 text-white h-9 px-4 rounded-xl font-bold text-xs'
                        : 'bg-white/10 hover:bg-white/20 text-white h-9 px-4 rounded-xl font-bold text-xs border border-white/10')
                    }
                  >
                    {loading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    ) : Icon ? (
                      <Icon className="w-3.5 h-3.5 mr-1.5" />
                    ) : null}
                    {action.label}
                  </Button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-white/10 shrink-0" />

            {/* Clear */}
            <Button
              size="icon"
              variant="ghost"
              onClick={onClearSelection}
              disabled={loading}
              className="h-9 w-9 rounded-xl text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm dialog */}
      {pendingAction && (
        <ConfirmModal
          isOpen={!!pendingAction}
          onClose={() => setPendingAction(null)}
          onConfirm={async () => {
            const success = await pendingAction.onExecute();
            if (success) setPendingAction(null);
          }}
          loading={loading}
          title={pendingAction.confirmTitle || 'Konfirmasi'}
          description={pendingAction.confirmDescription || `Terapkan perubahan ke ${selectedCount} item?`}
        />
      )}
    </>
  );
}

// ── Pre-built action factories ────────────────────────────────────

export function makeStatusAction(
  label: string,
  status: string,
  selectedCount: number,
  onExecute: () => Promise<boolean>
): FabAction {
  const isActive = status === 'AKTIF';
  return {
    label,
    icon: isActive ? CheckCircle2 : XCircle,
    confirmTitle: `Ubah status ${selectedCount} item?`,
    confirmDescription: `Semua item yang dipilih akan diubah menjadi ${status}.`,
    onExecute,
    className: isActive
      ? 'bg-emerald-500 hover:bg-emerald-600 text-white h-9 px-4 rounded-xl font-bold text-xs'
      : 'bg-rose-500 hover:bg-rose-600 text-white h-9 px-4 rounded-xl font-bold text-xs',
  };
}
