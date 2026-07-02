import React from "react";
import { Camera, Heart, ShieldCheck } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-200">Trung Tín App</p>
            <p className="text-[11px] text-slate-500">Tối ưu hóa ảnh đăng Facebook từ iPhone không lo bị vỡ</p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Chuẩn sRGB 2048px</span>
          </span>
          <span>© 2026 Trung Tín App • All rights reserved</span>
        </div>
      </div>
    </footer>
  );
};
