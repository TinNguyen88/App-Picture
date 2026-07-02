import { PhotoItem, PhotoSettings, PresetType } from "../types";

// Helper to load image from url/blob
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error("Không thể tải hình ảnh: " + err));
    img.src = url;
  });
}

// Calculate target dimensions based on preset
export function calculateDimensions(
  origW: number,
  origH: number,
  preset: PresetType
): { width: number; height: number; crop?: boolean; cropX?: number; cropY?: number; cropW?: number; cropH?: number } {
  const aspect = origW / origH;

  switch (preset) {
    case "fb_feed_2048": {
      // Facebook standard HD: longest edge is 2048px
      const maxEdge = 2048;
      if (origW <= maxEdge && origH <= maxEdge) {
        return { width: origW, height: origH };
      }
      if (origW > origH) {
        return { width: maxEdge, height: Math.round(maxEdge / aspect) };
      } else {
        return { width: Math.round(maxEdge * aspect), height: maxEdge };
      }
    }
    case "fb_story_9_16": {
      // Story / Reels HD: 1152 x 2048 (9:16)
      const targetW = 1152;
      const targetH = 2048;
      const targetAspect = targetW / targetH;
      
      let cropW = origW;
      let cropH = origH;
      let cropX = 0;
      let cropY = 0;

      if (aspect > targetAspect) {
        // Image is wider than 9:16, crop sides
        cropW = Math.round(origH * targetAspect);
        cropX = Math.round((origW - cropW) / 2);
      } else {
        // Image is taller, crop top/bottom
        cropH = Math.round(origW / targetAspect);
        cropY = Math.round((origH - cropH) / 2);
      }
      return { width: targetW, height: targetH, crop: true, cropX, cropY, cropW, cropH };
    }
    case "fb_avatar_sq": {
      // Square Avatar HD: 2048 x 2048
      const size = 2048;
      const minEdge = Math.min(origW, origH);
      const cropX = Math.round((origW - minEdge) / 2);
      const cropY = Math.round((origH - minEdge) / 2);
      return { width: size, height: size, crop: true, cropX, cropY, cropW: minEdge, cropH: minEdge };
    }
    case "fb_cover": {
      // Fanpage / Profile Cover HD: 2048 x 780 (~21:8 aspect)
      const targetW = 2048;
      const targetH = 780;
      const targetAspect = targetW / targetH;
      
      let cropW = origW;
      let cropH = origH;
      let cropX = 0;
      let cropY = 0;

      if (aspect > targetAspect) {
        cropW = Math.round(origH * targetAspect);
        cropX = Math.round((origW - cropW) / 2);
      } else {
        cropH = Math.round(origW / targetAspect);
        cropY = Math.round((origH - cropH) / 2);
      }
      return { width: targetW, height: targetH, crop: true, cropX, cropY, cropW, cropH };
    }
    case "original_hd":
    default: {
      // Limit to 4096px max for safety
      const maxLimit = 4096;
      if (origW > maxLimit || origH > maxLimit) {
        if (origW > origH) {
          return { width: maxLimit, height: Math.round(maxLimit / aspect) };
        } else {
          return { width: Math.round(maxLimit * aspect), height: maxLimit };
        }
      }
      return { width: origW, height: origH };
    }
  }
}

