import React, { useState } from "react";
import { FB_SECRET_TIPS, FBSecretTip } from "../utils/fbTips";
import {
  BookOpen,
  Maximize2,
  Smartphone,
  Camera,
  ClipboardCheck,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

export const SecretGuide: React.FC = () => {
  const [activeTip, setActiveTip] = useState<string>("tip-1");

  const getIcon = (name: string) => {
    switch (name) {
      case "Maximize2":
        return <Maximize2 className="w-6 h-6 text-blue-400" />;
      case "Smartphone":
        return <Smartphone className="w-6 h-6 text-emerald-400" />;
      case "Camera":
        return <Camera className="w-6 h-6 text-amber-400" />;
      case "ClipboardCheck":
        return <ClipboardCheck className="w-6 h-6 text-purple-400" />;
      default:
        return <BookOpen className="w-6 h-6 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* HERO BANNER */}
      <div className="bg-gradient-to-r from-blue-900/50 via-slate-900 to-emerald-900/40 border border-blue-500/30 rounded-3xl p-6 sm:p-10">
        <div className="max-w-3xl">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-3">
            💡 Bí Kíp Độc Quyền Cho Apple Fans
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            4 Nguyên Tắc Vàng Để Ảnh iPhone Đăng Facebook Siêu Nét Không Bị Vỡ Hạt
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
            Nhiều người nghĩ iPhone chụp đẹp là đăng lên web sẽ đẹp, nhưng thực tế thuật toán của Facebook luôn tự động giảm bitrate và làm mờ ảnh nếu bạn không tuân thủ 4 quy tắc sống còn dưới đây!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT TAB LIST (4 COLS) */}
        <div className="lg:col-span-4 space-y-3">
          {FB_SECRET_TIPS.map((tip, idx) => {
            const isActive = activeTip === tip.id;
            return (
              <button
                key={tip.id}
                onClick={() => setActiveTip(tip.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                  isActive
                    ? "bg-slate-900 border-blue-500 shadow-xl shadow-blue-500/10 scale-[1.02]"
                    : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:bg-slate-900/40"
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`p-2.5 rounded-xl border ${
                    isActive ? "bg-blue-500/20 border-blue-500/40" : "bg-slate-900 border-slate-800"
                  }`}>
                    {getIcon(tip.icon)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                      Bí kíp #{idx + 1} • {tip.badge}
                    </span>
                    <h3 className={`font-bold text-sm mt-0.5 leading-snug ${isActive ? "text-white" : "text-slate-300"}`}>
                      {tip.title}
                    </h3>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 transition-transform ${isActive ? "text-blue-400 translate-x-1" : "text-slate-600"}`} />
              </button>
            );
          })}
        </div>

        {/* RIGHT DETAIL CONTENT (8 COLS) */}
        <div className="lg:col-span-8">
          {FB_SECRET_TIPS.map((tip) => {
            if (tip.id !== activeTip) return null;
            return (
              <div key={tip.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
                <div className="flex items-center space-x-3 border-b border-slate-800 pb-5">
                  <div className="p-3 rounded-2xl bg-blue-500/20 border border-blue-500/30">
                    {getIcon(tip.icon)}
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {tip.badge}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                      {tip.title}
                    </h3>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 text-sm text-slate-300 leading-relaxed font-medium">
                  "{tip.description}"
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-1.5">
                    <span>📋 Hướng dẫn thực hiện từng bước:</span>
                  </h4>
                  <div className="space-y-3">
                    {tip.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start space-x-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                        <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-500/30">
                          {idx + 1}
                        </div>
                        <p className="text-sm text-slate-200 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex items-start space-x-3">
                  <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-emerald-300">
                    <strong className="text-emerald-200 font-bold">Mẹo Chuyên Gia Trung Tín App:</strong> {tip.proTip}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
