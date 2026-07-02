import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "Trung Tín App" });
  });

  // AI analyze photo quality for Facebook
  app.post("/api/gemini/analyze-photo", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/jpeg" } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Missing imageBase64 data" });
      }

      const ai = getAI();
      const prompt = `Bạn là chuyên gia nhiếp ảnh và tối ưu hóa hình ảnh cho mạng xã hội Facebook (đặc biệt là ảnh chụp từ iPhone).
Hãy phân tích bức ảnh này dưới góc độ chuẩn đăng Facebook HD:
1. Đánh giá độ nét và chi tiết (chấm điểm từ 0-100, ví dụ: 95/100 Siêu nét).
2. Kiểm tra ánh sáng, màu sắc (có bị tối, bệt màu, hay thiếu tương phản không).
3. Khả năng chống bão hòa/vỡ hạt khi qua thuật toán nén của Facebook.
4. Đưa ra lời khuyên (2-3 gạch đầu dòng ngắn gọn) nên chỉnh thêm thông số gì (ví dụ: tăng Sharpness +15%, chọn preset 2048px sRGB, hoặc giữ nguyên vì đã tuyệt vời).

Trả về định dạng JSON thuần theo cấu trúc:
{
  "score": number (0-100),
  "verdict": "Siêu Nét (HD ready)" | "Khá Tốt" | "Cần Tăng Độ Nét" | "Mờ / Thiếu Sáng",
  "summary": "Đánh giá chung ngắn gọn 1-2 câu",
  "lighting": "Nhận xét ánh sáng & màu sắc",
  "facebookCompressionRisk": "Thấp" | "Trung Bình" | "Cao",
  "recommendations": ["Lời khuyên 1", "Lời khuyên 2"]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const text = response.text || "{}";
      const result = JSON.parse(text);
      res.json(result);
    } catch (error: any) {
      console.error("AI Analyze Error:", error);
      res.status(500).json({
        error: error?.message || "Lỗi khi phân tích ảnh AI.",
      });
    }
  });

  // AI generate viral Facebook caption
  app.post("/api/gemini/generate-caption", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/jpeg", vibe = "Sang Chảnh", topic = "" } = req.body;

      const ai = getAI();
      let prompt = `Bạn là chuyên gia sáng tạo nội dung viral trên Facebook, Instagram, Thread.
Hãy viết 3 mẫu caption Facebook cực cuốn, chuẩn tương tác cao, phù hợp để đăng kèm bức ảnh này.
Phong cách mong muốn: "${vibe}".
${topic ? `Chủ đề/Ghi chú thêm từ người dùng: "${topic}"` : ""}

Các tiêu chí:
- Mẫu 1: Ngắn gọn, súc tích, sang chảnh / ngầu (1-2 câu chất lừ).
- Mẫu 2: Dài vừa phải, hài hước / thả thính hoặc sâu sắc, có điểm nhấn cảm xúc.
- Mẫu 3: Theo xu hướng (trend) hoặc tương tác cao với bạn bè (đặt câu hỏi nhẹ nhàng, check-in sang xịn).
- Kèm theo 4-6 hashtag phù hợp (ví dụ: #TrungTinApp #ShotOniPhone #FacebookHD #LifeStyle ...).

Trả về định dạng JSON theo cấu trúc:
{
  "captions": [
    { "style": "Tên phong cách 1", "text": "Nội dung bài viết...", "hashtags": "#tag1 #tag2..." },
    { "style": "Tên phong cách 2", "text": "Nội dung bài viết...", "hashtags": "#tag1 #tag2..." },
    { "style": "Tên phong cách 3", "text": "Nội dung bài viết...", "hashtags": "#tag1 #tag2..." }
  ]
}`;

      const parts: any[] = [{ text: prompt }];
      if (imageBase64) {
        parts.push({
          inlineData: {
            mimeType,
            data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
          },
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts }],
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const text = response.text || "{}";
      const result = JSON.parse(text);
      res.json(result);
    } catch (error: any) {
      console.error("AI Caption Error:", error);
      res.status(500).json({
        error: error?.message || "Lỗi khi tạo caption AI.",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Trung Tín App server running on http://localhost:${PORT}`);
  });
}

startServer();
