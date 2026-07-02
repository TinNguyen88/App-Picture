import React, { useState } from "react";
import { PhotoItem, PhotoSettings, PresetType } from "../types";
import { formatBytes, copyPhotoToClipboard } from "../utils/photoProcessor";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import confetti from "canvas-confetti";
import JSZip from "jszip";
import {
  UploadCloud,
  Download,
  Copy,
  Check,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Trash2,
  Share2,
  Layers,
  FileText,
  Camera,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface PhotoOptimizerProps {
  photos: PhotoItem[];
  onUpload: (files: FileList) => void;
  onRemovePhoto: (id: string) => void;
  onClearAll: () => void;
  settings: PhotoSettings;
  onUpdateSettings: (newSettings: Partial<PhotoSettings>) => void;
  onSelectForAI: (item: PhotoItem) => void;
}

export const PhotoOptimizer: React.FC<PhotoOptimizerProps> = ({
  photos,
  onUpload,
  onRemovePhoto,
  onClearAll,
  settings,
  onUpdateSettings,
  onSelectForAI,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Default active photo is first or selected
  const activePhoto = photos.find((p) => p.id === selectedId) || photos[0];

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#3b82f6", "#10b981", "#6366f1", "#f59e0b"],
    });
  };

  const handleDownloadSingle = (item: PhotoItem) => {
    if (!item.optimizedUrl) return;
    const a = document.createElement("a");
    a.href = item.optimizedUrl;
    const ext = settings.format === "image/png" ? "png" : "jpg";
    a.download = `TrungTinApp_FB_HD_${item.name.replace(/\.[^/.]+$/, "")}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    triggerConfetti();
  };

  const handleCopyClipboard = async (item: PhotoItem) => {
    if (!item.optimizedUrl) return;
    const success = await copyPhotoToClipboard(item.optimizedUrl);
    if (success) {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 3000);
      triggerConfetti();
    } else {
      alert("Trình duyệt không hỗ trợ dán trực tiếp. Vui lòng bấm Tải Về Máy!");
    }
  };

  const handleDownloadAllZip = async () => {
    if (photos.length === 0) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder("TrungTinApp_Facebook_HD");

      for (const item of photos) {
        if (item.status === "done" && item.optimizedUrl) {
          const response = await fetch(item.optimizedUrl);
          const blob = await response.blob();
          const ext = settings.format === "image/png" ? "png" : "jpg";
          folder?.file(`TrungTinApp_HD_${item.name.replace(/\.[^/.]+$/, "")}.${ext}`, blob);
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "TrungTinApp_All_Facebook_HD.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      triggerConfetti();
    } catch (e) {
      console.error("Error creating zip:", e);
      alert("Lỗi khi tạo file ZIP. Vui lòng tải từng ảnh.");
    } finally {
      setIsZipping(false);
    }
  };

  const presets: { id: PresetType; label: string; sub: string; icon: string }[] = [
    { id: "fb_feed_2048", label: "Facebook Feed HD", sub: "2048px • Khuyên Dùng ⭐", icon: "⭐" },
    { id: "fb_story_9_16", label: "Story / Reels", sub: "1152x2048px • 9:16", icon: "📱" },
    { id: "fb_avatar_sq", label: "Ảnh Đại Diện", sub: "2048x2048px • Tròn", icon: "🖼️" },
    { id: "fb_cover", label: "Ảnh Bìa Profile/Page", sub: "2048x780px • Chuẩn tỷ lệ", icon: "📰" },
    { id: "original_hd", label: "Nguyên Bản HD", sub: "Giữ size gốc • sRGB", icon: "💎" },
  ];

  return (
    <div className="space-y-8">
      {/* 1. UPLOAD SECTION */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length > 0) {
            onUpload(e.dataTransfer.files);
          }
        }}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all ${
          dragOver
            ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
            : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
        }`}
      >
        <input
          type="file"
          id="photo-upload"
          multiple
          accept="image/*,.heic,.heif"
          onChange={(e) => e.target.files && onUpload(e.target.files)}
          className="hidden"
        />
        <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-10 h-10 animate-bounce" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
              Chạm Để Chọn Ảnh Từ iPhone / Máy Tính
            </h3>
            <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto">
              Kéo thả hoặc chọn nhiều ảnh cùng lúc (Hỗ trợ <span className="text-amber-400 font-semibold">HEIC, JPEG, PNG, RAW</span>). Tối đa 10 ảnh mỗi lần.
            </p>
          </div>
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform active:scale-95">
            <Camera className="w-5 h-5" />
            <span>Chọn Ảnh Ngay</span>
          </div>
        </label>
      </div>

      {/* 2. MAIN WORKSPACE IF PHOTOS EXIST */}
      {photos.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT/TOP PANEL: THUMBNAILS & PRO SETTINGS (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* THUMBNAIL LIST */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-white text-base">
                    Danh Sách Ảnh ({photos.length})
                  </h3>
                </div>
                <div className="flex items-center space-x-3">
                  {photos.length > 1 && (
                    <button
                      onClick={handleDownloadAllZip}
                      disabled={isZipping}
                      className="text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isZipping ? "Đang tạo ZIP..." : "Tải Tất Cả ZIP"}</span>
                    </button>
                  )}
                  <button
                    onClick={onClearAll}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa hết</span>
                  </button>
                </div>
              </div>

              {/* Thumbnails Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-1">
                {photos.map((p) => {
                  const isSelected = activePhoto?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      className={`relative group rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        isSelected ? "border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.02]" : "border-slate-800 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={p.originalUrl} alt={p.name} className="w-full h-24 object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 text-left">
                        <p className="text-[11px] font-medium text-white truncate">{p.name}</p>
                        <span className="text-[10px] text-emerald-400 font-semibold">
                          {p.status === "processing" ? "⏳ Đang xử lý..." : "✨ HD 2048px"}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemovePhoto(p.id);
                        }}
                        className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-rose-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PRESETS & PRO FILTERS */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Sliders className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">Chế Độ Đăng Facebook HD</h3>
              </div>

              {/* Preset buttons */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  1. Chọn Chuẩn Tỷ Lệ & Kích Thước
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {presets.map((pre) => {
                    const active = settings.preset === pre.id;
                    return (
                      <button
                        key={pre.id}
                        onClick={() => onUpdateSettings({ preset: pre.id })}
                        className={`text-left p-3 rounded-xl border transition-all flex items-start space-x-3 ${
                          active
                            ? "bg-blue-600/20 border-blue-500 text-white shadow-md"
                            : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700"
                        } ${pre.id === "fb_feed_2048" && !active ? "border-amber-500/40" : ""}`}
                      >
                        <span className="text-xl mt-0.5">{pre.icon}</span>
                        <div>
                          <div className="font-bold text-sm flex items-center space-x-1">
                            <span>{pre.label}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{pre.sub}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SLIDERS (Sharpen, Vibrance, Contrast) */}
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  2. Bộ Lọc Chống Vỡ Hạt & Rực Màu iPhone
                </label>

                {/* Sharpen Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium flex items-center space-x-1">
                      <span>⚡ Tăng độ nét (Chống mờ FB):</span>
                    </span>
                    <span className="font-bold text-amber-400">+{settings.sharpen}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.sharpen}
                    onChange={(e) => onUpdateSettings({ sharpen: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <p className="text-[10px] text-slate-500">
                    Khuyên dùng 15-30% để bù lại độ nhòe khi Facebook nén ảnh.
                  </p>
                </div>

                {/* Vibrance Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">🌈 Tăng rực rỡ (Vibrance sRGB):</span>
                    <span className="font-bold text-blue-400">{settings.vibrance > 0 ? `+${settings.vibrance}` : settings.vibrance}%</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={settings.vibrance}
                    onChange={(e) => onUpdateSettings({ vibrance: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                {/* Contrast Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">🌗 Tương phản (Contrast):</span>
                    <span className="font-bold text-purple-400">{settings.contrast > 0 ? `+${settings.contrast}` : settings.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={settings.contrast}
                    onChange={(e) => onUpdateSettings({ contrast: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
              </div>

              {/* OUTPUT FORMAT & WATERMARK */}
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  3. Định Dạng & Chữ Ký
                </label>

                {/* Format Radio */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onUpdateSettings({ format: "image/jpeg" })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      settings.format === "image/jpeg"
                        ? "bg-blue-600/20 border-blue-500 text-white font-bold"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="text-xs font-semibold">JPEG HD 98%</div>
                    <div className="text-[10px] opacity-70 mt-0.5">Tốt nhất cho Chân dung/Phong cảnh</div>
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ format: "image/png" })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      settings.format === "image/png"
                        ? "bg-blue-600/20 border-blue-500 text-white font-bold"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="text-xs font-semibold">PNG Lossless</div>
                    <div className="text-[10px] opacity-70 mt-0.5">Tốt nhất cho Ảnh có chữ / Screenshot</div>
                  </button>
                </div>

                {/* Watermark toggle */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
                      <span>🏷️ Thêm chữ ký bản quyền (Watermark):</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.watermark}
                      onChange={(e) => onUpdateSettings({ watermark: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-slate-800 border-slate-700"
                    />
                  </label>

                  {settings.watermark && (
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <input
                        type="text"
                        value={settings.watermarkText}
                        onChange={(e) => onUpdateSettings({ watermarkText: e.target.value })}
                        placeholder="VD: Shot on iPhone 16 Pro Max • Trung Tín"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <div className="flex space-x-2 text-[11px]">
                        {(["bottom-right", "bottom-left", "center"] as const).map((pos) => (
                          <button
                            key={pos}
                            onClick={() => onUpdateSettings({ watermarkPosition: pos })}
                            className={`px-2.5 py-1 rounded border ${
                              settings.watermarkPosition === pos
                                ? "bg-blue-600/30 border-blue-500 text-white"
                                : "bg-slate-900 border-slate-800 text-slate-400"
                            }`}
                          >
                            {pos === "bottom-right" ? "Góc Phải Dưới" : pos === "bottom-left" ? "Góc Trái Dưới" : "Chính Giữa"}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT/BOTTOM PANEL: PREVIEW & ACTIONS (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">
            {activePhoto ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
                
                {/* Photo Title & AI Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                      <ImageIcon className="w-5 h-5 text-blue-400" />
                      <span className="truncate max-w-sm">{activePhoto.name}</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Đang xem kết quả tối ưu hoá thực tế với thuật toán sRGB
                    </p>
                  </div>
                  <button
                    onClick={() => onSelectForAI(activePhoto)}
                    className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md self-start sm:self-auto"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>AI Viết Caption & Chấm Điểm</span>
                  </button>
                </div>

                {/* THE BEFORE / AFTER SLIDER */}
                <BeforeAfterSlider
                  originalUrl={activePhoto.originalUrl}
                  optimizedUrl={activePhoto.optimizedUrl || activePhoto.originalUrl}
                  originalName={activePhoto.name}
                  originalSizeStr={formatBytes(activePhoto.originalSize)}
                  optimizedSizeStr={formatBytes(activePhoto.optimizedSize || activePhoto.originalSize)}
                  originalDim={`${activePhoto.originalWidth}x${activePhoto.originalHeight}px`}
                  optimizedDim={`${activePhoto.optimizedWidth || activePhoto.originalWidth}x${activePhoto.optimizedHeight || activePhoto.originalHeight}px`}
                />

                {/* STATS HIGHLIGHT BOX */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Độ Phân Giải HD</span>
                    <div className="text-sm font-bold text-white">
                      {activePhoto.optimizedWidth} × {activePhoto.optimizedHeight} px
                    </div>
                    <span className="text-[10px] text-emerald-400 font-medium">✓ Chuẩn tỷ lệ Facebook</span>
                  </div>
                  <div className="space-y-1 border-y sm:border-y-0 sm:border-x border-slate-800 py-2 sm:py-0">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Dung Lượng Tối Ưu</span>
                    <div className="text-sm font-bold text-amber-400">
                      {formatBytes(activePhoto.optimizedSize)}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      (Gốc: {formatBytes(activePhoto.originalSize)})
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Tình Trạng Nén FB</span>
                    <div className="text-sm font-bold text-emerald-400 flex items-center justify-center space-x-1">
                      <span>Không Bị Vỡ Hạt</span>
                    </div>
                    <span className="text-[10px] text-slate-400">sRGB • Sharpened</span>
                  </div>
                </div>

                {/* PRIMARY ACTION BUTTONS (DOWNLOAD & COPY TO CLIPBOARD) */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => handleDownloadSingle(activePhoto)}
                    className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2.5 text-base transition-all transform active:scale-95"
                  >
                    <Download className="w-6 h-6 animate-bounce" />
                    <span>Tải Ảnh HD Về Máy (Chuẩn 2048px)</span>
                  </button>

                  <button
                    onClick={() => handleCopyClipboard(activePhoto)}
                    className={`sm:w-64 py-4 px-5 rounded-2xl font-bold flex items-center justify-center space-x-2 text-sm transition-all border ${
                      copiedId === activePhoto.id
                        ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/30"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                    }`}
                  >
                    {copiedId === activePhoto.id ? (
                      <>
                        <Check className="w-5 h-5 text-white" />
                        <span>Đã Sao Chép! Dán Vào FB</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 text-blue-400" />
                        <span>Copy Dán Trực Tiếp FB</span>
                      </>
                    )}
                  </button>
                </div>

                {/* INSTANT POST INSTRUCTION */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-start space-x-3 text-left">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300 space-y-1">
                    <p className="font-bold text-white">Mẹo đăng nhanh siêu nét không lo nén:</p>
                    <p>
                      Bấm nút <span className="text-blue-400 font-semibold">Copy Dán Trực Tiếp FB</span> ở trên ➔ Mở app Facebook trên iPhone/PC ➔ Chạm vào ô Tạo bài viết và chọn <span className="text-amber-400 font-semibold">Dán (Paste)</span>. Ảnh sẽ giữ 100% độ sắc nét chất lượng cao từ Trung Tín App!
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
