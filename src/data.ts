import { AnimeSeries } from "./types";

// Helper to generate empty arrays of episodes safely
const generateEmptyEpisodes = (start: number, end: number) => {
  return Array.from({ length: end - start + 1 }, (_, i) => ({
    name: `Tập ${start + i}`,
    src: "",
  }));
};

export const initialAnimeData: AnimeSeries[] = [
  {
    id: "Dragon Ball (1986)",
    title: "Dragon Ball (1986)",
    vietnameseTitle: "Bảy Viên Ngọc Rồng",
    subtitle: "Khởi nguyên (153 tập)",
    epCount: 153,
    orderNum: 1,
    icon: "🐉",
    badgeText: "Khởi Nguyên",
    description:
      "Hành trình thủa nhỏ của chú bé đuôi khỉ Son Goku gặp gỡ Bulma và bắt đầu cuộc phiêu lưu tìm truyền thuyết Bảy viên Ngọc Rồng thiêng liêng rải rác khắp thế giới để thực hiện điều ước.",
    shopeeLink: "https://s.shopee.vn/5q5fZ2j4K8",
    episodes: generateEmptyEpisodes(1, 153),
  },
  {
    id: "Dragon Ball Z (1989)",
    title: "Dragon Ball Z (1989)",
    vietnameseTitle: "Bảy Viên Ngọc Rồng Z",
    subtitle: "Kỷ nguyên DBZ (291 tập)",
    epCount: 291,
    orderNum: 2,
    icon: "⚡",
    badgeText: "Siêu Saiyan",
    description:
      "Goku lúc này đã trưởng thành, có con trai Son Gohan. Cậu phát hiện ra dòng máu chiến binh vũ trụ Saiyan của mình và bước vào những cuộc đại chiến tàn phá ngân hà bảo vệ Trái đất khỏi Freeza, Cell, và Majin Buu.",
    shopeeLink: "https://s.shopee.vn/5fmFMl1AnK",
    episodes: [
      // Episodes with real dailymotion sources from your main.js
      {
        name: "Tập 136",
        src: "https://www.dailymotion.com/embed/video/k5cRz1VQSNtbPXGvJqS",
      },
      {
        name: "Tập 137",
        src: "https://www.dailymotion.com/embed/video/k5VVLvT6xuW6G2GvJqO",
      },
      {
        name: "Tập 138",
        src: "https://www.dailymotion.com/embed/video/k4NkW9BLmNnnf6GvOls",
      },
      {
        name: "Tập 139",
        src: "https://www.dailymotion.com/embed/video/k6T7DGiiS7nZR7Gwpro",
      },
      {
        name: "Tập 140",
        src: "https://www.dailymotion.com/embed/video/k5MBxrWM2tZAoLGwprs",
      },
      {
        name: "Tập 141",
        src: "https://www.dailymotion.com/embed/video/k11XDJI1Q9nbMUGwprk",
      },
      {
        name: "Tập 142",
        src: "https://www.dailymotion.com/embed/video/k1l4MRTK8Ud7vlGwprg",
      },
      {
        name: "Tập 143",
        src: "https://www.dailymotion.com/embed/video/k7H0Cbi2Ar54iAGwprc",
      },
      {
        name: "Tập 144",
        src: "https://www.dailymotion.com/embed/video/k3iSV7aElDLBdvGwp9Q",
      },
      {
        name: "Tập 145",
        src: "https://www.dailymotion.com/embed/video/k5MZ65YYaGpTvqGwp9M",
      },
      {
        name: "Tập 146",
        src: "https://www.dailymotion.com/embed/video/k1agXi0MNXphVTGwp9I",
      },
      // Other episodes generated dynamically
      ...generateEmptyEpisodes(1, 135),
      ...generateEmptyEpisodes(147, 291),
    ].sort((a, b) => {
      const numA = parseInt(a.name.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.name.replace(/\D/g, "")) || 0;
      return numA - numB;
    }),
  },
  {
    id: "Dragon Ball Super (2015)",
    title: "Dragon Ball Super (2015)",
    vietnameseTitle: "Bảy Viên Ngọc Rồng Siêu Cấp",
    subtitle: "Kỷ nguyên Thần (131 tập)",
    epCount: 131,
    orderNum: 3,
    icon: "🪐",
    badgeText: "Bản Năng Vô Cực",
    description:
      "Sau khi Majin Buu bị đánh bại, hòa bình lập lại. Goku chạm trán với Thần Hủy Diệt Beerus và mở ra kỷ nguyên sức mạnh siêu việt của Thần Thánh, tham gia Giải Đấu Sức Mạnh giữa các vũ trụ.",
    shopeeLink: "https://s.shopee.vn/5fmFMl1AnK",
    episodes: generateEmptyEpisodes(1, 131),
  },
  {
    id: "Dragon Ball GT / Daima",
    title: "Dragon Ball GT / Daima",
    vietnameseTitle: "Dragon Ball GT / Daima",
    subtitle: "Ngoại truyện / Hậu truyện",
    epCount: 64,
    orderNum: 4,
    icon: "🌌",
    badgeText: "Hậu Truyện",
    description:
      "Thế giới ngoại truyện GT mang phong cách phiêu lưu cổ điển kết hợp Super Saiyan 4 đỉnh cao, cùng dự án mới nhất Daima nơi Goku bị biến nhỏ lại bởi âm mưu phép thuật.",
    shopeeLink: "https://s.shopee.vn/5q5fZ2j4K8",
    episodes: generateEmptyEpisodes(1, 64),
  },
];
