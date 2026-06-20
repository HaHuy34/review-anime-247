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
    vietnameseTitle: "Dragon Ball (1986)",
    subtitle: "Khởi nguyên (153 tập)",
    epCount: 153,
    orderNum: 1,
    icon: "🐉",
    badgeText: "Khởi Nguyên",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKc_l_YzpqGTc_jqI9GYDlRE3yHkUDH2pvqA&s",
    description:
      "Hành trình thủa nhỏ của chú bé đuôi khỉ Son Goku gặp gỡ Bulma và bắt đầu cuộc phiêu lưu tìm truyền thuyết Bảy viên Ngọc Rồng thiêng liêng rải rác khắp thế giới để thực hiện điều ước.",
    shopeeLink: "https://s.shopee.vn/1gG50bIPVR",
    episodes: generateEmptyEpisodes(1, 153),
  },
  {
    id: "Dragon Ball Z (1989)",
    title: "Dragon Ball Z (1989)",
    vietnameseTitle: "Dragon Ball Z (1989)",
    subtitle: "Kỷ nguyên DBZ (Tập 99 -> Tập 167)",
    epCount: 167,
    orderNum: 2,
    icon: "⚡",
    badgeText: "Siêu Saiyan",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBKT8DeWgpmcrYnhTqEoSLxAQaJnS16RL4IQ&s",
    description:
      "Goku lúc này đã trưởng thành, có con trai Son Gohan. Cậu phát hiện ra dòng máu chiến binh vũ trụ Saiyan của mình và bước vào những cuộc đại chiến tàn phá ngân hà bảo vệ Trái đất khỏi Freeza, Cell, và Majin Buu.",
    shopeeLink: "https://s.shopee.vn/70HbMQ5oaE",
    episodes: generateEmptyEpisodes(145, 167),
  },
  {
    id: "Dragon Ball Daima",
    title: "Dragon Ball Daima",
    vietnameseTitle: "Dragon Ball Daima",
    subtitle: "Cuộc phiêu lưu mới (20 tập)",
    epCount: 20,
    orderNum: 6,
    icon: "🌟",
    badgeText: "Mới nhất",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQFvSr_G0A86xHQnftQEvhN1mX39wp6C0geA&s",
    description:
      "Sau một âm mưu bí ẩn, Goku cùng các đồng đội bị biến thành trẻ nhỏ. Họ phải khám phá Ma Giới để tìm cách trở lại bình thường, đối đầu với những kẻ thù mới và khám phá những bí mật chưa từng được tiết lộ trong thế giới Dragon Ball.",
    shopeeLink: "https://s.shopee.vn/70HbMQ5oaE",
    episodes: generateEmptyEpisodes(1, 20),
  },

  {
    id: "Dragon Ball Super (2015)",
    title: "Dragon Ball Super (2015)",
    vietnameseTitle: "Dragon Ball Super (2015)",
    subtitle: "Kỷ nguyên Thần (131 tập)",
    epCount: 131,
    orderNum: 3,
    icon: "🪐",
    badgeText: "Bản Năng Vô Cực",
    image:
      "https://static0.cbrimages.com/wordpress/wp-content/uploads/spinoff/2015/06/dragon-ball-super-facebook.jpg?w=1200&h=628&fit=crop",
    description:
      "Sau khi Majin Buu bị đánh bại, hòa bình lập lại. Goku chạm trán với Thần Hủy Diệt Beerus và mở ra kỷ nguyên sức mạnh siêu việt của Thần Thánh, tham gia Giải Đấu Sức Mạnh giữa các vũ trụ.",
    shopeeLink: "https://s.shopee.vn/4VaGNqAb5r",
    episodes: generateEmptyEpisodes(1, 131),
  },
  {
    id: "Dragon Ball Super: Broly",
    title: "Dragon Ball Super: Broly",
    vietnameseTitle: "Dragon Ball Super: Broly",
    subtitle: "Movie Canon",
    epCount: 1,
    orderNum: 4,
    icon: "🎬",
    badgeText: "Movie",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzpBLvo9cHEVsDhiLpKeZtjBK06-oOYdz4Cw&s",
    description:
      "Goku và Vegeta đối đầu với Broly, một Saiyan sở hữu sức mạnh vượt xa mọi giới hạn. Bộ phim mở rộng nguồn gốc của người Saiyan và được xem là một phần chính thức của cốt truyện Dragon Ball Super.",
    shopeeLink: "https://s.shopee.vn/70HbMQ5oaE",
    episodes: [{ name: "Movie", src: "" }],
  },
  {
    id: "Dragon Ball Super: Super Hero",
    title: "Dragon Ball Super: Super Hero",
    vietnameseTitle: "Dragon Ball Super: Super Hero",
    subtitle: "Movie Canon",
    epCount: 1,
    orderNum: 5,
    icon: "🎥",
    badgeText: "Movie",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCSQryZZaB-v-xUEz38lh1J1H-M_LiHBA-rg&s",
    description:
      "Tổ chức Red Ribbon hồi sinh với những Android mới. Lần này Piccolo và Gohan trở thành trung tâm của câu chuyện trong cuộc chiến bảo vệ Trái Đất.",
    shopeeLink: "https://s.shopee.vn/70HbMQ5oaE",
    episodes: [{ name: "Movie", src: "" }],
  },
  {
    id: "Dragon Ball GT",
    title: "Dragon Ball GT",
    vietnameseTitle: "Dragon Ball GT",
    subtitle: "Ngoại truyện (64 tập)",
    epCount: 64,
    orderNum: 7,
    icon: "🚀",
    badgeText: "Ngoại truyện",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaSRUQl3j1a2eSarL1RFh3WqCiBpWpxoL-jw&s",
    description:
      "Goku một lần nữa bị biến thành trẻ nhỏ và bắt đầu hành trình xuyên thiên hà tìm kiếm Ngọc Rồng Hắc Tinh. GT không thuộc dòng thời gian chính thức hiện tại nhưng vẫn được yêu thích nhờ Super Saiyan 4.",
    shopeeLink: "https://s.shopee.vn/70HbMQ5oaE",
    episodes: generateEmptyEpisodes(1, 64),
  },
];
