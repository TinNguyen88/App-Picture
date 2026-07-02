import React, { useState, useEffect, useRef } from "react";
import { PhotoItem } from "../types";
import { loadImage, copyPhotoToClipboard } from "../utils/photoProcessor";
import confetti from "canvas-confetti";
import { LayoutGrid, Download, Copy, Check, Plus, Trash2, Camera, Sliders, Sparkles } from "lucide-react";

interface GridMakerProps {
  photos: PhotoItem[];
  onUpload: (files: FileList) => void;
}

type GridLayout = "2-vertical" | "2-horizontal" | "3-left-big" | "3-top-big" | "4-grid";

export const GridMaker: React.FC<GridMakerProps> = ({ photos, onUpload }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [layout, setLayout] = useState<GridLayout>("2-vertical");
  const [gap, setGap] = useState<number>(8); // px
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [canvasUrl, setCanvasUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize selectedIds when photos change
  useEffect(() => {
    if (photos.length > 0 && selectedIds.length === 0) {
      const maxNeeded = layout.startsWith("2") ? 2 : layout.startsWith("3") ? 3 : 4;
      setSelectedIds(photos.slice(0, maxNeeded).map((p) => p.id));
    }
  }, [photos]);

  const maxPhotosForLayout = (l: GridLayout) => {
    if (l.startsWith("2")) return 2;
    if (l.startsWith("3")) return 3;
    return 4;
  };

  const handleSelectPhoto = (id: string) => {
    const max = maxPhotosForLayout(layout);
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length < max) {
        setSelectedIds([...selectedIds, id]);
      } else {
        // Replace oldest
        setSelectedIds([...selectedIds.slice(1), id]);
      }
    }
  };

  const handleLayoutChange = (newLayout: GridLayout) => {
    setLayout(newLayout);
    const max = maxPhotosForLayout(newLayout);
    if (selectedIds.length > max) {
      setSelectedIds(selectedIds.slice(0, max));
    } else if (selectedIds.length < max && photos.length > selectedIds.length) {
      const remaining = photos.filter((p) => !selectedIds.includes(p.id));
      const needed = max - selectedIds.length;
      setSelectedIds([...selectedIds, ...remaining.slice(0, needed).map((p) => p.id)]);
    }
  };

  // Generate combined grid canvas
  useEffect(() => {
    const generateGrid = async () => {
      const selectedPhotos = selectedIds.map((id) => photos.find((p) => p.id === id)).filter(Boolean) as PhotoItem[];
      if (selectedPhotos.length === 0) {
        setCanvasUrl(null);
        return;
      }

      setIsGenerating(true);
      try {
        const size = 2048; // Facebook HD Standard Width & Height
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { colorSpace: "srgb" });
        if (!ctx) return;

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);

        // Load all images
        const imgs = await Promise.all(selectedPhotos.map((p) => loadImage(p.originalUrl)));

        // Helper to draw image centered and cropped ("cover")
        const drawCover = (img: HTMLImageElement, x: number, y: number, w: number, h: number) => {
          const imgAspect = img.naturalWidth / img.naturalHeight;
          const boxAspect = w / h;
          let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;

          if (imgAspect > boxAspect) {
            sw = img.naturalHeight * boxAspect;
            sx = (img.naturalWidth - sw) / 2;
          } else {
            sh = img.naturalWidth / boxAspect;
            sy = (img.naturalHeight - sh) / 2;
          }
          ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
        };

        const g = gap;

        if (layout === "2-vertical") {
          // 2 vertical columns (left and right)
          const colW = (size - g) / 2;
          if (imgs[0]) drawCover(imgs[0], 0, 0, colW, size);
          if (imgs[1]) drawCover(imgs[1], colW + g, 0, colW, size);
        } else if (layout === "2-horizontal") {
          // 2 horizontal rows (top and bottom)
          const rowH = (size - g) / 2;
          if (imgs[0]) drawCover(imgs[0], 0, 0, size, rowH);
          if (imgs[1]) drawCover(imgs[1], 0, rowH + g, size, rowH);
        } else if (layout === "3-left-big") {
          // 1 big on left (width 55%), 2 stacked on right (width 45%)
          const leftW = Math.round((size - g) * 0.58);
          const rightW = size - leftW - g;
          const rightH = (size - g) / 2;
          if (imgs[0]) drawCover(imgs[0], 0, 0, leftW, size);
          if (imgs[1]) drawCover(imgs[1], leftW + g, 0, rightW, rightH);
          if (imgs[2]) drawCover(imgs[2], leftW + g, rightH + g, rightW, rightH);
        } else if (layout === "3-top-big") {
          // 1 big top (height 58%), 2 horizontal bottom
          const topH = Math.round((size - g) * 0.58);
          const botH = size - topH - g;
          const botW = (size - g) / 2;
          if (imgs[0]) drawCover(imgs[0], 0, 0, size, topH);
          if (imgs[1]) drawCover(imgs[1], 0, topH + g, botW, botH);
          if (imgs[2]) drawCover(imgs[2], botW + g, topH + g, botW, botH);
        } else if (layout === "4-grid") {
          // 2x2 grid
          const w = (size - g) / 2;
          const h = (size - g) / 2;
          if (imgs[0]) drawCover(imgs[0], 0, 0, w, h);
          if (imgs[1]) drawCover(imgs[1], w + g, 0, w, h);
          if (imgs[2]) drawCover(imgs[2], 0, h + g, w, h);
          if (imgs[3]) drawCover(imgs[3], w + g, h + g, w, h);
        }

        const url = canvas.toDataURL("image/jpeg", 0.98);
        setCanvasUrl(url);
        canvasRef.current = canvas;
      } catch (err) {
        console.error("Grid generation error:", err);
      } finally {
        setIsGenerating(false);
      }
    };

    generateGrid();
  }, [selectedIds, layout, gap, bgColor, photos]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#3b82f6", "#10b981", "#6366f1"],
    });
  };

  const handleDownloadGrid = () => {
    if (!canvasUrl) return;
    const a = document.createElement("a");
    a.href = canvasUrl;
    a.download = `TrungTinApp_FB_Grid_2048px_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    triggerConfetti();
  };

  const handleCopyGrid = async () => {
    if (!canvasUrl) return;
    const success = await copyPhotoToClipboard(canvasUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      triggerConfetti();
    } else {
      alert("Vui lòng bấm Tải Về Máy!");
    }
  };

  const layouts: { id: GridLayout; label: string; icon: string; desc: string }[] = [
    { id: "2-vertical", label: "2 Ảnh Dọc", icon: "⏸️", desc: "Chia đôi màn hình trái - phải" },
    { id: "2-horizontal", label: "2 Ảnh Ngang", icon: "🰀", desc: "Chia đôi màn hình trên - dưới" },
    { id: "3-left-big", label: "3 Ảnh (Trái Nhấn)", icon: "🗂️", desc: "1 Ảnh lớn bên trái + 2 ảnh bên phải" },
    { id: "3-top-big", label: "3 Ảnh (Trên Nhấn)", icon: "🗃️", desc: "1 Ảnh lớn bên trên + 2 ảnh bên dưới" },
    { id: "4-grid", label: "4 Ảnh Grid 2x2", icon: "🞖", desc: "4 ảnh vuông đều nhau chuẩn Facebook" },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900 border border-blue-500/30 rounded-3xl p-6 sm:p-8">
        <div className="max-w-2xl">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
            <LayoutGrid className="w-6 h-6 text-blue-400" />
            <span>Ghép Ảnh Layout Chuẩn Facebook HD</span>
          </h2>
          <p className="text-sm text-slate-300 mt-2">
            Facebook thường tự ý cắt cúp hoặc làm khuất góc khi đăng album nhiều ảnh. Bộ ghép Grid 2048px của Trung Tín App giúp bạn gom ảnh thành bố cục hoàn hảo, hiển thị trọn vẹn từng chi tiết mà không bị vỡ ảnh!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SETTINGS PANEL (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Layout Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-base flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-blue-400" />
              <span>1. Chọn Bố Cục Album ({maxPhotosForLayout(layout)} Ảnh)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {layouts.map((l) => {
                const active = layout === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => handleLayoutChange(l.id)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      active
                        ? "bg-blue-600/20 border-blue-500 text-white shadow-md"
                        : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-lg">{l.icon}</div>
                    <div className="font-bold text-sm mt-1">{l.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{l.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Gap & BgColor */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Viền cách ảnh (Gap):</span>
                  <span className="font-bold text-amber-400">{gap}px</span>
                </div>
                <div className="flex space-x-2">
                  {[0, 4, 8, 16, 24].map((val) => (
                    <button
                      key={val}
                      onClick={() => setGap(val)}
                      className={`flex-1 py-1 rounded-lg text-xs font-semibold border ${
                        gap === val ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-950 border-slate-800 text-slate-400"
                      }`}
                    >
                      {val}px
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-slate-300 font-medium block">Màu viền:</span>
                <div className="flex space-x-3">
                  {[
                    { name: "Trắng", color: "#ffffff" },
                    { name: "Đen", color: "#0f172a" },
                    { name: "Xám", color: "#475569" },
                  ].map((c) => (
                    <button
                      key={c.color}
                      onClick={() => setBgColor(c.color)}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                        bgColor === c.color ? "border-blue-500 bg-slate-800 text-white" : "border-slate-800 bg-slate-950 text-slate-400"
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full border border-slate-600" style={{ backgroundColor: c.color }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Photo Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">
                2. Chọn Ảnh ({selectedIds.length}/{maxPhotosForLayout(layout)})
              </h3>
              <label className="cursor-pointer bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1">
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Ảnh</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,.heic,.heif"
                  onChange={(e) => e.target.files && onUpload(e.target.files)}
                  className="hidden"
                />
              </label>
            </div>

            {photos.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl">
                <p className="text-xs text-slate-500">Chưa có ảnh nào. Vui lòng thêm ảnh từ máy tính/iPhone!</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                {photos.map((p, idx) => {
                  const isSelected = selectedIds.includes(p.id);
                  const selIndex = selectedIds.indexOf(p.id) + 1;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPhoto(p.id)}
                      className={`relative rounded-lg overflow-hidden border-2 cursor-pointer aspect-square ${
                        isSelected ? "border-blue-500 shadow-md scale-95" : "border-slate-800 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={p.originalUrl} alt={p.name} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-blue-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow">
                          {selIndex}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* PREVIEW PANEL (7 COLS) */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-white text-base">Kết Quả Grid HD 2048x2048px</h3>
                <p className="text-xs text-slate-400">Tối ưu hóa màu sRGB, siêu nét, sẵn sàng đăng tải</p>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">
                ✨ Chuẩn Facebook HD
              </span>
            </div>

            {/* Canvas Preview Area */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 flex items-center justify-center min-h-[400px] sm:min-h-[500px]">
              {isGenerating ? (
                <div className="flex flex-col items-center space-y-3 text-slate-400">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium">Đang xử lý ghép ảnh sRGB 2048px...</span>
                </div>
              ) : canvasUrl ? (
                <img src={canvasUrl} alt="Grid Preview" className="max-h-[500px] w-auto object-contain rounded-xl shadow-2xl border border-slate-800/80" />
              ) : (
                <div className="text-center space-y-2 max-w-sm text-slate-500">
                  <LayoutGrid className="w-12 h-12 mx-auto text-slate-700" />
                  <p className="text-sm">Vui lòng chọn ít nhất 1-2 ảnh từ danh sách bên trái để tạo khung Grid!</p>
                </div>
              )}
            </div>

            {/* Actions */}
            {canvasUrl && (
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleDownloadGrid}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2 text-base transition-all transform active:scale-95"
                >
                  <Download className="w-6 h-6 animate-bounce" />
                  <span>Tải Grid HD Về Máy</span>
                </button>
                <button
                  onClick={handleCopyGrid}
                  className={`sm:w-64 py-4 px-5 rounded-2xl font-bold flex items-center justify-center space-x-2 text-sm transition-all border ${
                    copied
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-lg"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 text-white" />
                      <span>Đã Copy! Dán FB</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 text-blue-400" />
                      <span>Copy Dán Trực Tiếp FB</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
