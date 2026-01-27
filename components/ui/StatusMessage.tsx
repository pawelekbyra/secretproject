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
            'flex items-center gap-2 rounded-lg py-3 px-4 text-sm font-medium border',
            type === 'success'
              ? 'bg-green-500/15 border-green-500/30 text-green-500'
              : 'bg-red-500/15 border-red-500/30 text-red-500',
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
