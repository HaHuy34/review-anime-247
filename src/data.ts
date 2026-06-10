import { AnimeSeries } from "./types";

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
    shopeeLink: "https://s.shopee.vn/1gG50bIPVR",
    episodes: generateEmptyEpisodes(1, 153),
  },
  {
    id: "Dragon Ball Z (1989)",
    title: "Dragon Ball Z (1989)",
    vietnameseTitle: "Bảy Viên Ngọc Rồng Z",
    subtitle: "Kỷ nguyên DBZ (291 tập)",
    epCount: 5,
    orderNum: 2,
    icon: "⚡",
    badgeText: "Siêu Saiyan",
    description:
      "Goku lúc này đã trưởng thành, có con trai Son Gohan. Cậu phát hiện ra dòng máu chiến binh vũ trụ Saiyan của mình và bước vào những cuộc đại chiến tàn phá ngân hà bảo vệ Trái đất khỏi Freeza, Cell, và Majin Buu.",
    shopeeLink: "https://s.shopee.vn/70HbMQ5oaE",
    episodes: generateEmptyEpisodes(1, 0),
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
    shopeeLink: "https://s.shopee.vn/4VaGNqAb5r",
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
    shopeeLink: "https://s.shopee.vn/7KuRl3r9pZ",
    episodes: generateEmptyEpisodes(1, 64),
  },
];
