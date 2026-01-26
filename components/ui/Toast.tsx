'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    
    // Auto remove after duration
    const duration = toast.duration || 3000;
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, duration);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

/**
 * Toast notification component
 * E-commerce best practice: Provide immediate user feedback for actions
 */
export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 sm:gap-3 max-w-sm w-full sm:w-auto pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(onClose, toast.duration || 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, onClose]);

  const styles = {
    success: {
      bg: 'var(--success-bg)',
      text: 'var(--success-text)',
      border: 'var(--success-border)',
      icon: '✓',
    },
    error: {
      bg: 'var(--error-bg)',
      text: 'var(--error-text)',
      border: 'var(--error-border)',
      icon: '✕',
    },
    info: {
      bg: 'var(--beige)',
      text: 'var(--text-on-beige)',
      border: 'var(--border-light)',
      icon: 'ℹ',
    },
    warning: {
      bg: 'var(--beige)',
      text: 'var(--text-on-beige)',
      border: 'var(--border-light)',
      icon: '⚠',
    },
  };

  const style = styles[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: 100 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="pointer-events-auto"
    >
      <div
        className="p-4 rounded-lg shadow-lg border flex items-start gap-3 min-h-[44px]"
        style={{
          backgroundColor: style.bg,
          color: style.text,
          borderColor: style.border,
        }}
        role="alert"
      >
        <span className="text-lg font-bold flex-shrink-0" aria-hidden="true">
          {style.icon}
        </span>
        <p className="flex-1 text-body-sm sm:text-body-base font-medium">{toast.message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-lg font-bold opacity-70 hover:opacity-100 transition-opacity min-w-[44px] min-h-[44px] flex items-center justify-center touch-target cursor-pointer"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
}

/**
 * Helper function to show toast notifications
 * E-commerce best practice: Easy-to-use API for user feedback
 */
export function showToast(message: string, type: ToastType = 'info', duration?: number) {
  useToastStore.getState().addToast({ message, type, duration });
}
