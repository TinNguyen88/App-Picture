import React from "react";
import { TabType } from "../types";
import { Zap, LayoutGrid, Sparkles, BookOpen, CheckCircle2, ShieldCheck, Camera } from "lucide-react";

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  photoCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, photoCount }) => {
  const tabs = [
    { id: "optimizer", label: "Tối Ưu & Xuất HD", icon: Zap, badge: photoCount > 0 ? `${photoCount}` : null },
    { id: "grid", label: "Ghép Grid Facebook", icon: LayoutGrid },
    { id: "ai", label: "AI Caption & Đánh Giá", icon: Sparkles, highlight: true },
    { id: "guide", label: "Bí Kíp iPhone HD", icon: BookOpen },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-md shadow-blue-500/30 border border-white/20">
              <Camera className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-300 bg-clip-text text-transparent">
                  Trung Tín App
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  PRO HD
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Đăng ảnh Facebook không bị bể từ iPhone • Chuẩn sRGB 2048px
              </p>
            </div>
          </div>

          {/* Quick Badges */}
          <div className="hidden lg:flex items-center space-x-4 text-xs font-medium text-slate-300">
            <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Chuẩn 2048px chống mờ</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Khôi phục màu sRGB iPhone</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 mt-5 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-100"
                    : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
                } ${tab.highlight && !isActive ? "border border-amber-500/40 text-amber-300" : ""}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : tab.highlight ? "text-amber-400" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-xs font-bold ${
                    isActive ? "bg-white text-blue-700" : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
