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
  Eye,
} from "lucide-react";

import { initialAnimeData } from "@/src/data";
import { AnimeSeries } from "@/src/types";
import VideoModal from "@/src/components/VideoModal";
import TrackingProvider from "./components/TrackingProvider";
import { trackProductClick } from "./services/trackingService";
import { motion, AnimatePresence } from "motion/react";

// ============================================================
// Modal gợi ý sản phẩm — KHÔNG có gate cứng, người dùng luôn có
// thể bấm "Xem ngay" ngay lập tức nếu không quan tâm sản phẩm.
// (Đã xoá hoàn toàn cơ chế Option 2 / isOption2 từng khoá cứng
// không cho thoát modal.)
// ============================================================
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
  const [confirmingTimer, setConfirmingTimer] = useState<number | null>(null);

  useEffect(() => {
    if (confirmingTimer === null) return;
    const int = setInterval(() => {
      setConfirmingTimer((prev) => {
        if (prev !== null && prev <= 1) {
          onUnlock();
          return 0;
        }
        return prev !== null ? prev - 1 : null;
      });
    }, 1000);
    return () => clearInterval(int);
  }, [confirmingTimer, onUnlock]);

  const onProductClick = (p: any) => {
    handleProductClick(p);
    setConfirmingTimer(3);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className={`relative w-full max-w-lg rounded-3xl p-6 shadow-2xl border flex flex-col items-center text-center sparkle-border ${theme === "dark" ? "bg-[#13131c] border-white/10 text-white" : "bg-white border-black/10 text-slate-800"}`}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 rounded-full cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-all z-10"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-display text-xl sm:text-2xl font-black mb-2 text-amber-500">
          MỘT VÀI MẪU ĐẸP DÀNH CHO BẠN
        </h2>
        <p className="text-sm opacity-80 mb-6">
          Có thể bạn sẽ thích các sản phẩm này
        </p>

        {confirmingTimer !== null ? (
          <div className="py-8 flex flex-col items-center justify-center min-h-[160px]">
            <p className="text-5xl font-display font-black text-amber-500 animate-pulse">
              {confirmingTimer}s
            </p>
            <p className="text-sm mt-3 opacity-80 font-medium">
              Đang mở video cho bạn...
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
                  <div className="aspect-[4/4] w-full overflow-hidden bg-slate-800">
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

            {/* Nút xem ngay luôn hiện sẵn, không có thời gian chờ,
                cùng cấp độ nổi bật với card sản phẩm. */}
            <div
              className={`border-t w-full pt-4 ${theme === "dark" ? "border-white/10" : "border-black/5"}`}
            >
              <button
                onClick={onUnlock}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer
                  ${theme === "dark" ? "bg-white/10 hover:bg-white/20 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-800"}`}
              >
                Xem ngay
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes sparkleBorder {
          0% {
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.55);
            border-color: rgba(245, 158, 11, 0.9);
          }
          50% {
            box-shadow: 0 0 18px 4px rgba(245, 158, 11, 0.35);
            border-color: rgba(251, 191, 36, 1);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.55);
            border-color: rgba(245, 158, 11, 0.9);
          }
        }
        .sparkle-border {
          animation: sparkleBorder 2.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

function DonateModal({
  theme,
  qrSrc,
  origin = { x: 0, y: 0 },
  onClose,
}: {
  theme: "dark" | "light";
  qrSrc: string;
  origin?: { x: number; y: number };
  onClose: () => void;
}) {
  const MotionDiv = motion.div as any;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <MotionDiv
        initial={{ opacity: 0, scale: 0.1, x: origin.x, y: origin.y }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, scale: 0.1, x: origin.x, y: origin.y }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className={`relative w-full max-w-sm rounded-3xl p-6 shadow-2xl border flex flex-col items-center text-center donate-sparkle-border ${
          theme === "dark"
            ? "bg-[#13131c] border-white/10 text-white"
            : "bg-white border-black/10 text-slate-800"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 rounded-full cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-all z-10"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center gap-2 mb-1">
          <h2 className="font-display text-xl sm:text-2xl font-black text-amber-500">
            1đ cũng quý
          </h2>
          {/* <br />
          <h6 className="sm:text-2xl font-black text-amber-400">
            nhưng ko có tiền tất cả bằng null
          </h6> */}
        </div>
        {/* <p className="text-sm opacity-80 mb-5">
          Quét mã QR để donate giúp admin duy trì server nhé 🙏
        </p> */}

        <MotionDiv
          initial={{ opacity: 0, scale: 0.6, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{
            delay: 0.15,
            duration: 0.5,
            ease: "easeOut",
            type: "spring",
            bounce: 0.35,
          }}
          className="relative p-3 rounded-2xl bg-white donate-qr-glow"
        >
          <img
            src={qrSrc}
            alt="QR Code Donate"
            className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
          />
        </MotionDiv>

        <p
          className={`text-xs mt-5 font-medium ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}
        >
          Cảm ơn bạn đã đồng hành cùng Review Anime 24/7 ❤️
        </p>
      </MotionDiv>

      <style>{`
        @keyframes donateSparkleBorder {
          0% {
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.55);
            border-color: rgba(245, 158, 11, 0.9);
          }
          50% {
            box-shadow: 0 0 18px 4px rgba(245, 158, 11, 0.35);
            border-color: rgba(251, 191, 36, 1);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.55);
            border-color: rgba(245, 158, 11, 0.9);
          }
        }
        .donate-sparkle-border {
          animation: donateSparkleBorder 2.2s ease-in-out infinite;
        }
        @keyframes donateQrGlow {
          0%, 100% {
            box-shadow: 0 0 0px 0px rgba(245, 158, 11, 0.0);
          }
          50% {
            box-shadow: 0 0 25px 6px rgba(245, 158, 11, 0.45);
          }
        }
        .donate-qr-glow {
          animation: donateQrGlow 2.4s ease-in-out infinite;
        }
      `}</style>
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
  const [isDonateModalOpen, setIsDonateModalOpen] = useState<boolean>(false);
  const donateQrSrc =
    "https://i.pinimg.com/564x/f1/02/0d/f1020d0e788e185df92fbc5d207b5ab1.jpg";
  const donateCloudRef = useRef<HTMLDivElement | null>(null);
  const [donateOrigin, setDonateOrigin] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isTimelineExpanded, setIsTimelineExpanded] = useState<boolean>(false);
  const dragonBallRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const MotionSpan = motion.span as any;

  useEffect(() => {
    const handleScrollProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
    };
    handleScrollProgress();
    window.addEventListener("scroll", handleScrollProgress);
    window.addEventListener("resize", handleScrollProgress);
    return () => {
      window.removeEventListener("scroll", handleScrollProgress);
      window.removeEventListener("resize", handleScrollProgress);
    };
  }, []);

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
  const scrollToDragonBall = () => {
    dragonBallRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  const [totalVisits, setTotalVisits] = useState<number>(0);
  useEffect(() => {
    fetch("/api/visit").catch(() => {});
    fetch("/api/total-visits")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setTotalVisits(data.total);
      })
      .catch(() => {});
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
      if (window.scrollY > 150) {
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

  // Modal gợi ý sản phẩm vẫn hiển thị (để giữ trải nghiệm khám phá sản phẩm),
  // nhưng KHÔNG còn khái niệm "unlock" / khoá nội dung — nội dung luôn xem được.
  // localStorage chỉ dùng để không làm phiền lại trong cùng một ngày.
  const checkDismissedToday = () => {
    const dismissedDate = localStorage.getItem("suggest_dismissed_date");
    if (dismissedDate === new Date().toDateString()) return true;
    return false;
  };
  const handleOpenDonateModal = () => {
    const rect = donateCloudRef.current?.getBoundingClientRect();
    if (rect) {
      const cloudCenterX = rect.left + rect.width / 2;
      const cloudCenterY = rect.top + rect.height / 2;
      setDonateOrigin({
        x: cloudCenterX - window.innerWidth / 2,
        y: cloudCenterY - window.innerHeight / 2,
      });
    }
    setIsDonateModalOpen(true);
  };
  const handleTimelineClick = (series: AnimeSeries) => {
    setSelectedMovie(series);
    setUnlockTargetEpIndex(-999);

    // Gửi thông báo Discord
    fetch("/api/series-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seriesTitle: series.title }),
    }).catch(() => {});
  };
  const getLatestEpisodeNum = (series: AnimeSeries) => {
    const valid = series.episodes.filter(
      (ep: any) => ep.src && ep.src.trim() !== "",
    );
    if (valid.length === 0) return 0;
    const nums = valid.map((ep) => parseInt(ep.name.replace(/\D/g, "")) || 0);
    return Math.max(...nums);
  };

  const getFeaturedEpisodes = (series: AnimeSeries) => {
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
      window.open(product.link, "_blank");
      await trackProductClick(product);
    } catch (err) {
      console.error(err);
    }
  };

  const handleModalDismiss = () => {
    localStorage.setItem("suggest_dismissed_date", new Date().toDateString());

    if (unlockTargetEpIndex === -999 && selectedMovie) {
      setView("episodes");
      setUnlockTargetEpIndex(null);
      return;
    }

    if (unlockTargetEpIndex !== null && unlockTargetEpIndex >= 0) {
      setIsModalOpen(true);
      setSelectedEpisodeIndex(unlockTargetEpIndex);
    }

    setUnlockTargetEpIndex(null);
  };

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

      // Nội dung luôn xem được ngay — không còn kiểm tra "premium/locked".
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
        const rect = dragonBallRef.current.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const targetScrollTop = rect.top + scrollTop - 40;
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
        <div
          className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        >
          <img
            src="https://media0.giphy.com/media/v1.Y2lkPTZjMDliOTUydWQybzhiZ3k0ZnVheWVnZXJoamg5amFudnhuenU3enZuZnByeGVseSZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/IizHZy80WZbkmHiaVP/giphy.gif"
            alt=""
            className="absolute -top-8 -right-5 w-10 h-10 transition-all duration-150 ease-out"
            style={{
              opacity: scrollProgress > 1 ? 1 : 0,
              transform: "scaleX(-1)",
            }}
          />
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 pt-28 pb-16 z-10">
        {view === "home" && (
          <div className="space-y-12">
            <section className="flex flex-col items-center text-center max-w-xl mx-auto space-y-4">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                <img
                  src="https://giffiles.alphacoders.com/207/207839.gif"
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

                {/* --- Đám mây suy nghĩ --- */}
                <div
                  ref={donateCloudRef}
                  className="sm:hidden absolute -top-10 -right-16 flex flex-col items-end cursor-pointer"
                  style={{ animation: "cloudFloat 3.5s ease-in-out infinite" }}
                  onClick={handleOpenDonateModal}
                  role="button"
                  aria-label="Donate cho admin"
                >
                  <div className="relative w-24 h-14">
                    <svg
                      viewBox="0 0 160 90"
                      className="absolute inset-0 w-full h-full drop-shadow-lg"
                      style={{
                        animation: "cloudPulse 3s ease-in-out infinite",
                      }}
                    >
                      <circle cx="34" cy="50" r="20" fill="white" />
                      <circle cx="60" cy="28" r="22" fill="white" />
                      <circle cx="95" cy="22" r="24" fill="white" />
                      <circle cx="128" cy="34" r="20" fill="white" />
                      <circle cx="138" cy="58" r="16" fill="white" />
                      <ellipse cx="85" cy="55" rx="58" ry="26" fill="white" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center pl-2">
                      <span className="text-slate-800 text-xs font-bold whitespace-nowrap">
                        {totalVisits.toLocaleString("vi-VN")} 🐉🐲
                      </span>
                    </div>

                    {/* Bong bóng dẫn xuống đầu nhân vật */}
                    <span
                      className="absolute bg-white rounded-full shadow"
                      style={{
                        width: 6,
                        height: 6,
                        bottom: -10,
                        left: 28,
                        animation:
                          "bubbleBounce 3.5s ease-in-out infinite 0.1s",
                      }}
                    />
                    <span
                      className="absolute bg-white rounded-full shadow"
                      style={{
                        width: 10,
                        height: 10,
                        bottom: -22,
                        left: 24,
                        animation:
                          "bubbleBounce 3.5s ease-in-out infinite 0.2s",
                      }}
                    />
                    <span
                      className="absolute bg-white rounded-full shadow"
                      style={{
                        width: 12,
                        height: 12,
                        bottom: -36,
                        left: 20,
                        animation:
                          "bubbleBounce 3.5s ease-in-out infinite 0.3s",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <h1 className="font-display text-4xl font-extrabold tracking-tight flex items-baseline justify-center flex-wrap">
                  {"Review Anime 24/7".split("").map((char, i) => (
                    <MotionSpan
                      key={i}
                      style={{ display: "inline-block", whiteSpace: "pre" }}
                      initial={{ x: -40, opacity: 0, rotate: 0 }}
                      animate={{
                        x: 0,
                        opacity: 1,
                        rotate: [0, -8, 8, -5, 5, 0],
                      }}
                      transition={{
                        x: { duration: 0.35, ease: "easeOut", delay: i * 0.05 },
                        opacity: { duration: 0.35, delay: i * 0.05 },
                        rotate: {
                          duration: 0.5,
                          delay: i * 0.05 + 0.1,
                          ease: "easeInOut",
                        },
                      }}
                    >
                      {char}
                    </MotionSpan>
                  ))}
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
                  <div className="mt-3 flex flex-col items-center justify-center relative z-20">
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
                  const featuredEpisodes = getFeaturedEpisodes(selectedMovie);
                  const isFeatured = featuredEpisodes.includes(epNum);
                  return (
                    <button
                      key={epNum}
                      onClick={() => handleEpisodeClick(epNum)}
                      className={`relative group border rounded-2xl p-4 flex flex-col items-center justify-center transition-all min-h-[90px]
${
  !isAvailable
    ? "bg-white/[0.01] border-transparent opacity-40 cursor-not-allowed select-none text-slate-500"
    : isFeatured
      ? "bg-gradient-to-br from-amber-900/40 via-yellow-800/20 to-amber-900/40 border-amber-500 text-amber-200 hover:border-amber-400 hover:-translate-y-1"
      : "bg-[#0c0c14] border-white/5 hover:border-amber-500/50 hover:-translate-y-1 hover:shadow-lg text-white cursor-pointer"
}`}
                    >
                      <span className="text-[10px] font-semibold absolute top-2 left-2 pb-1 block text-slate-400">
                        Tập
                      </span>

                      <span
                        className={`font-display text-3xl font-black pb-1 pt-2 block ${
                          isFeatured
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
      <AnimatePresence>
        {showScrollBtn && (
          <MotionButton
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-[80px] right-[50px] w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center z-40 shadow-xl cursor-pointer shadow-amber-500/20"
            title="Lên đầu trang"
          >
            <ChevronUp className="w-6 h-6 stroke-[3]" />
          </MotionButton>
        )}
      </AnimatePresence>

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
          onUnlock={handleModalDismiss}
          onClose={() => setUnlockTargetEpIndex(null)}
          handleProductClick={handleProductClick}
        />
      )}

      <AnimatePresence>
        {isDonateModalOpen && (
          <DonateModal
            theme={theme}
            qrSrc={donateQrSrc}
            origin={donateOrigin}
            onClose={() => setIsDonateModalOpen(false)}
          />
        )}
      </AnimatePresence>

      <footer className="border-t border-white/5 py-10 mt-16 text-slate-500 text-xs text-center relative z-10 bg-[#050508]/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="font-display text-sm font-bold text-slate-400">
            Review Anime 24/7 • Dragon Ball Series
          </p>
          <p className="text-[10px] font-mono text-slate-600">
            Phiên Bản 1.4.0 • 2026 UTC
          </p>
        </div>
      </footer>
    </div>
  );
}
