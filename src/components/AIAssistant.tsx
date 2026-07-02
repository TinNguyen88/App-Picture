import React, { useState } from "react";
import { PhotoItem, AIPhotoAnalysis, AICaptionItem } from "../types";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Search,
  MessageSquare,
  Check,
  Copy,
  AlertTriangle,
  CheckCircle2,
  ThumbsUp,
  Image as ImageIcon,
  Send,
  Loader2,
  RefreshCw,
  HelpCircle,
} from "lucide-react";

interface AIAssistantProps {
  photos: PhotoItem[];
  selectedPhotoId: string | null;
  onSelectPhoto: (id: string) => void;
  onUpload: (files: FileList) => void;
  onUpdatePhotoAI: (id: string, analysis: AIPhotoAnalysis) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  photos,
  selectedPhotoId,
  onSelectPhoto,
  onUpload,
  onUpdatePhotoAI,
}) => {
  const activePhoto = photos.find((p) => p.id === selectedPhotoId) || photos[0];
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [vibe, setVibe] = useState("Sang Chảnh & Ngầu");
  const [topic, setTopic] = useState("");
  const [captions, setCaptions] = useState<AICaptionItem[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const vibes = [
    "Sang Chảnh & Ngầu 😎",
    "Thả Thính Siêu Dính 💘",
    "Hài Hước & lầy lội 🤣",
    "Sống Ảo Chiêm Nghiệm 🌿",
    "Du Lịch & Khám Phá ✈️",
    "Doanh Nhân & Chuyên Nghiệp 💼",
  ];

  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  const convertToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleAnalyzePhoto = async () => {
    if (!activePhoto) return;
    setIsAnalyzing(true);
    try {
      const base64 = await convertToBase64(activePhoto.originalUrl);
      const res = await fetch("/api/gemini/analyze-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const data: AIPhotoAnalysis = await res.json();
      if (res.ok && data) {
        onUpdatePhotoAI(activePhoto.id, data);
        triggerConfetti();
      } else {
        alert("Không thể phân tích ảnh lúc này. Vui lòng thử lại!");
      }
    } catch (e) {
      console.error("Analyze error:", e);
      alert("Lỗi kết nối AI. Vui lòng kiểm tra API Key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateCaptions = async () => {
    if (!activePhoto && !topic) {
      alert("Vui lòng chọn 1 ảnh hoặc nhập chủ đề bài viết!");
      return;
    }
    setIsGeneratingCaption(true);
    try {
      let base64 = "";
      if (activePhoto) {
        base64 = await convertToBase64(activePhoto.originalUrl);
      }
      const res = await fetch("/api/gemini/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, vibe, topic }),
      });
      const data = await res.json();
      if (res.ok && data.captions) {
        setCaptions(data.captions);
        triggerConfetti();
      } else {
        alert("Lỗi khi tạo caption AI. Vui lòng thử lại!");
      }
    } catch (e) {
      console.error("Caption error:", e);
      alert("Lỗi kết nối AI.");
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handleCopyCaption = (item: AICaptionItem, idx: number) => {
    const fullText = `${item.text}\n\n${item.hashtags}`;
    navigator.clipboard.writeText(fullText);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 3000);
    triggerConfetti();
  };

  return (
    <div className="space-y-8">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-amber-900/40 via-purple-900/40 to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8">
        <div className="max-w-3xl">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            <span>AI Trợ Lý Đăng Bài Facebook Chuẩn Viral</span>
          </h2>
          <p className="text-sm text-slate-300 mt-2">
            Được trang bị trí tuệ nhân tạo Gemini thế hệ mới, Trung Tín App không chỉ làm sắc nét ảnh mà còn kiểm định nguy cơ vỡ hạt khi đăng lên Facebook và tự động viết những dòng trạng thái (caption) triệu view!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: PHOTO SELECTION (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <span>Chọn Ảnh Để Phân Tích AI</span>
              </h3>
              <label className="cursor-pointer text-[11px] bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-lg font-semibold">
                + Thêm
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && onUpload(e.target.files)}
                  className="hidden"
                />
              </label>
            </div>

            {photos.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl">
                <p className="text-xs text-slate-500">Chưa tải ảnh lên. Hãy bấm Thêm để chọn ảnh từ iPhone!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                {photos.map((p) => {
                  const isSel = activePhoto?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => onSelectPhoto(p.id)}
                      className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-square ${
                        isSel ? "border-amber-500 shadow-lg shadow-amber-500/20 scale-95" : "border-slate-800 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={p.originalUrl} alt={p.name} className="w-full h-full object-cover" />
                      {p.aiAnalysis && (
                        <div className="absolute top-1 right-1 bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[10px]">
                          {p.aiAnalysis.score}/100
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {activePhoto && (
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Ảnh đang chọn:</span>
                  <span className="text-white font-medium truncate max-w-[150px]">{activePhoto.name}</span>
                </div>
                <button
                  onClick={handleAnalyzePhoto}
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-amber-600/30 flex items-center justify-center space-x-2 text-xs transition-all"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>AI đang quét độ nét...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>🔍 AI Quét Độ Nét & Chất Lượng</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: ANALYSIS & CAPTIONS (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. AI QUALITY VERDICT CARD */}
          {activePhoto?.aiAnalysis && (
            <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-lg">
                    {activePhoto.aiAnalysis.score}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                      Chấm điểm Facebook HD
                    </span>
                    <h3 className="text-lg font-bold text-white flex items-center space-x-1.5">
                      <span>{activePhoto.aiAnalysis.verdict}</span>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 inline" />
                    </h3>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-400">Nguy cơ bị FB nén vỡ:</span>
                  <span className={`px-2.5 py-1 rounded-full font-bold ${
                    activePhoto.aiAnalysis.facebookCompressionRisk === "Thấp"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}>
                    {activePhoto.aiAnalysis.facebookCompressionRisk}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 font-semibold block">💡 Nhận xét độ nét:</span>
                  <p className="text-slate-200 leading-relaxed">{activePhoto.aiAnalysis.summary}</p>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 font-semibold block">🌈 Màu sắc & Ánh sáng:</span>
                  <p className="text-slate-200 leading-relaxed">{activePhoto.aiAnalysis.lighting}</p>
                </div>
              </div>

              {activePhoto.aiAnalysis.recommendations?.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 space-y-1.5">
                  <span className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Lời khuyên từ chuyên gia Trung Tín App:</span>
                  </span>
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pl-1">
                    {activePhoto.aiAnalysis.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 2. AI CAPTION GENERATOR */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-white text-base">✨ AI Viết Caption Facebook Viral</h3>
            </div>

            {/* Vibe selection */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                1. Chọn phong cách bài đăng
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {vibes.map((v) => (
                  <button
                    key={v}
                    onClick={() => setVibe(v)}
                    className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-left ${
                      vibe === v
                        ? "bg-purple-600/30 border-purple-500 text-white shadow-md"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Topic Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                2. Ghi chú thêm / Ý tưởng (Không bắt buộc)
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="VD: Đi cà phê cuối tuần ở Sài Gòn, chụp bằng iPhone 16 mới tậu..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              onClick={handleGenerateCaptions}
              disabled={isGeneratingCaption}
              className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2 text-sm transition-all"
            >
              {isGeneratingCaption ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>AI đang suy nghĩ và sáng tác caption...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 animate-bounce" />
                  <span>Tạo 3 Mẫu Caption Facebook Chuẩn Viral</span>
                </>
              )}
            </button>

            {/* CAPTIONS RESULTS */}
            {captions.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  🔥 Các Mẫu Caption Gợi Ý Cho Bạn:
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {captions.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-3 relative group hover:border-purple-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                          {item.style}
                        </span>
                        <button
                          onClick={() => handleCopyCaption(item, idx)}
                          className={`px-3 py-1 rounded-lg font-bold flex items-center space-x-1.5 transition-all text-xs ${
                            copiedIndex === idx
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                          }`}
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-white" />
                              <span>Đã Copy!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-purple-400" />
                              <span>Sao chép</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {item.text}
                      </p>

                      <div className="text-xs font-medium text-blue-400 pt-1">
                        {item.hashtags}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
