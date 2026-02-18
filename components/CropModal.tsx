"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { X, ZoomIn, ZoomOut, Check, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { useTranslation } from '@/context/LanguageContext';


interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  onCropComplete: (blob: Blob | null) => void;
}

const CROP_AREA_SIZE = 200; // The size of the circular crop area

const CropModal: React.FC<CropModalProps> = ({ isOpen, onClose, imageSrc, onCropComplete }) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (imageSrc) {
      const img = imageRef.current;
      img.src = imageSrc;
      img.onload = () => {
        // Reset state when new image is loaded
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const canvasRect = canvas.getBoundingClientRect();
        // Calculate minScale correctly based on the image size vs canvas size
        // We want the image to cover the crop area at min scale if possible
        const minScale = Math.max(CROP_AREA_SIZE / img.width, CROP_AREA_SIZE / img.height);

        // Or fit the canvas? Usually we fit the canvas.
        // Let's stick to fitting the canvas roughly.
        const fitScale = Math.max(canvasRect.width / img.width, canvasRect.height / img.height);

        setScale(fitScale);
        setOffset({ x: 0, y: 0 });
        drawCanvas(ctx, img, fitScale, { x: 0, y: 0 });
      };
    }
  }, [imageSrc]);

  useEffect(() => {
      const canvas = canvasRef.current;
      const img = imageRef.current;
      if (!canvas || !img.src) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      drawCanvas(ctx, img, scale, offset);
  }, [scale, offset]);

  const drawCanvas = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, currentScale: number, currentOffset: {x: number, y: number}) => {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const imgWidth = img.width * currentScale;
    const imgHeight = img.height * currentScale;
    const x = (canvas.width - imgWidth) / 2 + currentOffset.x;
    const y = (canvas.height - imgHeight) / 2 + currentOffset.y;
    ctx.drawImage(img, x, y, imgWidth, imgHeight);
  };

  const handleStart = (clientX: number, clientY: number) => {
      setIsDragging(true);
      lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging) return;
      const deltaX = clientX - lastMousePos.current.x;
      const deltaY = clientY - lastMousePos.current.y;
      lastMousePos.current = { x: clientX, y: clientY };
      setOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
  };

  const handleEnd = () => setIsDragging(false);

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => handleStart(e.clientX, e.clientY);
  const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX, e.clientY);
  const handleMouseUp = () => handleEnd();

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
          handleStart(e.touches[0].clientX, e.touches[0].clientY);
      }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
          e.preventDefault(); // Prevent scrolling while dragging
          handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
  };
  const handleTouchEnd = () => handleEnd();


  const handleSave = async () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img.src) return;

    setIsSaving(true);

    const outputCanvas = document.createElement('canvas');
    const finalSize = Math.min(img.width, img.height, 512); // Output a reasonable size (512px)
    outputCanvas.width = finalSize;
    outputCanvas.height = finalSize;
    const ctx = outputCanvas.getContext('2d');
    if (!ctx) return;

    const imgWidth = img.width * scale;
    const imgHeight = img.height * scale;
    const canvasCenterX = canvas.width / 2;
    const canvasCenterY = canvas.height / 2;

    const cropAreaDeviceSize = CROP_AREA_SIZE;
    const cropAreaSourceSize = cropAreaDeviceSize / scale;

    const sourceX = (img.width / 2) - (canvasCenterX - (canvasCenterX + offset.x)) / scale - (cropAreaSourceSize / 2);
    // Corrected logic: The previous line simplifies to img.width/2 + offset.x/scale ... which is wrong sign for dragging.
    // However, correcting the formula:
    // sourceX = (img.width / 2) - offset.x / scale - (cropAreaSourceSize / 2);
    // Let's replace completely with the cleaner formula derived:
    // sourceX = (img.width / 2) - offset.x / scale - (cropAreaSourceSize / 2);
    // sourceY = (img.height / 2) - offset.y / scale - (cropAreaSourceSize / 2);

    // Note: If I drag image RIGHT (offset.x > 0), the visible part is to the LEFT of image center.
    // So sourceX (top-left of crop on image) should be SMALLER than center.
    // (Center - offset/scale) is smaller. So this is correct.

    const finalSourceX = (img.width / 2) - offset.x / scale - (cropAreaSourceSize / 2);
    const finalSourceY = (img.height / 2) - offset.y / scale - (cropAreaSourceSize / 2);

    ctx.drawImage(img, finalSourceX, finalSourceY, cropAreaSourceSize, cropAreaSourceSize, 0, 0, finalSize, finalSize);

    outputCanvas.toBlob((blob) => {
        if (blob) {
            onCropComplete(blob);
        } else {
            console.error("Canvas to Blob conversion failed.");
            onCropComplete(null);
        }
        setIsSaving(false);
    }, 'image/png', 0.9);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[999] flex items-center justify-center p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-[2.5rem] p-8 w-full max-w-md border border-white/10 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black italic tracking-tighter text-white">{t('cropAvatarTitle')}</h3>
              <button onClick={onClose} disabled={isSaving} className="p-2 text-white/40 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="relative w-full h-72 bg-black/50 rounded-3xl overflow-hidden mb-6 border border-white/10 touch-none shadow-inner">
              <canvas
                ref={canvasRef}
                className="w-full h-full cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                aria-label={t('cropCanvasAriaLabel')}
              />
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-dashed border-white rounded-full pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
                style={{ width: CROP_AREA_SIZE, height: CROP_AREA_SIZE }}
              ></div>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setScale(s => s * 0.9)} disabled={isSaving} className="p-2 bg-white/5 rounded-xl text-white/40 hover:text-white transition-all active:scale-90"><ZoomOut size={20} /></button>
              <input
                type="range"
                min={0.1} max={3} step="0.01"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
                disabled={isSaving}
              />
              <button onClick={() => setScale(s => s * 1.1)} disabled={isSaving} className="p-2 bg-white/5 rounded-xl text-white/40 hover:text-white transition-all active:scale-90"><ZoomIn size={20} /></button>
            </div>

            <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-[#FE2C55] to-[#FF5E7D] text-white py-4 rounded-2xl font-bold shadow-lg shadow-pink-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
              {isSaving ? t('saving') : t('saveAvatarButton')}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CropModal;
