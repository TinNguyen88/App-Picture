export interface FBSecretTip {
  id: string;
  title: string;
  badge: string;
  icon: string; // lucide icon name
  description: string;
  steps: string[];
  proTip: string;
}

export const FB_SECRET_TIPS: FBSecretTip[] = [
  {
    id: "tip-1",
    title: "Quy Tắc Vàng 2048px (Độ Phân Giải Tối Ưu Của Facebook)",
    badge: "Quan Trọng Nhất",
    icon: "Maximize2",
    description: "Tại sao ảnh chụp 48MP từ iPhone 15/16 Pro Max đăng lên Facebook vẫn bị vỡ hạt, nhòe mờ?",
    steps: [
      "Facebook có thuật toán nén cực mạnh: Bất kỳ ảnh nào có cạnh dài vượt quá 2048px sẽ bị thuật toán tự động bẻ nhỏ (downscale) với bộ lọc nén chất lượng thấp.",
      "Khi bạn chủ động chọn Preset 'Facebook Feed HD (2048px)' trên Trung Tín App, ảnh được thu nhỏ bằng thuật toán Lanczos chất lượng cao và giữ nguyên chi tiết.",
      "Kết quả: Facebook nhận đúng kích thước 2048px nên KHÔNG áp dụng thêm bước nén phá hủy nào nữa!"
    ],
    proTip: "Luôn chọn preset 2048px cho bài đăng thông thường trên dòng thời gian hoặc hội nhóm!"
  },
  {
    id: "tip-2",
    title: "Bật Tính Năng 'Tải Ảnh HD' Ẩn Trong App Facebook iPhone",
    badge: "Cài Đặt Bắt Buộc",
    icon: "Smartphone",
    description: "Mặc định Facebook trên iOS thường bị bật chế độ tiết kiệm dữ liệu di động 4G/5G.",
    steps: [
      "Bước 1: Mở ứng dụng Facebook trên iPhone ➔ Chọn Menu (3 gạch dưới cùng bên phải) ➔ Cài đặt & quyền riêng tư ➔ Cài đặt.",
      "Bước 2: Cuộn xuống mục 'File phương tiện' (Media) hoặc 'Chất lượng ảnh và video'.",
      "Bước 3: TẮT mục 'Trình tiết kiệm dữ liệu' (Data Saver) và BẬT 'Tối ưu hóa' (Optimized).",
      "Bước 4: Bật tùy chọn 'Tải ảnh lên ở dạng HD' (nếu có trong phiên bản iOS của bạn)."
    ],
    proTip: "Khuyên dùng Wifi khi tải ảnh album nhiều hình để tránh Facebook tự giảm bit-rate qua mạng 4G yếu."
  },
  {
    id: "tip-3",
    title: "Không Chụp HEIC Khi Định Đăng Ngay Lên Mạng Xã Hội",
    badge: "Mẹo Camera iPhone",
    icon: "Camera",
    description: "Định dạng ảnh HEIC (Hiệu suất cao) của Apple rất tốt để lưu trữ, nhưng khi tải lên web/Facebook dễ bị sai lệch màu sRGB.",
    steps: [
      "Vào Cài đặt iPhone ➔ Camera ➔ Định dạng (Formats).",
      "Chọn 'Tương thích nhất' (Most Compatible - lưu dạng JPEG) nếu bạn là người thường xuyên chụp ảnh để đăng social.",
      "Nếu đang có ảnh HEIC: Trung Tín App tự động giải mã và chuyển đổi chuẩn sang sRGB JPEG/PNG 98% mà không lệch màu!"
    ],
    proTip: "Với ảnh có nhiều chữ (chụp màn hình, infographic), hãy chọn xuất định dạng PNG HD trên ứng dụng này!"
  },
  {
    id: "tip-4",
    title: "Bí Kíp 'Dán Trực Tiếp' (Paste) Siêu Nét Không Qua Thư Viện",
    badge: "Độc Quyền Trung Tín",
    icon: "ClipboardCheck",
    description: "Thay vì lưu về thư viện ảnh (Photos) rồi mới mở Facebook chọn ảnh, hãy dùng tính năng Dán!",
    steps: [
      "Sau khi tối ưu ảnh trên Trung Tín App, bấm nút '📋 Sao chép vào Clipboard'.",
      "Mở ứng dụng Facebook ➔ Bấm vào ô 'Bạn đang nghĩ gì?' (Tạo bài viết mới).",
      "Chạm giữ vào ô trống và chọn 'Dán' (Paste).",
      "Ảnh HD đã được chèn thẳng vào bài viết với độ nét 100%, không bị ảnh hưởng bởi bộ nhớ đệm máy!"
    ],
    proTip: "Tính năng này hoạt động cực nhạy trên iOS Safari và macOS Chrome!"
  }
];
