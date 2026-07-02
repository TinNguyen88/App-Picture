import React, { useState, useRef, useEffect } from "react";
import { SlidersHorizontal, Maximize2, ShieldAlert, Sparkles } from "lucide-react";

interface BeforeAfterSliderProps {
  originalUrl: string;
  optimizedUrl: string;
  originalName: string;
  originalSizeStr: string;
  optimizedSizeStr: string;
  originalDim: string;
  optimizedDim: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  originalUrl,
  optimizedUrl,
  originalSizeStr,
  optimizedSizeStr,
  originalDim,
  optimizedDim,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 to 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
        <div className="flex items-center space-x-1.5 text-amber-500">
          <ShieldAlert className="w-4 h-4" />
          <span>ẢNH GỐC IPHONE ({originalDim} - {originalSizeStr})</span>
        </div>
        <div className="flex items-center space-x-1.5 text-emerald-400">
          <span>ẢNH TỐI ƯU FACEBOOK ({optimizedDim} - {optimizedSizeStr})</span>
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-[400px] sm:h-[500px] md:h-[580px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl select-none cursor-ew-resize group"
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* Optimized Image (Background / Right side) */}
        <img
          src={optimizedUrl}
          alt="Optimized HD"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />

        {/* Original Image (Foreground / Left side clipped by slider) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={originalUrl}
            alt="Original iPhone"
            className="absolute inset-0 w-full h-full object-contain"
            style={{ width: containerRef.current ? containerRef.current.clientWidth : "100%", height: "100%" }}
          />
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-lg">
            📱 Gốc iPhone (HEIC/Raw)
          </div>
        </div>

        {/* Optimized Label on right */}
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-lg pointer-events-none">
          ✨ Chuẩn Facebook 2048px (sRGB)
        </div>

        {/* Slider Divider Bar */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-white to-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)] pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Slider Thumb Handle */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white text-slate-900 rounded-full shadow-xl flex items-center justify-center border-2 border-blue-500 transition-transform group-hover:scale-110">
            <SlidersHorizontal className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        {/* Instructions overlay */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs text-slate-300 border border-slate-700 pointer-events-none flex items-center space-x-1.5">
          <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
          <span>Kéo sang trái/phải để so sánh độ nét</span>
        </div>
      </div>
    </div>
  );
};
