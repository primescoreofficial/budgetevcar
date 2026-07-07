'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Check, Crop } from 'lucide-react';
import { Button, Card } from './DesignSystem';

export default function CustomCropper({ imageSrc, onCrop, onCancel, aspectRatio = 1.5 }) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  // Reset positioning when image source changes
  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [imageSrc]);

  // Handle dragging
  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    setOffset({ x: newX, y: newY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Perform crop calculation on canvas
  const handleConfirm = () => {
    if (!containerRef.current || !imgRef.current) return;

    const container = containerRef.current;
    const img = imgRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    // Container dimensions
    const cWidth = container.clientWidth;
    const cHeight = container.clientHeight;

    // Image natural dimensions
    const nWidth = img.naturalWidth;
    const nHeight = img.naturalHeight;

    // Calculate how the image is scaled and offset in the crop box
    // Aspect ratio fit calculation
    const imgRatio = nWidth / nHeight;
    const boxRatio = cWidth / cHeight;
    
    let renderedWidth = cWidth;
    let renderedHeight = cHeight;

    if (imgRatio > boxRatio) {
      renderedHeight = cHeight;
      renderedWidth = cHeight * imgRatio;
    } else {
      renderedWidth = cWidth;
      renderedHeight = cWidth / imgRatio;
    }

    // Apply zoom
    const finalWidth = renderedWidth * zoom;
    const finalHeight = renderedHeight * zoom;

    // Center offset
    const centerX = (cWidth - finalWidth) / 2 + offset.x;
    const centerY = (cHeight - finalHeight) / 2 + offset.y;

    // Convert screen coordinates back to natural image pixels
    const scaleX = nWidth / finalWidth;
    const scaleY = nHeight / finalHeight;

    // Source coordinates on the natural image to crop
    const sx = -centerX * scaleX;
    const sy = -centerY * scaleY;
    const sWidth = 600 * (cWidth / finalWidth) * (nWidth / cWidth);
    const sHeight = 400 * (cHeight / finalHeight) * (nHeight / cHeight);

    ctx.drawImage(
      img,
      sx, sy, sWidth, sHeight,  // Source crop rect
      0, 0, 600, 400            // Destination canvas rect
    );

    // Convert canvas content to webp blob
    canvas.toBlob((blob) => {
      if (blob) {
        onCrop(blob);
      }
    }, 'image/webp', 0.9);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="max-w-xl w-full p-6 space-y-6 bg-white border border-slate-200 shadow-xl rounded-3xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-800">
            <Crop className="w-5 h-5 text-[#1e40af]" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider">Crop Main Vehicle Image</h3>
          </div>
          <button 
            type="button" 
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drag to Position Workspace */}
        <div 
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="relative aspect-[3/2] w-full bg-slate-950 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none border border-slate-200"
          style={{ touchAction: 'none' }}
        >
          {/* Grid Guideline Overlay */}
          <div className="absolute inset-0 border border-white/20 pointer-events-none z-10">
            <div className="absolute inset-y-0 left-1/3 w-[1px] bg-white/20"></div>
            <div className="absolute inset-y-0 left-2/3 w-[1px] bg-white/20"></div>
            <div className="absolute inset-x-0 top-1/3 h-[1px] bg-white/20"></div>
            <div className="absolute inset-x-0 top-2/3 h-[1px] bg-white/20"></div>
          </div>

          <img
            ref={imgRef}
            src={imageSrc}
            alt="To Crop"
            draggable={false}
            className="absolute pointer-events-none max-w-none origin-center"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
          />
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/60 p-3 rounded-2xl">
          <ZoomOut className="w-4.5 h-4.5 text-slate-400" />
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="flex-1 accent-[#1e40af] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
          <ZoomIn className="w-4.5 h-4.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-600 min-w-8 text-right">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button 
            type="button" 
            variant="secondary" 
            size="medium"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="primary" 
            size="medium"
            icon={Check}
            onClick={handleConfirm}
          >
            Apply Crop
          </Button>
        </div>

      </Card>
    </div>
  );
}
