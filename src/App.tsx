"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Sun,
  Moon,
  ArrowLeft,
  Tv,
  Play,
  CheckCircle,
  X,
  ChevronUp,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ShoppingBag,
  Film,
  MessageCircle,
} from "lucide-react";

import CommentsPage from "@/src/components/CommentsPage";
import { initialAnimeData } from "@/src/data";
import { AnimeSeries } from "@/src/types";
import VideoModal from "@/src/components/VideoModal";
import TrackingProvider from "./components/TrackingProvider";
import { trackProductClick } from "./services/trackingService";
import { motion, AnimatePresence } from "motion/react";

// ============================================================
// DonateModal
// ============================================================
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
          className="absolute top-2 right-2 p-2 rounded-full cursor-pointer hover:bg-black/10 transition-all z-10"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="font-display text-xl sm:text-2xl font-black text-amber-500 mb-4">
          1đ cũng quý
        </h2>
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
          0%   { box-shadow: 0 0 0 0 rgba(245,158,11,0.55);  border-color: rgba(245,158,11,0.9); }
          50%  { box-shadow: 0 0 18px 4px rgba(245,158,11,0.35); border-color: rgba(251,191,36,1); }
          100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.55);  border-color: rgba(245,158,11,0.9); }
        }
        .donate-sparkle-border { animation: donateSparkleBorder 2.2s ease-in-out infinite; }
        @keyframes donateQrGlow {
          0%,100% { box-shadow: 0 0 0px 0px rgba(245,158,11,0); }
          50%     { box-shadow: 0 0 25px 6px rgba(245,158,11,0.45); }
        }
        .donate-qr-glow { animation: donateQrGlow 2.4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

// ============================================================
// ProductNameMarquee
// ============================================================
function ProductNameMarquee({
  products,
  theme,
}: {
  products: any[];
  theme: "dark" | "light";
}) {
  if (!products || products.length === 0) return null;
  const names = products.map((p) => p.name).filter(Boolean);
  const loopNames = [...names, ...names];
  const duration = Math.max(names.length * 4, 10);
  return (
    <div className="sm:hidden relative overflow-hidden w-full h-6">
      <div
        className="absolute top-1 left-0 flex whitespace-nowrap will-change-transform"
        style={{
          animation: `productMarqueeScroll ${duration}s linear infinite`,
        }}
      >
        {loopNames.map((name, i) => (
          <span
            key={i}
            className={`inline-flex items-center text-xs font-bold uppercase tracking-wide shrink-0 ${theme === "dark" ? "text-amber-400" : "text-[#ee4d2d]"}`}
          >
            {name}
            <span className="mx-2 opacity-70 text-[10px]">✨🐲</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes productMarqueeScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

// ============================================================
// ProductCard
// ============================================================
function ProductCard({
  product,
  theme,
  onProductClick,
}: {
  product: any;
  theme: "dark" | "light";
  onProductClick: (p: any) => void;
}) {
  return (
    <a
      href={product.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-xl
        ${theme === "dark" ? "bg-[#13131c] border-white/5 hover:border-amber-500/50" : "bg-white border-slate-200 hover:border-amber-500/50"}`}
    >
      <div
        className="aspect-square w-full overflow-hidden bg-slate-800 cursor-pointer"
        onClick={() => onProductClick(product)}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="p-3" onClick={() => onProductClick(product)}>
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
  );
}

function ProductSkeleton({ theme }: { theme: "dark" | "light" }) {
  return (
    <div
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
  );
}

// ============================================================
// Tab definitions
// ============================================================
type MainTab = "watch" | "comments" | "shop";
const TABS: { key: MainTab; label: string; icon: React.ElementType }[] = [
  { key: "watch", label: "Xem Phim", icon: Film },
  { key: "comments", label: "Bình Luận", icon: MessageCircle },
  { key: "shop", label: "Sản Phẩm", icon: ShoppingBag },
];

// ============================================================
// AnimatedTab wrapper
// ============================================================
function AnimatedTab({
  children,
  tabKey,
}: {
  children: React.ReactNode;
  tabKey: string;
}) {
  const MotionDiv = motion.div as any;
  return (
    <MotionDiv
      key={tabKey}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
    >
      {children}
    </MotionDiv>
  );
}

// ============================================================
// TabNav — pill bottom (mobile) + sidebar (tablet/desktop)
// ============================================================
function TabNav({
  mainTab,
  setMainTab,
  theme,
  products,
  isLoadingProducts,
}: {
  mainTab: MainTab;
  setMainTab: (t: MainTab) => void;
  theme: "dark" | "light";
  products: any[];
  isLoadingProducts: boolean;
}) {
  const MotionDiv = motion.div as any;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });

  const goTab = (key: MainTab) => {
    setMainTab(key);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Tính position pill sau mỗi lần đổi tab
  useEffect(() => {
    const idx = TABS.findIndex((t) => t.key === mainTab);
    const el = tabRefs.current[idx];
    if (el) {
      setPillStyle({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [mainTab]);

  return (
    <>
      {/* ── MOBILE: pill bottom bar ── */}
      <nav
        className={`fixed bottom-2 left-0 right-0 z-40 px-3 pb-[env(safe-area-inset-bottom,8px)] pt-2 sm:hidden
          ${
            theme === "dark"
              ? "bg-[#050508]/95 border-t border-white/5"
              : "bg-[#f8fafc]/95 border-t border-black/8"
          } backdrop-blur-md`}
      >
        <div
          className={`relative flex gap-1 p-1.5 rounded-[28px] border
            ${
              theme === "dark"
                ? "bg-[#111118] border-white/8"
                : "bg-white border-black/8 shadow-sm"
            }`}
        >
          {/* Pill cam trượt */}
          <MotionDiv
            className="absolute top-1.5 bottom-1.5 bg-amber-500 rounded-[22px] shadow-lg shadow-amber-500/30"
            animate={{ left: pillStyle.left, width: pillStyle.width }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            style={{ left: pillStyle.left, width: pillStyle.width }}
          />

          {TABS.map(({ key, label, icon: Icon }, idx) => {
            const isActive = mainTab === key;
            return (
              <button
                key={key}
                ref={(el) => {
                  tabRefs.current[idx] = el;
                }}
                onClick={() => goTab(key)}
                className="relative flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-[22px] text-xs font-semibold transition-colors duration-200 cursor-pointer select-none z-10"
                style={{ minWidth: 0 }}
              >
                <Icon
                  className="w-4 h-4 shrink-0 transition-colors duration-200"
                  strokeWidth={isActive ? 2.5 : 2}
                  style={{
                    color: isActive
                      ? "#0f172a"
                      : theme === "dark"
                        ? "#64748b"
                        : "#94a3b8",
                  }}
                />
                {isActive && (
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px] text-slate-950">
                    {label}
                  </span>
                )}
                {key === "shop" &&
                  !isActive &&
                  !isLoadingProducts &&
                  products.length > 0 && (
                    <span className="absolute top-1.5 right-2.5 text-[8px] font-black bg-amber-500 text-slate-950 min-w-[14px] h-[14px] px-1 rounded-full flex items-center justify-center leading-none">
                      {products.length}
                    </span>
                  )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── TABLET / DESKTOP: sidebar giữ nguyên ── */}
      <aside
        className={`hidden sm:flex fixed top-0 left-0 bottom-0 z-30 flex-col w-[200px] lg:w-[220px] pt-[73px] border-r
          ${
            theme === "dark"
              ? "bg-[#050508]/95 border-white/5"
              : "bg-[#f8fafc]/95 border-black/8"
          } backdrop-blur-md`}
      >
        <nav className="flex flex-col gap-0.5 p-3 flex-1 overflow-y-auto">
          {TABS.map(({ key, label, icon: Icon }) => {
            const isActive = mainTab === key;
            return (
              <button
                key={key}
                onClick={() => goTab(key)}
                className={`relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer text-left group
                  ${
                    isActive
                      ? theme === "dark"
                        ? "bg-amber-500/12 text-amber-400"
                        : "bg-amber-500/10 text-amber-600"
                      : theme === "dark"
                        ? "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                        : "text-slate-500 hover:text-slate-800 hover:bg-black/5"
                  }`}
              >
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-200
                    ${isActive ? "h-5 bg-amber-500" : "h-0 bg-transparent"}`}
                />
                <Icon
                  className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110"
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="flex-1">{label}</span>
                {key === "shop" &&
                  !isLoadingProducts &&
                  products.length > 0 && (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none
                    ${isActive ? "bg-amber-500 text-slate-950" : "bg-amber-500/20 text-amber-500"}`}
                    >
                      {products.length}
                    </span>
                  )}
              </button>
            );
          })}
        </nav>
        <div
          className={`p-3 border-t ${theme === "dark" ? "border-white/5" : "border-black/8"}`}
        >
          <p
            className={`text-[10px] font-mono text-center ${theme === "dark" ? "text-slate-700" : "text-slate-400"}`}
          >
            Review Anime 24/7
          </p>
        </div>
      </aside>
    </>
  );
}

// ============================================================
// Main App
// ============================================================
export default function App() {
  const MotionDiv = motion.div as any;
  const MotionButton = motion.button as any;
  const MotionSpan = motion.span as any;

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mainTab, setMainTab] = useState<MainTab>("shop");
  const [view, setView] = useState<"home" | "episodes">("home");

  const [movies, setMovies] = useState<AnimeSeries[]>(initialAnimeData);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<AnimeSeries | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState<number>(0);
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
  const [randomHomeProducts, setRandomHomeProducts] = useState<any[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);
  const [totalVisits, setTotalVisits] = useState<number>(0);

  // scroll progress
  useEffect(() => {
    const fn = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docH > 0 ? (scrollTop / docH) * 100 : 0);
    };
    fn();
    window.addEventListener("scroll", fn);
    window.addEventListener("resize", fn);
    return () => {
      window.removeEventListener("scroll", fn);
      window.removeEventListener("resize", fn);
    };
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    fetch("/api/visit").catch(() => {});
    fetch("/api/total-visits")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setTotalVisits(d.total);
      })
      .catch(() => {});

    setMovies(initialAnimeData);

    import("@/src/services/animeService").then((module) => {
      const { getEpisodesByAnime } = module;
      initialAnimeData.forEach(async (anime: any) => {
        try {
          const episodes = await getEpisodesByAnime(anime.id);
          if (!episodes.length) return;
          const merge = (prev: any[], eps: any[]) => {
            const list = [...prev];
            eps.forEach((ep) => {
              const idx = list.findIndex(
                (e) =>
                  parseInt(e.name.replace(/\D/g, "")) === ep.episode ||
                  e.name === ep.name,
              );
              if (idx !== -1) list[idx] = { ...list[idx], ...ep };
              else list.push({ name: ep.name, src: ep.src });
            });
            return list.sort(
              (a: any, b: any) =>
                (a.episode || parseInt(a.name.replace(/\D/g, "")) || 0) -
                (b.episode || parseInt(b.name.replace(/\D/g, "")) || 0),
            );
          };
          setMovies((prev) =>
            prev.map((m) =>
              m.id === anime.id
                ? { ...m, episodes: merge(m.episodes, episodes) }
                : m,
            ),
          );
          setSelectedMovie((prev) =>
            prev !== null && prev?.id === anime.id
              ? { ...prev, episodes: merge(prev.episodes, episodes) }
              : prev,
          );
        } catch (e) {
          console.error("Error fetching episodes for " + anime.id, e);
        }
      });
    });

    import("@/src/services/productService").then((module) => {
      module
        .getProducts()
        .then((data: any[]) => {
          setProducts(data);
          setRandomHomeProducts(
            [...data].sort(() => 0.5 - Math.random()).slice(0, 4),
          );
          setIsLoadingProducts(false);
        })
        .catch(() => setIsLoadingProducts(false));
    });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light";
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const fn = () => setShowScrollBtn(window.scrollY > 150);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const triggerToast = (
    message: string,
    type: "success" | "info" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const handleOpenDonateModal = () => {
    const rect = donateCloudRef.current?.getBoundingClientRect();
    if (rect)
      setDonateOrigin({
        x: rect.left + rect.width / 2 - window.innerWidth / 2,
        y: rect.top + rect.height / 2 - window.innerHeight / 2,
      });
    setIsDonateModalOpen(true);
  };

  const handleTimelineClick = (series: AnimeSeries) => {
    setSelectedMovie(series);
    setView("episodes");
    fetch("/api/series-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seriesTitle: series.title }),
    }).catch(() => {});
  };

  const getLatestEpisodeNum = (series: AnimeSeries) => {
    const valid = series.episodes.filter((ep: any) => ep.src?.trim());
    if (!valid.length) return 0;
    return Math.max(
      ...valid.map((ep) => parseInt(ep.name.replace(/\D/g, "")) || 0),
    );
  };

  const getFeaturedEpisodes = (series: AnimeSeries) =>
    series.episodes
      .filter((ep: any) => ep.src?.trim())
      .map((ep: any) => parseInt(ep.name.replace(/\D/g, "")) || 0)
      .sort((a, b) => b - a)
      .slice(0, 2);

  const handleProductClick = async (product: any) => {
    try {
      fetch("/api/product-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product }),
      }).catch(() => {});
      window.open(product.link, "_blank");
      await trackProductClick(product);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEpisodeClick = (epNum: number) => {
    if (!selectedMovie) return;
    const padded = `Tập ${String(epNum).padStart(2, "0")}`;
    const short = `Tập ${epNum}`;
    const list = selectedMovie.episodes;
    const foundIdx = list.findIndex(
      (v: any) => v.name === padded || v.name === short,
    );
    if (foundIdx !== -1 && list[foundIdx].src) {
      const valid = list.filter((ep: any) => ep.src?.trim());
      const finalIdx = valid.findIndex(
        (e: any) => e.name === list[foundIdx].name,
      );
      setIsModalOpen(true);
      setSelectedEpisodeIndex(finalIdx);
      triggerToast(
        `🎬 Đang phát: ${selectedMovie.title} - ${list[foundIdx].name}`,
        "success",
      );
    } else {
      alert(
        `Tập ${String(epNum).padStart(2, "0")} hiện tại admin chưa tải lên. Scroll để xem các tập bên dưới ↓ ĐÃ RA MẮT`,
      );
    }
  };

  const sortedMovies = [...movies].sort((a, b) => a.orderNum - b.orderNum);

  const handleToggleTimeline = () => {
    if (isTimelineExpanded) {
      const rect = dragonBallRef.current?.getBoundingClientRect();
      if (rect)
        window.scrollTo({
          top: rect.top + window.scrollY - 40,
          behavior: "smooth",
        });
      setIsTimelineExpanded(false);
    } else {
      setIsTimelineExpanded(true);
    }
  };

  // ── Timeline item renderer ──────────────────────────────────
  const TimelineItem = ({ item, idx }: { item: AnimeSeries; idx: number }) => {
    const latestEp = getLatestEpisodeNum(item);
    return (
      <div className="relative flex gap-4 items-start group select-none">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-black text-sm flex items-center justify-center shrink-0 z-10 shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
          {idx}
        </div>
        <div
          onClick={() => handleTimelineClick(item)}
          className={`relative overflow-hidden flex-1 p-[10px] rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer
            ${
              theme === "dark"
                ? "bg-[#0b0b12]/90 hover:bg-[#0c0c16]/30 border-white/5 hover:border-amber-500/60 hover:translate-x-1.5 hover:shadow-2xl"
                : "bg-slate-50/95 hover:bg-white/30 border-slate-200 hover:border-amber-500/65 hover:translate-x-1.5 hover:shadow-2xl"
            }`}
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
                ) : latestEp > 0 ? (
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
          <span className="hidden sm:block relative z-10 text-lg opacity-65 group-hover:scale-125 group-hover:opacity-100 transition-all duration-300">
            🎬
          </span>
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-[#050508] text-white" : "bg-[#f8fafc] text-[#0f172a]"}`}
    >
      <TrackingProvider />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md animate-bounce max-w-sm text-left
          ${toast.type === "success" ? "bg-emerald-950/90 border-emerald-500/20 text-emerald-300" : "bg-amber-950/90 border-amber-500/20 text-amber-300"}`}
        >
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-xs font-semibold flex-1">{toast.message}</p>
          <button
            onClick={() => setToast(null)}
            className="p-1 hover:bg-white/10 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* BG blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] top-[-100px] left-[-100px]" />
        <div className="absolute w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[100px] bottom-[-50px] right-[-100px]" />
      </div>

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 py-5
          ${theme === "dark" ? "bg-[#050508]/85 border-b border-white/5" : "bg-[#f8fafc]/85 border-b border-black/10"} backdrop-blur-md`}
      >
        {/* Trên tablet/desktop: header lùi sang phải nhường sidebar */}
        <div className="max-w-6xl mx-auto px-4 sm:pl-[216px] lg:pl-[236px] flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              setMainTab("watch");
              setView("home");
            }}
          >
            <span className="font-display text-lg sm:text-2xl font-black tracking-tight uppercase">
              Review Anime<span className="text-amber-500"> 24/7</span>
            </span>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer bg-amber-500/5 hover:bg-amber-500/10
              ${theme === "dark" ? "border-white/10 text-amber-400" : "border-black/10 text-slate-800"}`}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>
        {/* Scroll progress bar */}
        <div
          className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        >
          <img
            src="https://media0.giphy.com/media/v1.Y2lkPTZjMDliOTUydWQybzhiZ3k0ZnVheWVnZXJoamg5amFudnhuenU3enZuZnByeGVseSZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/IizHZy80WZbkmHiaVP/giphy.gif"
            alt=""
            className="absolute -top-8 -right-5 w-7 h-7 transition-all duration-150 ease-out"
            style={{
              opacity: scrollProgress > 1 ? 1 : 0,
              transform: "scaleX(-1)",
            }}
          />
        </div>
      </header>

      {/* ── TAB NAV (pill mobile + sidebar tablet/desktop) ── */}
      <TabNav
        mainTab={mainTab}
        setMainTab={setMainTab}
        theme={theme}
        products={products}
        isLoadingProducts={isLoadingProducts}
      />

      {/* ── CONTENT ── */}
      {/*
        Mobile:    pt-20 (header) + pb-28 (pill nav clearance)
        Tablet/Desktop: pl-[200px/220px] để nhường sidebar, pt-20 cho header
      */}
      <main
        className={`relative z-10 max-w-6xl mx-auto px-4 pt-24 pb-28
          sm:pb-10 sm:pt-24 sm:pl-[216px] lg:pl-[236px]`}
      >
        <AnimatePresence mode="wait">
          {/* ════ TAB: 🎬 XEM PHIM ════ */}
          {mainTab === "watch" && (
            <AnimatedTab tabKey="watch">
              <div>
                {/* HOME */}
                {view === "home" && (
                  <div className="space-y-12">
                    {/* Hero */}
                    <section className="flex flex-col items-center text-center max-w-xl mx-auto space-y-4">
                      <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                        <img
                          src="https://giffiles.alphacoders.com/207/207839.gif"
                          alt="Avatar"
                          className="w-full h-full object-cover rounded-full border-4 border-amber-500/30 shadow-2xl"
                          referrerPolicy="no-referrer"
                        />
                        <a
                          href="https://www.facebook.com/profile.php?id=61590457230547"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-white hover:text-amber-500 hover:scale-110 transition-all shadow-md cursor-pointer"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                          </svg>
                        </a>
                        {/* Cloud */}
                        <div
                          ref={donateCloudRef}
                          className="sm:hidden absolute -top-10 -right-16 flex flex-col items-end cursor-pointer"
                          style={{
                            animation: "cloudFloat 3.5s ease-in-out infinite",
                          }}
                          onClick={handleOpenDonateModal}
                          role="button"
                          aria-label="Donate"
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
                              <ellipse
                                cx="85"
                                cy="55"
                                rx="58"
                                ry="26"
                                fill="white"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center pl-2">
                              <span className="text-slate-800 text-xs font-bold whitespace-nowrap">
                                {totalVisits.toLocaleString("vi-VN")} 🐉🐲
                              </span>
                            </div>
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
                              style={{
                                display: "inline-block",
                                whiteSpace: "pre",
                              }}
                              initial={{ x: -40, opacity: 0, rotate: 0 }}
                              animate={{
                                x: 0,
                                opacity: 1,
                                rotate: [0, -8, 8, -5, 5, 0],
                              }}
                              transition={{
                                x: {
                                  duration: 0.35,
                                  ease: "easeOut",
                                  delay: i * 0.05,
                                },
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
                        <p className="text-amber-500 font-semibold tracking-wide flex items-center justify-center gap-1.5 animate-bobble mt-[20px]">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>Cảm ơn cả nhà đã ghé thăm 👇</span>
                        </p>
                      </div>
                    </section>

                    {/* Timeline */}
                    <section ref={dragonBallRef} className="max-w-xl mx-auto">
                      <div
                        className={`p-6 rounded-3xl shadow-xl text-left border ${theme === "dark" ? "bg-[#0c0c14] border-white/5" : "bg-white border-black/10 text-slate-800"}`}
                      >
                        <h3 className="font-display text-xl text-[#ee4d2d] font-black pb-4 mb-6 border-b-2 border-dashed border-[#ee4d2d]/20 flex items-center gap-2">
                          <span className="text-2xl text-orange-500">🐲</span>{" "}
                          TRÌNH TỰ XEM DRAGON BALL
                        </h3>
                        <div className="relative pl-2 space-y-6">
                          <div className="absolute left-[17px] top-4 bottom-8 w-0.5 bg-gradient-to-b from-amber-500 to-amber-500/10 pointer-events-none" />
                          <div className="space-y-6">
                            {sortedMovies.slice(0, 3).map((item, i) => (
                              <MotionDiv
                                key={item.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: i * 0.05 }}
                              >
                                <TimelineItem item={item} idx={i + 1} />
                              </MotionDiv>
                            ))}
                            <MotionDiv
                              initial={false}
                              animate={{
                                height:
                                  !isMobile || isTimelineExpanded ? "auto" : 0,
                                opacity:
                                  !isMobile || isTimelineExpanded ? 1 : 0,
                                marginTop:
                                  !isMobile || isTimelineExpanded ? 24 : 0,
                              }}
                              transition={{
                                height: {
                                  duration: 0.35,
                                  ease: [0.25, 1, 0.5, 1],
                                },
                                opacity: { duration: 0.2 },
                                marginTop: { duration: 0.25 },
                              }}
                              style={{ overflow: "hidden" }}
                              className="space-y-6"
                            >
                              {sortedMovies.slice(3).map((item) => (
                                <TimelineItem
                                  key={item.id}
                                  item={item}
                                  idx={item.orderNum}
                                />
                              ))}
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
                              className="flex items-center gap-2 px-5 py-3 rounded-full text-xs font-black tracking-wide uppercase transition-all duration-300 shadow-lg cursor-pointer bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-amber-500/20"
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
                  </div>
                )}

                {/* EPISODES */}
                {view === "episodes" && selectedMovie && (
                  <div className="space-y-8 text-left">
                    <button
                      onClick={() => setView("home")}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 w-fit cursor-pointer transition-colors
                        ${theme === "dark" ? "bg-[#0c0c14] hover:bg-[#131926] border-white/5 hover:border-amber-500/50" : "bg-white hover:bg-slate-100 border-slate-200"}`}
                    >
                      <ArrowLeft className="w-4 h-4 text-amber-500" />
                      <span>Quay Lại Sảnh Chính</span>
                    </button>

                    {/* Hero banner */}
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

                    {/* Episode grid */}
                    <section className="space-y-6">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div className="flex items-center gap-2">
                          <Tv className="w-5 h-5 text-amber-500" />
                          <h2 className="font-display text-xl font-bold uppercase tracking-wide">
                            TẬP PHIM RA SỚM
                          </h2>
                        </div>
                        <span className="bg-slate-800/80 text-white font-mono text-xs px-3 py-1 rounded-full font-bold">
                          {selectedMovie.epCount} Tập
                        </span>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
                        {selectedMovie.episodes.map(
                          (episode: any, index: any) => {
                            const epNum =
                              parseInt(episode.name.replace(/\D/g, "")) ||
                              index + 1;
                            const epNumStr = String(epNum).padStart(2, "0");
                            const isAvailable = episode.src?.trim();
                            const isFeatured =
                              getFeaturedEpisodes(selectedMovie).includes(
                                epNum,
                              );
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
                                  className={`font-display text-3xl font-black pb-1 pt-2 block ${isFeatured ? "text-emerald-400" : isAvailable ? "text-white" : "text-inherit"}`}
                                >
                                  {epNumStr}
                                </span>
                                {isAvailable && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-amber-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center shadow-md">
                                      <Play className="w-4 h-4 text-amber-500 fill-current ml-0.5" />
                                    </div>
                                  </div>
                                )}
                              </button>
                            );
                          },
                        )}
                      </div>
                    </section>

                    {/* Products below episodes */}
                    {products.length > 0 && (
                      <section style={{ marginTop: "3rem" }}>
                        <div
                          className={`p-6 rounded-3xl shadow-xl text-left border ${theme === "dark" ? "bg-[#0c0c14] border-white/5" : "bg-white border-black/10 text-slate-800"}`}
                        >
                          <h3 className="font-display text-xl text-[#ee4d2d] font-black pb-4 mb-4 border-b-2 border-dashed border-[#ee4d2d]/20 flex items-center gap-2">
                            <span className="text-2xl">🛍️</span> MẪU ĐẸP AE THAM
                            KHẢO NHÉ
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                            {isLoadingProducts
                              ? Array.from({ length: 6 }).map((_, i) => (
                                  <ProductSkeleton key={i} theme={theme} />
                                ))
                              : products.map((p) => (
                                  <ProductCard
                                    key={p.id}
                                    product={p}
                                    theme={theme}
                                    onProductClick={handleProductClick}
                                  />
                                ))}
                          </div>
                        </div>
                      </section>
                    )}
                  </div>
                )}
              </div>
            </AnimatedTab>
          )}

          {/* ════ TAB: 💬 BÌNH LUẬN ════ */}
          {mainTab === "comments" && (
            <AnimatedTab tabKey="comments">
              <CommentsPage theme={theme} />
            </AnimatedTab>
          )}

          {/* ════ TAB: 🛍️ SẢN PHẨM ════ */}
          {mainTab === "shop" && (
            <AnimatedTab tabKey="shop">
              <div className="space-y-10">
                {(isLoadingProducts || randomHomeProducts.length > 0) && (
                  <section className="max-w-xl mx-auto md:hidden">
                    <div
                      className={`p-6 rounded-3xl shadow-xl text-left border ${theme === "dark" ? "bg-[#0c0c14] border-white/5" : "bg-white border-black/10 text-slate-800"}`}
                    >
                      <h3 className="font-display text-xl text-[#ee4d2d] font-black pb-4 mb-4 border-b-2 border-dashed border-[#ee4d2d]/20 flex items-center gap-2">
                        <span className="text-2xl">⭐</span>
                        <span className="hidden sm:inline">
                          NỔI BẬT HÔM NAY
                        </span>
                        <ProductNameMarquee
                          products={randomHomeProducts}
                          theme={theme}
                        />
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {isLoadingProducts
                          ? Array.from({ length: 4 }).map((_, i) => (
                              <ProductSkeleton key={i} theme={theme} />
                            ))
                          : randomHomeProducts.map((p) => (
                              <ProductCard
                                key={p.id}
                                product={p}
                                theme={theme}
                                onProductClick={handleProductClick}
                              />
                            ))}
                      </div>
                    </div>
                  </section>
                )}

                {!isLoadingProducts && products.length > 0 && (
                  <section>
                    <div
                      className={`p-6 rounded-3xl shadow-xl text-left border ${theme === "dark" ? "bg-[#0c0c14] border-white/5" : "bg-white border-black/10 text-slate-800"}`}
                    >
                      <h3 className="font-display text-xl text-[#ee4d2d] font-black pb-4 mb-4 border-b-2 border-dashed border-[#ee4d2d]/20 flex items-center gap-2">
                        <span className="text-2xl">🛍️</span> TẤT CẢ SẢN PHẨM
                        <span className="ml-auto text-sm font-mono text-slate-400">
                          {products.length} mẫu
                        </span>
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                        {products.map((p) => (
                          <ProductCard
                            key={p.id}
                            product={p}
                            theme={theme}
                            onProductClick={handleProductClick}
                          />
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {isLoadingProducts && (
                  <div
                    className={`p-6 rounded-3xl border ${theme === "dark" ? "bg-[#0c0c14] border-white/5" : "bg-white border-black/10"}`}
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <ProductSkeleton key={i} theme={theme} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AnimatedTab>
          )}
        </AnimatePresence>
      </main>

      {/* Scroll-to-top */}
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
            className="hidden fixed bottom-[80px] right-[50px] w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center z-40 shadow-xl cursor-pointer shadow-amber-500/20 sm:bottom-6"
          >
            <ChevronUp className="w-6 h-6 stroke-[3]" />
          </MotionButton>
        )}
      </AnimatePresence>

      {/* Video Modal */}
      {isModalOpen && selectedMovie && (
        <VideoModal
          series={selectedMovie}
          initialEpisodeIndex={selectedEpisodeIndex}
          onClose={() => setIsModalOpen(false)}
          triggerNotification={triggerToast}
        />
      )}

      {/* Donate Modal */}
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

      <footer
        className={`hidden md:block border-t py-10 mt-16 text-slate-500 text-xs text-center relative z-10 backdrop-blur-sm sm:pl-[200px] lg:pl-[220px]
          ${theme === "dark" ? "border-white/5 bg-[#050508]/80" : "border-black/5 bg-[#f8fafc]/80"}`}
      >
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="font-display text-sm font-bold text-slate-400">
            Review Anime 24/7 • Dragon Ball Series
          </p>
          <p className="text-[10px] font-mono text-slate-600">
            Dragon Ball Anime Hub • Huy Ha
          </p>
        </div>
      </footer>
    </div>
  );
}
