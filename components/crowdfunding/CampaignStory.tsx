"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface CampaignStoryProps {
  title: string;
  quote: string;
  firstParagraph: string;
  hiddenContent: React.ReactNode;
}

export const CampaignStory: React.FC<CampaignStoryProps> = ({ title, quote, firstParagraph, hiddenContent }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article className="space-y-16">
      <div className="space-y-8">
        <h3 className="text-6xl md:text-8xl font-black uppercase tracking-tight leading-[0.85] text-stone-900 decoration-primary decoration-8 underline-offset-[16px]">
          {title.split(' ')[0]}<br />{title.split(' ').slice(1).join(' ')}
        </h3>
        <p className="text-2xl md:text-3xl leading-snug text-stone-800 font-bold tracking-tight italic">
          &quot;{quote}&quot;
        </p>
      </div>

      <div className="prose prose-stone prose-xl lg:prose-2xl max-w-none text-stone-800">
        <p className="first-letter:text-8xl first-letter:font-black first-letter:text-primary first-letter:mr-4 first-letter:float-left first-letter:mt-2">
          {firstParagraph}
        </p>

        <AnimatePresence>
          {!isExpanded ? (
            <button
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-sm py-4 group"
            >
              Czytaj dalej Manifest
              <ChevronDown size={16} className="group-hover:translate-y-1 transition-transform" />
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-8"
            >
              {hiddenContent}
              <button
                onClick={() => setIsExpanded(false)}
                className="text-stone-400 font-bold uppercase tracking-widest text-xs py-4"
              >
                Zwiń opis
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </article>
  );
};
