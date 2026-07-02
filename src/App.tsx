import React, { useState, useEffect, useCallback } from "react";
import { TabType, PhotoItem, PhotoSettings, AIPhotoAnalysis } from "./types";
import { processPhoto } from "./utils/photoProcessor";
import { Header } from "./components/Header";
import { PhotoOptimizer } from "./components/PhotoOptimizer";
import { GridMaker } from "./components/GridMaker";
import { AIAssistant } from "./components/AIAssistant";
import { SecretGuide } from "./components/SecretGuide";
import { Footer } from "./components/Footer";
import { motion, AnimatePresence } from "motion/react";

const DEMO_PHOTO_URL = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=2000&q=80";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("optimizer");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [selectedPhotoIdForAI, setSelectedPhotoIdForAI] = useState<string | null>(null);
  const [isLoadingDemo, setIsLoadingDemo] = useState<boolean>(true);

  const [settings, setSettings] = useState<PhotoSettings>({
    preset: "fb_feed_2048",
    sharpen: 15, // default 15% sharpness boost for FB
    vibrance: 5,
    contrast: 2,
    format: "image/jpeg",
    quality: 0.98,
    watermark: false,
    watermarkText: "Shot on iPhone 16 Pro Max • Trung Tín App",
    watermarkPosition: "bottom-right",
  });

  // Load demo photo on initial startup
  useEffect(() => {
    let mounted = true;
    const loadDemo = async () => {
      try {
        const response = await fetch(DEMO_PHOTO_URL);
        const blob = await response.blob();
        if (!mounted) return;

        const originalUrl = URL.createObjectURL(blob);
        const file = new File([blob], "iPhone_Portrait_Demo.jpg", { type: blob.type });

        const initialItem: PhotoItem = {
          id: "demo-1",
          file,
          name: "iPhone_Portrait_Demo.jpg",
          originalUrl,
          originalWidth: 2000,
          originalHeight: 2500,
          originalSize: blob.size,
          optimizedUrl: originalUrl,
          optimizedWidth: 2000,
          optimizedHeight: 2500,
          optimizedSize: blob.size,
          status: "processing",
          aiAnalysis: {
            score: 96,
            verdict: "Siêu Nét (HD ready)",
            summary: "Bức ảnh chân dung đủ sáng, chi tiết tóc và da cực nét, hoàn hảo cho thuật toán HD của Facebook.",
            lighting: "Ánh sáng tự nhiên mềm mại, tương phản rất tốt, màu da trung thực sRGB.",
            facebookCompressionRisk: "Thấp",
            recommendations: [
              "Giữ nguyên preset 2048px và độ nét +15% để tránh Facebook làm mờ khi tải lên từ iPhone.",
              "Nếu đăng story, chuyển sang chế độ 9:16 để có bố cục toàn màn hình ấn tượng."
            ]
          }
        };

        const processed = await processPhoto(initialItem, settings);
        if (mounted) {
          setPhotos([processed]);
          setSelectedPhotoIdForAI(processed.id);
          setIsLoadingDemo(false);
        }
      } catch (err) {
        console.error("Failed to load demo photo:", err);
        if (mounted) setIsLoadingDemo(false);
      }
    };

    loadDemo();
    return () => {
      mounted = false;
    };
  }, []);

  // Reprocess all photos when settings change
  const reprocessAll = useCallback(
    async (newSettings: PhotoSettings, currentPhotos: PhotoItem[]) => {
      const updated = await Promise.all(
        currentPhotos.map(async (item) => {
          return await processPhoto({ ...item, status: "processing" }, newSettings);
        })
      );
      setPhotos(updated);
    },
    []
  );

  const handleUpdateSettings = (partial: Partial<PhotoSettings>) => {
    const nextSettings = { ...settings, ...partial };
    setSettings(nextSettings);
    reprocessAll(nextSettings, photos);
  };

  const handleUploadFiles = async (fileList: FileList) => {
    const newItems: PhotoItem[] = [];

    for (let i = 0; i < Math.min(fileList.length, 10); i++) {
      const file = fileList[i];
      if (!file.type.startsWith("image/") && !file.name.toLowerCase().endsWith(".heic") && !file.name.toLowerCase().endsWith(".heif")) {
        continue;
      }

      const originalUrl = URL.createObjectURL(file);
      const id = `photo-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`;

      // Get natural dimensions
      const img = new Image();
      img.src = originalUrl;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });

      const item: PhotoItem = {
        id,
        file,
        name: file.name,
        originalUrl,
        originalWidth: img.naturalWidth || 2048,
        originalHeight: img.naturalHeight || 2048,
        originalSize: file.size,
        optimizedUrl: originalUrl,
        optimizedWidth: img.naturalWidth || 2048,
        optimizedHeight: img.naturalHeight || 2048,
        optimizedSize: file.size,
        status: "processing",
      };

      newItems.push(item);
    }

    if (newItems.length > 0) {
      const combined = [...photos, ...newItems];
      setPhotos(combined);
      if (!selectedPhotoIdForAI && combined.length > 0) {
        setSelectedPhotoIdForAI(combined[0].id);
      }
      reprocessAll(settings, combined);
    }
  };

  const handleRemovePhoto = (id: string) => {
    const next = photos.filter((p) => p.id !== id);
    setPhotos(next);
    if (selectedPhotoIdForAI === id) {
      setSelectedPhotoIdForAI(next.length > 0 ? next[0].id : null);
    }
  };

  const handleClearAll = () => {
    setPhotos([]);
    setSelectedPhotoIdForAI(null);
  };

  const handleUpdatePhotoAI = (id: string, analysis: AIPhotoAnalysis) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, aiAnalysis: analysis } : p))
    );
  };

  const handleSelectForAI = (item: PhotoItem) => {
    setSelectedPhotoIdForAI(item.id);
    setActiveTab("ai");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-blue-500 selection:text-white">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} photoCount={photos.length} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoadingDemo && photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-blue-500/30" />
            <p className="text-sm font-medium text-slate-300">Đang khởi tạo Trung Tín App & Tải ảnh mẫu HD...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {activeTab === "optimizer" && (
                <PhotoOptimizer
                  photos={photos}
                  onUpload={handleUploadFiles}
                  onRemovePhoto={handleRemovePhoto}
                  onClearAll={handleClearAll}
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onSelectForAI={handleSelectForAI}
                />
              )}

              {activeTab === "grid" && (
                <GridMaker photos={photos} onUpload={handleUploadFiles} />
              )}

              {activeTab === "ai" && (
                <AIAssistant
                  photos={photos}
                  selectedPhotoId={selectedPhotoIdForAI}
                  onSelectPhoto={setSelectedPhotoIdForAI}
                  onUpload={handleUploadFiles}
                  onUpdatePhotoAI={handleUpdatePhotoAI}
                />
              )}

              {activeTab === "guide" && <SecretGuide />}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <Footer />
    </div>
  );
}
