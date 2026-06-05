'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  variant?: 'destructive' | 'primary';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Apakah Anda yakin?",
  description = "Tindakan ini tidak dapat dibatalkan.",
  confirmText = "Hapus",
  cancelText = "Batal",
  loading = false,
  variant = 'destructive'
}: ConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white/90 backdrop-blur-2xl border-white/20 shadow-premium rounded-[2.5rem] max-w-[400px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-6">
          <DialogHeader className="flex flex-col items-center gap-6 pt-4">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 200 }}
              className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg ${
                variant === 'destructive' 
                  ? 'bg-destructive/10 text-destructive shadow-destructive/10' 
                  : 'bg-primary/10 text-primary shadow-orange-500/10'
              }`}
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <AlertTriangle className="w-8 h-8" />
              </motion.div>
            </motion.div>
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-2 text-center"
            >
              <DialogTitle className="text-xl font-bold text-foreground tracking-tight">{title}</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm font-medium leading-relaxed px-4">
                {description}
              </DialogDescription>
            </motion.div>
          </DialogHeader>
          <DialogFooter className="mt-8 flex gap-3 sm:flex-row flex-col">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-11 rounded-xl font-bold text-muted-foreground hover:bg-muted"
            >
              {cancelText}
            </Button>
            <Button
              variant={variant === 'destructive' ? 'destructive' : 'default'}
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 h-11 rounded-xl font-bold shadow-xl ${
                variant === 'destructive' ? 'shadow-destructive/10' : 'shadow-orange-500/10'
              }`}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {confirmText}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
