"use client";

import React, { useMemo } from 'react';
import { HtmlSlideDataDTO } from '@/lib/dto';
import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';

interface HtmlContentProps {
  data: HtmlSlideDataDTO;
  isActive: boolean;
}

const HtmlContent: React.FC<HtmlContentProps> = ({
  data,
  isActive,
}) => {
  const sanitizedHtml = useMemo(() => {
    if (typeof window !== 'undefined' && data.htmlContent) {
      return DOMPurify.sanitize(data.htmlContent);
    }
    return '';
  }, [data.htmlContent]);

  return (
    <div className="h-full w-full relative bg-[#FDFBF7] text-[#1a1a1a] overflow-y-auto selection:bg-yellow-200/50 font-serif">
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-12 text-center">
        <div className="inline-block mb-6 px-3 py-1 border border-stone-900 text-[10px] font-sans font-bold tracking-[0.2em] uppercase">
          www.eliksir-wiedzmina.pl
        </div>

        <h1 className="mb-8 text-stone-900">
          <span className="block text-5xl md:text-7xl font-bold leading-none tracking-tight">
            Eliksir Wiedźmina
          </span>
          <span className="block text-2xl md:text-4xl text-stone-500 italic font-medium mt-6 max-w-3xl mx-auto">
            Mroczna tajemnica twórców CD Projekt
          </span>
        </h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-24">
        <div
          className={cn(
            "prose prose-stone prose-lg max-w-none",
            "prose-headings:font-sans prose-headings:font-bold prose-headings:text-stone-900",
            "prose-p:leading-relaxed prose-p:text-stone-800",
            "prose-a:text-stone-900 prose-a:font-bold prose-a:no-underline prose-a:underline prose-a:decoration-double prose-a:decoration-stone-400 hover:prose-a:bg-stone-100 transition-colors",
            "prose-blockquote:not-italic prose-blockquote:border-l-stone-800"
          )}
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      </div>
    </div>
  );
};

export default HtmlContent;
