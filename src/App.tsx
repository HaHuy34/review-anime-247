"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Sun,
  Moon,
  Facebook,
  ArrowLeft,
  Tv,
  Play,
  CheckCircle,
  X,
  ChevronUp,
  Sparkles,
  ExternalLink,
  Lock,
  LockOpen,
  ChevronDown,
} from "lucide-react";

import { initialAnimeData } from "@/src/data";
import { AnimeSeries } from "@/src/types";
import VideoModal from "@/src/components/VideoModal";
import TrackingProvider from "./components/TrackingProvider";
import { trackProductClick } from "./services/trackingService";
import { motion } from "motion/react";

function UnlockModal({
  theme,
  products,
  onUnlock,
  onClose,
  handleProductClick,
}: {
  theme: "dark" | "light";
  products: any[];
  onUnlock: () => void;
  onClose: () => void;
  handleProductClick: (p: any) => void;
}) {
  const [skipTimer, setSkipTimer] = useState(30);
  const [unlockTimer, setUnlockTimer] = useState<number | null>(null);

  useEffect(() => {
    let int: any;
    if (unlockTimer === null) {
      if (skipTimer > 0) {
        int = setInterval(() => {
          setSkipTimer((prev) => Math.max(0, prev - 1));
        }, 1000);
      }
    } else {
      int = setInterval(() => {
        setUnlockTimer((prev) => {
          if (prev !== null && prev <= 1) {
            onUnlock();
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
    }
    return () => clearInterval(int);
  }, [unlockTimer, skipTimer, onUnlock]);

  const onProductClick = (p: any) => {
    handleProductClick(p);
    setUnlockTimer(5);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className={`relative w-full max-w-lg rounded-3xl p-6 shadow-2xl border flex flex-col items-center text-center ${theme === "dark" ? "bg-[#13131c] border-white/10 text-white" : "bg-white border-black/10 text-slate-800"}`}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 rounded-full cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-display text-xl sm:text-2xl font-black mb-2 text-amber-500">
          MỞ KHÓA TOÀN BỘ TẬP MỚI NHẤT!
        </h2>
        <p className="text-sm opacity-80 mb-6">
          Xem 1 sản phẩm để mở khóa toàn bộ video hôm nay.
        </p>

        {unlockTimer !== null ? (
          <div className="py-8 flex flex-col items-center justify-center min-h-[160px]">
            <p className="text-5xl font-display font-black text-amber-500 animate-pulse">
              {unlockTimer}s
            </p>
            <p className="text-sm mt-3 opacity-80 font-medium">
              Đang xác nhận ủng hộ...
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6 w-full">
              {products.slice(0, 4).map((product) => (
                <a
                  key={product.id}
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onProductClick(product)}
                  className={`group relative flex flex-col overflow-hidden rounded-xl border transition-all hover:border-amber-500 cursor-pointer
                    ${theme === "dark" ? "bg-[#0c0c14] border-white/5" : "bg-slate-50 border-slate-200"}`}
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-slate-800">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-2.5 text-left">
                    <p className="text-xs font-semibold line-clamp-1">
                      {product.name}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#ee4d2d] bg-[#ee4d2d]/10 px-1.5 py-0.5 rounded-full mt-1.5 w-fit">
                      <ExternalLink className="w-2.5 h-2.5" /> Xem trên Shopee
                    </span>
                  </div>
                </a>
              ))}
            </div>

            <div
              className={`border-t w-full pt-4 ${theme === "dark" ? "border-white/10" : "border-black/5"}`}
            >
              {skipTimer > 0 ? (
                <p className="text-xs opacity-60 font-medium">
                  Hoặc đợi{" "}
                  <span className="text-amber-500 font-bold">{skipTimer}s</span>{" "}
                  để bỏ qua quảng cáo.
                </p>
              ) : (
                <button
                  onClick={onUnlock}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer
                    ${theme === "dark" ? "bg-white/10 hover:bg-white/20 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-800"}`}
                >
                  Bỏ qua &amp; Xem ngay
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const MotionDiv = motion.div as any;
  const MotionButton = motion.button as any;
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [view, setView] = useState<"home" | "episodes">("home");
  const [movies, setMovies] = useState<AnimeSeries[]>(initialAnimeData);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<AnimeSeries | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState<number>(0);
  const [unlockTargetEpIndex, setUnlockTargetEpIndex] = useState<number | null>(
    null,
  );
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isTimelineExpanded, setIsTimelineExpanded] = useState<boolean>(false);
  const dragonBallRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // 640px là breakpoint 'sm' của Tailwind
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const [randomHomeProducts, setRandomHomeProducts] = useState<any[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);
  const [firebaseEpisodes, setFirebaseEpisodes] = useState<any[]>([]);
  const scrollToDragonBall = () => {
    dragonBallRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  useEffect(() => {
    fetch("/api/visit").catch(() => {});
    // Load static data initially
    setMovies(initialAnimeData);

    // Fetch dynamic data from Firestore for all anime series
    import("@/src/services/animeService").then((module) => {
      const { getEpisodesByAnime } = module;
      initialAnimeData.forEach(async (anime: any) => {
        try {
          const episodes = await getEpisodesByAnime(anime.id);
          if (episodes.length > 0) {
            setMovies((prevMovies) => {
              return prevMovies.map((m) => {
                if (m.id === anime.id) {
                  const mergedEpisodes = [...m.episodes];
                  episodes.forEach((ep) => {
                    const idx = mergedEpisodes.findIndex((e) => {
                      const epNum = parseInt(e.name.replace(/\D/g, ""));
                      return epNum === ep.episode || e.name === ep.name;
                    });
                    if (idx !== -1) {
                      mergedEpisodes[idx] = { ...mergedEpisodes[idx], ...ep };
                    } else {
                      mergedEpisodes.push({ name: ep.name, src: ep.src });
                    }
                  });

                  const sorted = mergedEpisodes.sort((a: any, b: any) => {
                    const numA =
                      a.episode || parseInt(a.name.replace(/\D/g, "")) || 0;
                    const numB =
                      b.episode || parseInt(b.name.replace(/\D/g, "")) || 0;
                    return numA - numB;
                  });

                  return { ...m, episodes: sorted };
                }
                return m;
              });
            });

            setSelectedMovie((prev: any) => {
              if (prev && prev.id === anime.id) {
                const mergedEpisodes = [...prev.episodes];
                episodes.forEach((ep) => {
                  const idx = mergedEpisodes.findIndex((e) => {
                    const epNum = parseInt(e.name.replace(/\D/g, ""));
                    return epNum === ep.episode || e.name === ep.name;
                  });
                  if (idx !== -1) {
                    mergedEpisodes[idx] = { ...mergedEpisodes[idx], ...ep };
                  } else {
                    mergedEpisodes.push({ name: ep.name, src: ep.src });
                  }
                });
                const sorted = mergedEpisodes.sort((a: any, b: any) => {
                  const numA =
                    a.episode || parseInt(a.name.replace(/\D/g, "")) || 0;
                  const numB =
                    b.episode || parseInt(b.name.replace(/\D/g, "")) || 0;
                  return numA - numB;
                });
                return { ...prev, episodes: sorted };
              }
              return prev;
            });
          }
        } catch (error) {
          console.error("Error fetching episodes for " + anime.id, error);
        }
      });
    });

    // Fetch dynamic products from Firestore
    import("@/src/services/productService").then((module) => {
      const { getProducts } = module;
      getProducts()
        .then((data) => {
          setProducts(data);
          // Trộn ngẫu nhiên danh sách và lấy đúng 2 cái
          const shuffled = [...data].sort(() => 0.5 - Math.random());
          setRandomHomeProducts(shuffled.slice(0, 4));
          setIsLoadingProducts(false);
        })
        .catch((err) => {
          console.error("Error fetching products", err);
          setIsLoadingProducts(false);
        });
    });
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light";
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "dark");
    }
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollBtn(true);
      } else {
        setShowScrollBtn(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const triggerToast = (
    message: string,
    type: "success" | "info" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const checkUnlock = () => {
    const unlockedDate = localStorage.getItem("unlocked_shopee_date");
    if (unlockedDate === new Date().toDateString()) return true;
    return false;
  };

  const handleTimelineClick = (series: AnimeSeries) => {
    const isUnlocked = checkUnlock();

    const premiumEpisodes = getPremiumEpisodes(series);
    const hasPremium = premiumEpisodes.length > 0;

    // Nếu có premium và chưa unlock → bật modal Shopee
    if (hasPremium && !isUnlocked) {
      setSelectedMovie(series);
      setUnlockTargetEpIndex(null); // không cần ep cụ thể
      setUnlockTargetEpIndex(-999); // đánh dấu mở full series
      return;
    }

    // đã unlock → vào thẳng episodes
    setSelectedMovie(series);
    setView("episodes");
  };

  const getLatestEpisodeNum = (series: AnimeSeries) => {
    const valid = series.episodes.filter(
      (ep: any) => ep.src && ep.src.trim() !== "",
    );
    if (valid.length === 0) return 0;
    const nums = valid.map((ep) => parseInt(ep.name.replace(/\D/g, "")) || 0);
    return Math.max(...nums);
  };

  const getPremiumEpisodes = (series: AnimeSeries) => {
    const availableEpisodes = series.episodes
      .filter((ep: any) => ep.src && ep.src.trim() !== "")
      .map((ep: any) => parseInt(ep.name.replace(/\D/g, "")) || 0)
      .sort((a, b) => b - a);

    return availableEpisodes.slice(0, 2);
  };

  const handleProductClick = async (product: any) => {
    try {
      fetch("/api/product-click", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product }),
      }).catch(() => {});
      await trackProductClick(product);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnlockSuccess = () => {
    localStorage.setItem("unlocked_shopee_date", new Date().toDateString());

    triggerToast("🎉 Đã mở khóa toàn bộ nội dung!", "success");

    // Nếu là mở từ timeline (series)
    if (unlockTargetEpIndex === -999 && selectedMovie) {
      setView("episodes");
      setUnlockTargetEpIndex(null);
      return;
    }

    // Nếu là mở từ episode cũ
    if (unlockTargetEpIndex !== null) {
      setIsModalOpen(true);
      setSelectedEpisodeIndex(unlockTargetEpIndex);
    }

    setUnlockTargetEpIndex(null);
  };
  // console.log({selectedMovie.epCount});
  const handleEpisodeClick = (epNum: number) => {
    if (!selectedMovie) return;

    const epNamePadded = `Tập ${String(epNum).padStart(2, "0")}`;
    const epNameShort = `Tập ${epNum}`;

    const videoDataList = selectedMovie.episodes;
    const foundEpIndex = videoDataList.findIndex(
      (v: any) => v.name === epNamePadded || v.name === epNameShort,
    );

    if (foundEpIndex !== -1 && videoDataList[foundEpIndex].src) {
      const validEpisodes = videoDataList.filter(
        (ep: any) => ep.src && ep.src.trim() !== "",
      );
      const finalIndex = validEpisodes.findIndex(
        (e: any) => e.name === videoDataList[foundEpIndex].name,
      );

      const premiumEpisodes = getPremiumEpisodes(selectedMovie);
      const isPremium = premiumEpisodes.includes(epNum);

      if (isPremium && !checkUnlock()) {
        setUnlockTargetEpIndex(finalIndex);
        return;
      }

      setIsModalOpen(true);
      setSelectedEpisodeIndex(finalIndex);
      triggerToast(
        `🎬 Đang phát: ${selectedMovie.title} - ${videoDataList[foundEpIndex].name}`,
        "success",
      );
    } else {
      alert(
        `Tập ${String(epNum).padStart(2, "0")} hiện tại admin chưa tải lên video lên hệ thống. ` +
          `Scroll để xem các tập bên dưới ↓ ĐÃ RA MẮT`,
      );
    }
  };
  const sortedMovies = [...movies].sort((a, b) => a.orderNum - b.orderNum);
  const handleToggleTimeline = () => {
    if (isTimelineExpanded) {
      if (dragonBallRef.current) {
        // 1. Đo lường chính xác vị trí của phần "Trình tự xem" so với viewport hiện tại
        const rect = dragonBallRef.current.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        // 2. Tính toán điểm cuộn tối ưu (bớt đi 40px để tiêu đề trông thoáng và đẹp hơn)
        const targetScrollTop = rect.top + scrollTop - 40;

        // 3. Thực hiện cuộn chuẩn xác cùng thời điểm với hoạt ảnh đóng lại
        window.scrollTo({
          top: targetScrollTop,
          behavior: "smooth",
        });
      }
      setIsTimelineExpanded(false);
    } else {
      setIsTimelineExpanded(true);
    }
  };
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-[#050508] text-white" : "bg-[#f8fafc] text-[#0f172a]"}`}
    >
      <TrackingProvider />
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md animate-bounce max-w-sm text-left
          ${
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/20 text-emerald-300"
              : "bg-amber-950/90 border-amber-500/20 text-amber-300"
          }
        `}
        >
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-semibold">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="p-1 hover:bg-white/10 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] top-[-100px] left-[-100px]" />
        <div className="absolute w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[100px] bottom-[-50px] right-[-100px]" />
      </div>

      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 py-5 ${theme === "dark" ? "bg-[#050508]/85 border-b border-white/5" : "bg-[#f8fafc]/85 border-b border-black/10"} backdrop-blur-md`}
      >
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setView("home")}
          >
            <span className="font-display text-lg sm:text-2xl font-black tracking-tight uppercase">
              Review Anime<span className="text-amber-500"> 24/7</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer bg-amber-500/5 hover:bg-amber-500/10 
                ${theme === "dark" ? "border-white/10 text-amber-400" : "border-black/10 text-slate-800"}`}
              title="Đổi chủ đề sáng / tối"
              aria-label="Toggle theme mode"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 pt-28 pb-16 z-10">
        {view === "home" && (
          <div className="space-y-12">
            <section className="flex flex-col items-center text-center max-w-xl mx-auto space-y-4">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                <img
                  src="https://scontent.fhan14-5.fna.fbcdn.net/v/t39.30808-6/709863882_122095903413352638_3815257389828996505_n.jpg?stp=dst-jpg_tt6&cstp=mx960x540&ctp=s960x540&_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=ZUkKrXebz2AQ7kNvwGY8tHo&_nc_oc=AdoigxKsMm7oSWM6LRYStHxxWEgXABMOwcORr4q3O5ROFVkmnc29-3lc1YLu-4FiXTOj_Ody97BqrKNt7N8wWM6C&_nc_zt=23&_nc_ht=scontent.fhan14-5.fna&_nc_gid=CIVV7vGTBsDTaYIsoGbUYQ&_nc_ss=7b2a8&oh=00_Af9CBa6uVKuIQXkp0xtPVdMfZ9xwA3pnLXN87cHncClozg&oe=6A322E9D"
                  alt="Avatar Review Anime 24/7"
                  className="w-full h-full object-cover rounded-full border-4 border-amber-500/30 shadow-2xl"
                  referrerPolicy="no-referrer"
                />
                <a
                  href="https://www.facebook.com/profile.php?id=61590457230547"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-white hover:text-amber-500 hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer"
                  title="Ghé thăm Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </div>

              <div className="space-y-1">
                <h1 className="font-display text-4xl font-extrabold tracking-tight">
                  Review Anime 24/7
                </h1>
                <p
                  onClick={scrollToDragonBall}
                  className="text-amber-500 font-semibold tracking-wide flex items-center justify-center gap-1.5 animate-bobble mt-[20px]"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Dragon Ball Decord Siêu Đẹp 👇</span>
                </p>
              </div>
            </section>

            {/* Shopee Products Section */}
            <section className="max-w-xl mx-auto">
              <div
                className={`p-6 rounded-3xl shadow-xl text-left border ${theme === "dark" ? "bg-[#0c0c14] border-white/5" : "bg-white border-black/10 text-slate-800"}`}
              >
                <h3 className="font-display text-xl text-[#ee4d2d] font-black pb-4 mb-6 border-b-2 border-dashed border-[#ee4d2d]/20 flex items-center gap-2">
                  <span className="text-2xl text-orange-500">🐲</span> TRÌNH TỰ
                  XEM DRAGON BALL
                </h3>

                <div className="relative pl-2 space-y-6">
                  <div className="absolute left-[17px] top-4 bottom-8 w-0.5 bg-gradient-to-b from-amber-500 to-amber-500/10 pointer-events-none" />
                  <div className="space-y-6">
                    {sortedMovies.slice(0, 3).map((item, index) => {
                      const latestEp = getLatestEpisodeNum(item);
                      const hasNewBadge = latestEp > 0;

                      return (
                        <MotionDiv
                          key={item.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: index * 0.05 }}
                          className="relative flex gap-4 items-start group select-none"
                        >
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 z-10 shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
                            {index + 1}
                          </div>

                          <div
                            onClick={() => handleTimelineClick(item)}
                            className={`relative overflow-hidden flex-1 p-[10px]  rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer
                              ${
                                theme === "dark"
                                  ? "bg-[#0b0b12]/90 hover:bg-[#0c0c16]/30 border-white/5 hover:border-amber-500/60 hover:translate-x-1.5 hover:shadow-2xl flex-row"
                                  : "bg-slate-50/95 hover:bg-white/30 border-slate-200 hover:border-amber-500/65 hover:translate-x-1.5 hover:shadow-2xl flex-row"
                              }
                            `}
                          >
                            <div className="relative z-10 flex items-center gap-3 text-left">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-12 h-12 rounded-lg object-cover sm:w-16 sm:h-16 shrink-0 border border-white/10"
                                />
                              )}
                              <div className="relative z-10 space-y-1 text-left">
                                <h4 className="font-bold text-sm sm:text-base flex items-center flex-wrap gap-1.5">
                                  <span>{item.title}</span>
                                  {hasNewBadge && (
                                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-extrabold uppercase animate-pulse tracking-wider">
                                      NEW
                                    </span>
                                  )}
                                </h4>
                                <p className="text-xs text-slate-400 font-medium">
                                  {item.subtitle}
                                </p>
                              </div>
                            </div>
                            <span className="timeline-action-icons hidden sm:block relative z-10 text-lg opacity-65 group-hover:scale-125 group-hover:opacity-100 transition-all duration-300">
                              🎬
                            </span>
                          </div>
                        </MotionDiv>
                      );
                    })}
                    <MotionDiv
                      initial={false}
                      animate={{
                        height: !isMobile || isTimelineExpanded ? "auto" : 0,
                        opacity: !isMobile || isTimelineExpanded ? 1 : 0,
                        marginTop: !isMobile || isTimelineExpanded ? 24 : 0,
                      }}
                      transition={{
                        height: { duration: 0.35, ease: [0.25, 1, 0.5, 1] },
                        opacity: { duration: 0.2 },
                        marginTop: { duration: 0.25 },
                      }}
                      style={{ overflow: "hidden" }}
                      className="space-y-6"
                    >
                      {sortedMovies.slice(3).map((item) => {
                        const latestEp = getLatestEpisodeNum(item);
                        const hasNewBadge = latestEp > 0;
                        return (
                          <div
                            key={item.id}
                            className="relative flex gap-4 items-start group select-none"
                          >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-black text-sm flex items-center justify-center shrink-0 z-10 shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
                              {item.orderNum}
                            </div>

                            <div
                              onClick={() => handleTimelineClick(item)}
                              className={`relative overflow-hidden flex-1 p-[10px] rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer
                                ${
                                  theme === "dark"
                                    ? "bg-[#0b0b12]/90 hover:bg-[#0c0c16]/30 border-white/5 hover:border-amber-500/60 hover:translate-x-1.5 hover:shadow-2xl flex-row"
                                    : "bg-slate-50/95 hover:bg-white/30 border-slate-200 hover:border-amber-500/65 hover:translate-x-1.5 hover:shadow-2xl flex-row"
                                }
                              `}
                            >
                              <div className="relative z-10 flex items-center gap-3 text-left">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-12 h-12 rounded-lg object-cover sm:w-16 sm:h-16 shrink-0 border border-white/10"
                                  />
                                )}
                                <div className="relative z-10 space-y-1 text-left">
                                  <h4 className="font-bold text-sm sm:text-base flex items-center flex-wrap gap-1.5">
                                    <span>{item.title}</span>
                                    {item.badgeText ? (
                                      <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-extrabold uppercase animate-pulse tracking-wider">
                                        {item.badgeText}
                                      </span>
                                    ) : hasNewBadge ? (
                                      <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-extrabold uppercase animate-pulse tracking-wider">
                                        NEW
                                      </span>
                                    ) : null}
                                  </h4>
                                  <p className="text-xs text-slate-400 font-medium font-display leading-tight">
                                    {item.subtitle}
                                  </p>
                                </div>
                              </div>
                              <span className="timeline-action-icons hidden sm:block relative z-10 text-lg opacity-65 group-hover:scale-125 group-hover:opacity-100 transition-all duration-300">
                                🎬
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </MotionDiv>
                  </div>
                </div>
                {isMobile && (
                  <div className="mt-6 flex flex-col items-center justify-center relative z-20">
                    {/* Divider connector */}
                    <div className="w-px h-6 bg-amber-500/30 border-dashed border-l mb-2" />

                    <MotionButton
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleToggleTimeline}
                      className="flex items-center gap-2 px-5 py-3 rounded-full text-xs font-black tracking-wide uppercase transition-all duration-300 shadow-lg cursor-pointer bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-amber-500/20 hover:shadow-amber-500/35"
                    >
                      {isTimelineExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4 animate-bounce" />
                          <span>Thu gọn danh sách</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 animate-bounce" />
                          <span>
                            Xem tiếp {sortedMovies.length - 3} phần khác
                          </span>
                        </>
                      )}
                    </MotionButton>
                  </div>
                )}
              </div>
            </section>

            {(isLoadingProducts || randomHomeProducts.length > 0) && (
              <section ref={dragonBallRef} className="max-w-xl mx-auto">
                <div
                  className={`p-6 rounded-3xl shadow-xl text-left border ${theme === "dark" ? "bg-[#0c0c14] border-white/5" : "bg-white border-black/10 text-slate-800"}`}
                >
                  <h3 className="font-display text-xl text-[#ee4d2d] font-black pb-4 mb-4 border-b-2 border-dashed border-[#ee4d2d]/20 flex items-center gap-2">
                    <span className="text-2xl">🛍️</span> GÓC MUA SẮM (SHOPEE)
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {isLoadingProducts
                      ? Array.from({ length: 4 }).map((_, i) => (
                          <div
                            key={i}
                            className={`flex flex-col overflow-hidden rounded-2xl border ${theme === "dark" ? "bg-[#13131c] border-white/5" : "bg-white border-slate-200"}`}
                          >
                            <div
                              className={`aspect-square w-full animate-pulse ${theme === "dark" ? "bg-slate-800" : "bg-slate-200"}`}
                            />
                            <div className="p-3 space-y-2">
                              <div
                                className={`h-4 w-3/4 rounded animate-pulse ${theme === "dark" ? "bg-slate-800" : "bg-slate-200"}`}
                              />
                              <div
                                className={`h-3 w-1/2 rounded animate-pulse ${theme === "dark" ? "bg-slate-800" : "bg-slate-200"}`}
                              />
                            </div>
                          </div>
                        ))
                      : randomHomeProducts.map((product) => (
                          <a
                            key={product.id}
                            href={product.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-xl
                          ${theme === "dark" ? "bg-[#13131c] border-white/5 hover:border-amber-500/50" : "bg-white border-slate-200 hover:border-amber-500/50"}`}
                          >
                            <div
                              className="aspect-square w-full overflow-hidden bg-slate-800 cursor-pointer"
                              onClick={() => handleProductClick(product)}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            </div>
                            <div
                              className="p-3"
                              onClick={() => handleProductClick(product)}
                            >
                              <p
                                className={`text-sm font-semibold line-clamp-2 mb-1 ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}
                              >
                                {product.name}
                              </p>
                              {product.description && (
                                <p
                                  className={`text-xs line-clamp-2 mb-2 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}
                                >
                                  {product.description}
                                </p>
                              )}
                              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-[#ee4d2d] bg-[#ee4d2d]/10 px-2 py-1 rounded-full group-hover:bg-[#ee4d2d] group-hover:text-white transition-colors mt-auto w-fit">
                                <ExternalLink className="w-3 h-3" />
                                Xem trên Shopee
                              </span>
                            </div>
                          </a>
                        ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {view === "episodes" && selectedMovie && (
          <div className="space-y-8 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <button
                onClick={() => setView("home")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 w-fit cursor-pointer transition-colors
                  ${
                    theme === "dark"
                      ? "bg-[#0c0c14] hover:bg-[#131926] border-white/5 hover:border-amber-500/50"
                      : "bg-white hover:bg-slate-100 border-slate-200"
                  }
                `}
              >
                <ArrowLeft className="w-4 h-4 text-amber-500" />
                <span>Quay Lại Sảnh Chính</span>
              </button>
            </div>

            <section className="relative p-6 sm:p-10 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10" />
              <div className="absolute inset-0 bg-amber-500/[0.04] backdrop-blur-[5px]" />
              <div
                className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-sm pointer-events-none"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&q=80')`,
                }}
              />

              <div className="relative z-20 max-w-3xl space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] bg-red-500 text-white font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    TV Series
                  </span>
                  <span className="text-[10px] bg-amber-500/10 border border-amber-500/25 text-amber-400 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {selectedMovie.epCount} Tập
                  </span>
                  <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    ★ ỦNG HỘ AD BẰNG MỘT LƯỢT CLICK NHÉ
                  </span>
                </div>

                <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-white uppercase select-none">
                  {selectedMovie.vietnameseTitle || selectedMovie.title}
                </h1>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl select-none">
                  {selectedMovie.description}
                </p>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <Tv className="w-5 h-5 text-amber-500" />
                  <h2 className="font-display text-xl font-bold uppercase tracking-wide">
                    TẬP PHIM RA SỚM
                  </h2>
                </div>
                <span className="bg-slate-800/80 border border-slate-750 text-white font-mono text-xs px-3 py-1 rounded-full font-bold">
                  {selectedMovie.epCount} Tập
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
                {selectedMovie.episodes.map((episode: any, index: any) => {
                  const epNum =
                    parseInt(episode.name.replace(/\D/g, "")) || index + 1;
                  const epNumStr = String(epNum).padStart(2, "0");
                  const isAvailable = episode.src && episode.src.trim() !== "";
                  const premiumEpisodes = getPremiumEpisodes(selectedMovie);
                  const isPremium = premiumEpisodes.includes(epNum);
                  const isUnlocked = checkUnlock();
                  const isLocked = isPremium && !isUnlocked;
                  return (
                    <button
                      key={epNum}
                      onClick={() => handleEpisodeClick(epNum)}
                      className={`relative group border rounded-2xl p-4 flex flex-col items-center justify-center transition-all min-h-[90px]
${
  !isAvailable
    ? "bg-white/[0.01] border-transparent opacity-40 cursor-not-allowed select-none text-slate-500"
    : isPremium
      ? "bg-gradient-to-br from-amber-900/40 via-yellow-800/20 to-amber-900/40 border-amber-500 text-amber-200 hover:border-amber-400 hover:-translate-y-1"
      : "bg-[#0c0c14] border-white/5 hover:border-amber-500/50 hover:-translate-y-1 hover:shadow-lg text-white cursor-pointer"
}`}
                    >
                      <span className="text-[10px] font-semibold absolute top-2 left-2 pb-1 block text-slate-400">
                        Tập
                      </span>

                      <span
                        className={`font-display text-3xl font-black pb-1 pt-2 block ${
                          isLocked
                            ? "text-amber-300"
                            : isPremium
                              ? "text-emerald-400"
                              : isAvailable
                                ? "text-white"
                                : "text-inherit"
                        }`}
                      >
                        {epNumStr}
                      </span>

                      {isAvailable && (
                        <div className="absolute inset-0 flex items-center justify-center bg-amber-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex-col">
                          <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center shadow-md scale-90 group-hover:scale-100 transition-transform">
                            <Play className="w-4 h-4 text-amber-500 fill-current ml-0.5" />
                          </div>
                        </div>
                      )}

                      {isPremium && (
                        <span
                          className={`absolute top-2 right-2 p-1 rounded-full shadow ${
                            isLocked
                              ? "bg-amber-500 text-black"
                              : "bg-emerald-500 text-white"
                          }`}
                        >
                          {isLocked ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            <LockOpen className="w-3.5 h-3.5" />
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
            {products.length > 0 && (
              <section className="w-full" style={{ marginTop: "3rem" }}>
                <div
                  className={`p-6 rounded-3xl shadow-xl text-left border w-full ${theme === "dark" ? "bg-[#0c0c14] border-white/5" : "bg-white border-black/10 text-slate-800"}`}
                >
                  <h3 className="font-display text-xl text-[#ee4d2d] font-black pb-4 mb-4 border-b-2 border-dashed border-[#ee4d2d]/20 flex items-center gap-2">
                    <span className="text-2xl">🛍️</span> MẪU ĐẸP AE THAM KHẢO
                    NHÉ
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {isLoadingProducts
                      ? Array.from({ length: 6 }).map((_, i) => (
                          <div
                            key={i}
                            className={`flex flex-col overflow-hidden rounded-2xl border ${theme === "dark" ? "bg-[#13131c] border-white/5" : "bg-white border-slate-200"}`}
                          >
                            <div
                              className={`aspect-square w-full animate-pulse ${theme === "dark" ? "bg-slate-800" : "bg-slate-200"}`}
                            />
                            <div className="p-3 space-y-2">
                              <div
                                className={`h-4 w-3/4 rounded animate-pulse ${theme === "dark" ? "bg-slate-800" : "bg-slate-200"}`}
                              />
                              <div
                                className={`h-3 w-1/2 rounded animate-pulse ${theme === "dark" ? "bg-slate-800" : "bg-slate-200"}`}
                              />
                            </div>
                          </div>
                        ))
                      : products.map((product) => (
                          <a
                            key={product.id}
                            href={product.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-xl
                          ${theme === "dark" ? "bg-[#13131c] border-white/5 hover:border-amber-500/50" : "bg-white border-slate-200 hover:border-amber-500/50"}`}
                          >
                            <div
                              className="aspect-square w-full overflow-hidden bg-slate-800 cursor-pointer"
                              onClick={() => handleProductClick(product)}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            </div>
                            <div
                              className="p-3"
                              onClick={() => handleProductClick(product)}
                            >
                              <p
                                className={`text-sm font-semibold line-clamp-2 mb-1 ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}
                              >
                                {product.name}
                              </p>
                              {product.description && (
                                <p
                                  className={`text-xs line-clamp-2 mb-2 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}
                                >
                                  {product.description}
                                </p>
                              )}
                              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-[#ee4d2d] bg-[#ee4d2d]/10 px-2 py-1 rounded-full group-hover:bg-[#ee4d2d] group-hover:text-white transition-colors mt-auto w-fit">
                                <ExternalLink className="w-3 h-3" />
                                Xem trên Shopee
                              </span>
                            </div>
                          </a>
                        ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {showScrollBtn && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center z-40 transition-all shadow-xl hover:scale-110 cursor-pointer shadow-amber-500/20"
          title="Lên đầu trang"
        >
          <ChevronUp className="w-6 h-6 stroke-[3]" />
        </button>
      )}

      {isModalOpen && selectedMovie && (
        <VideoModal
          series={selectedMovie}
          initialEpisodeIndex={selectedEpisodeIndex}
          onClose={() => setIsModalOpen(false)}
          triggerNotification={triggerToast}
        />
      )}

      {unlockTargetEpIndex !== null && (
        <UnlockModal
          theme={theme}
          products={products}
          onUnlock={handleUnlockSuccess}
          onClose={() => setUnlockTargetEpIndex(null)}
          handleProductClick={handleProductClick}
        />
      )}

      <footer className="border-t border-white/5 py-10 mt-16 text-slate-500 text-xs text-center relative z-10 bg-[#050508]/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="font-display text-sm font-bold text-slate-400">
            Review Anime 24/7 • Dragon Ball Series
          </p>
          <p className="text-[10px] font-mono text-slate-600">
            Phiên Bản 1.3.0 • 2026 UTC
          </p>
        </div>
      </footer>
    </div>
  );
}
