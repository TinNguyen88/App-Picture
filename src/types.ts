export type TabType = "optimizer" | "grid" | "ai" | "guide";

export type PresetType = "fb_feed_2048" | "fb_story_9_16" | "fb_avatar_sq" | "fb_cover" | "original_hd";

export interface PhotoSettings {
  preset: PresetType;
  sharpen: number; // 0 to 100 (%)
  vibrance: number; // -50 to +50
  contrast: number; // -50 to +50
  format: "image/jpeg" | "image/png";
  quality: number; // 0.8 to 1.0 (default 0.98)
  watermark: boolean;
  watermarkText: string;
  watermarkPosition: "bottom-right" | "bottom-left" | "center";
}

export interface PhotoItem {
  id: string;
  file: File;
  name: string;
  originalUrl: string;
  originalWidth: number;
  originalHeight: number;
  originalSize: number; // bytes
  optimizedUrl: string;
  optimizedWidth: number;
  optimizedHeight: number;
  optimizedSize: number; // bytes
  status: "idle" | "processing" | "done" | "error";
  error?: string;
  aiAnalysis?: AIPhotoAnalysis;
}

export interface AIPhotoAnalysis {
  score: number;
  verdict: "Siêu Nét (HD ready)" | "Khá Tốt" | "Cần Tăng Độ Nét" | "Mờ / Thiếu Sáng";
  summary: string;
  lighting: string;
  facebookCompressionRisk: "Thấp" | "Trung Bình" | "Cao";
  recommendations: string[];
}

export interface AICaptionItem {
  style: string;
  text: string;
  hashtags: string;
}

export interface AICaptionResponse {
  captions: AICaptionItem[];
}