// Apply unsharp mask sharpening (simple 3x3 convolution for web crispness)
function applySharpening(ctx: CanvasRenderingContext2D, width: number, height: number, amount: number) {
  if (amount <= 0) return;
  
  // amount from 0 to 100 -> strength 0 to 0.8
  const strength = (amount / 100) * 0.75;
  
  try {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const w = width;
    const h = height;
    
    // We create a copy of data to read neighbors
    const copy = new Uint8ClampedArray(data);
    
    // Simple high-pass edge crisping
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4;
        
        // Center pixel - average of top, bottom, left, right
        for (let c = 0; c < 3; c++) {
          const val = copy[idx + c];
          const top = copy[((y - 1) * w + x) * 4 + c];
          const bottom = copy[((y + 1) * w + x) * 4 + c];
          const left = copy[(y * w + (x - 1)) * 4 + c];
          const right = copy[(y * w + (x + 1)) * 4 + c];
          
          const blur = (top + bottom + left + right) / 4;
          const diff = val - blur;
          
          // Apply sharpened value
          data[idx + c] = Math.min(255, Math.max(0, val + diff * strength * 2.5));
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
  } catch (e) {
    console.warn("Could not apply sharpening imageData filter:", e);
  }
}

// Process single photo with canvas
export async function processPhoto(item: PhotoItem, settings: PhotoSettings): Promise<PhotoItem> {
  try {
    const img = await loadImage(item.originalUrl);
    const dims = calculateDimensions(img.naturalWidth, img.naturalHeight, settings.preset);
    
    const canvas = document.createElement("canvas");
    canvas.width = dims.width;
    canvas.height = dims.height;
    const ctx = canvas.getContext("2d", { colorSpace: "srgb" });
    
    if (!ctx) {
      throw new Error("Trình duyệt không hỗ trợ Canvas sRGB context.");
    }
    
    // Smooth image smoothing for high quality downscaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Apply color filters (contrast & vibrance/saturation)
    const contrastVal = 100 + settings.contrast; // e.g. 100% is normal
    const saturateVal = 100 + settings.vibrance; // e.g. 100% is normal
    ctx.filter = `contrast(${contrastVal}%) saturate(${saturateVal}%)`;

    // Draw image
    if (dims.crop && dims.cropW && dims.cropH) {
      ctx.drawImage(img, dims.cropX!, dims.cropY!, dims.cropW, dims.cropH, 0, 0, dims.width, dims.height);
    } else {
      ctx.drawImage(img, 0, 0, dims.width, dims.height);
    }

    // Reset filter before pixel manipulation / text drawing
    ctx.filter = "none";

    // Apply smart sharpening if requested
    if (settings.sharpen > 0) {
      applySharpening(ctx, dims.width, dims.height, settings.sharpen);
    }

    // Draw Watermark if enabled
    if (settings.watermark && settings.watermarkText) {
      const fontSize = Math.max(24, Math.round(dims.width * 0.024));
      ctx.font = `600 ${fontSize}px 'Inter', sans-serif, system-ui`;
      
      const text = settings.watermarkText;
      const metrics = ctx.measureText(text);
      const paddingX = Math.round(fontSize * 0.7);
      const paddingY = Math.round(fontSize * 0.45);
      const boxW = metrics.width + paddingX * 2;
      const boxH = fontSize + paddingY * 2;

      let x = dims.width - boxW - fontSize;
      let y = dims.height - boxH - fontSize;

      if (settings.watermarkPosition === "bottom-left") {
        x = fontSize;
      } else if (settings.watermarkPosition === "center") {
        x = (dims.width - boxW) / 2;
        y = (dims.height - boxH) / 2;
      }

      // Draw semi-transparent dark badge background
      ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
      ctx.beginPath();
      ctx.roundRect(x, y, boxW, boxH, Math.round(fontSize * 0.4));
      ctx.fill();

      // Draw crisp white text
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "middle";
      ctx.fillText(text, x + paddingX, y + boxH / 2 + Math.round(fontSize * 0.05));
    }

    // Export to Blob/DataURL
    const mime = settings.format;
    const quality = mime === "image/png" ? undefined : settings.quality;
    
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, mime, quality));
    if (!blob) {
      throw new Error("Lỗi khi xuất hình ảnh từ Canvas.");
    }

    const optimizedUrl = URL.createObjectURL(blob);

    return {
      ...item,
      optimizedUrl,
      optimizedWidth: dims.width,
      optimizedHeight: dims.height,
      optimizedSize: blob.size,
      status: "done",
    };
  } catch (err: any) {
    console.error("Error processing photo:", err);
    return {
      ...item,
      status: "error",
      error: err?.message || "Lỗi xử lý ảnh",
    };
  }
}

// Copy image blob to clipboard (for instant paste to Facebook app)
export async function copyPhotoToClipboard(url: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    const blob = await response.status === 200 ? await response.blob() : null;
    if (!blob) return false;

    // Clipboard API requires PNG on many browsers for images
    let clipboardBlob = blob;
    if (blob.type !== "image/png") {
      const img = await loadImage(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      clipboardBlob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b || blob), "image/png")) || blob;
    }

    const item = new ClipboardItem({ [clipboardBlob.type]: clipboardBlob });
    await navigator.clipboard.write([item]);
    return true;
  } catch (e) {
    console.error("Clipboard copy error:", e);
    return false;
  }
}

// Format bytes to human readable string
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
