'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface StatusMessageProps {
  type: 'success' | 'error';
  message: string | null;
  isVisible: boolean;
  className?: string;
}

const StatusMessage: React.FC<StatusMessageProps> = ({
  type,
  message,
  isVisible,
  className,
}) => {
  return (
    <AnimatePresence>
      {isVisible && message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn(
            'flex items-center gap-3 rounded-2xl py-4 px-5 text-sm font-bold border backdrop-blur-md transition-all',
            type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 neon-glow-green'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400',
            className
          )}
        >
          {type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StatusMessage;
