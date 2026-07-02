var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var aiClient = null;
function getAI() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new import_genai.GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "50mb" }));
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "Trung T\xEDn App" });
  });
  app.post("/api/gemini/analyze-photo", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/jpeg" } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Missing imageBase64 data" });
      }
      const ai = getAI();
      const prompt = `B\u1EA1n l\xE0 chuy\xEAn gia nhi\u1EBFp \u1EA3nh v\xE0 t\u1ED1i \u01B0u h\xF3a h\xECnh \u1EA3nh cho m\u1EA1ng x\xE3 h\u1ED9i Facebook (\u0111\u1EB7c bi\u1EC7t l\xE0 \u1EA3nh ch\u1EE5p t\u1EEB iPhone).
H\xE3y ph\xE2n t\xEDch b\u1EE9c \u1EA3nh n\xE0y d\u01B0\u1EDBi g\xF3c \u0111\u1ED9 chu\u1EA9n \u0111\u0103ng Facebook HD:
1. \u0110\xE1nh gi\xE1 \u0111\u1ED9 n\xE9t v\xE0 chi ti\u1EBFt (ch\u1EA5m \u0111i\u1EC3m t\u1EEB 0-100, v\xED d\u1EE5: 95/100 Si\xEAu n\xE9t).
2. Ki\u1EC3m tra \xE1nh s\xE1ng, m\xE0u s\u1EAFc (c\xF3 b\u1ECB t\u1ED1i, b\u1EC7t m\xE0u, hay thi\u1EBFu t\u01B0\u01A1ng ph\u1EA3n kh\xF4ng).
3. Kh\u1EA3 n\u0103ng ch\u1ED1ng b\xE3o h\xF2a/v\u1EE1 h\u1EA1t khi qua thu\u1EADt to\xE1n n\xE9n c\u1EE7a Facebook.
4. \u0110\u01B0a ra l\u1EDDi khuy\xEAn (2-3 g\u1EA1ch \u0111\u1EA7u d\xF2ng ng\u1EAFn g\u1ECDn) n\xEAn ch\u1EC9nh th\xEAm th\xF4ng s\u1ED1 g\xEC (v\xED d\u1EE5: t\u0103ng Sharpness +15%, ch\u1ECDn preset 2048px sRGB, ho\u1EB7c gi\u1EEF nguy\xEAn v\xEC \u0111\xE3 tuy\u1EC7t v\u1EDDi).

Tr\u1EA3 v\u1EC1 \u0111\u1ECBnh d\u1EA1ng JSON thu\u1EA7n theo c\u1EA5u tr\xFAc:
{
  "score": number (0-100),
  "verdict": "Si\xEAu N\xE9t (HD ready)" | "Kh\xE1 T\u1ED1t" | "C\u1EA7n T\u0103ng \u0110\u1ED9 N\xE9t" | "M\u1EDD / Thi\u1EBFu S\xE1ng",
  "summary": "\u0110\xE1nh gi\xE1 chung ng\u1EAFn g\u1ECDn 1-2 c\xE2u",
  "lighting": "Nh\u1EADn x\xE9t \xE1nh s\xE1ng & m\xE0u s\u1EAFc",
  "facebookCompressionRisk": "Th\u1EA5p" | "Trung B\xECnh" | "Cao",
  "recommendations": ["L\u1EDDi khuy\xEAn 1", "L\u1EDDi khuy\xEAn 2"]
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
                  data: imageBase64.replace(/^data:image\/\w+;base64,/, "")
                }
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          temperature: 0.3
        }
      });
      const text = response.text || "{}";
      const result = JSON.parse(text);
      res.json(result);
    } catch (error) {
      console.error("AI Analyze Error:", error);
      res.status(500).json({
        error: error?.message || "L\u1ED7i khi ph\xE2n t\xEDch \u1EA3nh AI."
      });
    }
  });
  app.post("/api/gemini/generate-caption", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/jpeg", vibe = "Sang Ch\u1EA3nh", topic = "" } = req.body;
      const ai = getAI();
      let prompt = `B\u1EA1n l\xE0 chuy\xEAn gia s\xE1ng t\u1EA1o n\u1ED9i dung viral tr\xEAn Facebook, Instagram, Thread.
H\xE3y vi\u1EBFt 3 m\u1EABu caption Facebook c\u1EF1c cu\u1ED1n, chu\u1EA9n t\u01B0\u01A1ng t\xE1c cao, ph\xF9 h\u1EE3p \u0111\u1EC3 \u0111\u0103ng k\xE8m b\u1EE9c \u1EA3nh n\xE0y.
Phong c\xE1ch mong mu\u1ED1n: "${vibe}".
${topic ? `Ch\u1EE7 \u0111\u1EC1/Ghi ch\xFA th\xEAm t\u1EEB ng\u01B0\u1EDDi d\xF9ng: "${topic}"` : ""}

C\xE1c ti\xEAu ch\xED:
- M\u1EABu 1: Ng\u1EAFn g\u1ECDn, s\xFAc t\xEDch, sang ch\u1EA3nh / ng\u1EA7u (1-2 c\xE2u ch\u1EA5t l\u1EEB).
- M\u1EABu 2: D\xE0i v\u1EEBa ph\u1EA3i, h\xE0i h\u01B0\u1EDBc / th\u1EA3 th\xEDnh ho\u1EB7c s\xE2u s\u1EAFc, c\xF3 \u0111i\u1EC3m nh\u1EA5n c\u1EA3m x\xFAc.
- M\u1EABu 3: Theo xu h\u01B0\u1EDBng (trend) ho\u1EB7c t\u01B0\u01A1ng t\xE1c cao v\u1EDBi b\u1EA1n b\xE8 (\u0111\u1EB7t c\xE2u h\u1ECFi nh\u1EB9 nh\xE0ng, check-in sang x\u1ECBn).
- K\xE8m theo 4-6 hashtag ph\xF9 h\u1EE3p (v\xED d\u1EE5: #TrungTinApp #ShotOniPhone #FacebookHD #LifeStyle ...).

Tr\u1EA3 v\u1EC1 \u0111\u1ECBnh d\u1EA1ng JSON theo c\u1EA5u tr\xFAc:
{
  "captions": [
    { "style": "T\xEAn phong c\xE1ch 1", "text": "N\u1ED9i dung b\xE0i vi\u1EBFt...", "hashtags": "#tag1 #tag2..." },
    { "style": "T\xEAn phong c\xE1ch 2", "text": "N\u1ED9i dung b\xE0i vi\u1EBFt...", "hashtags": "#tag1 #tag2..." },
    { "style": "T\xEAn phong c\xE1ch 3", "text": "N\u1ED9i dung b\xE0i vi\u1EBFt...", "hashtags": "#tag1 #tag2..." }
  ]
}`;
      const parts = [{ text: prompt }];
      if (imageBase64) {
        parts.push({
          inlineData: {
            mimeType,
            data: imageBase64.replace(/^data:image\/\w+;base64,/, "")
          }
        });
      }
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts }],
        config: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      });
      const text = response.text || "{}";
      const result = JSON.parse(text);
      res.json(result);
    } catch (error) {
      console.error("AI Caption Error:", error);
      res.status(500).json({
        error: error?.message || "L\u1ED7i khi t\u1EA1o caption AI."
      });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Trung T\xEDn App server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
