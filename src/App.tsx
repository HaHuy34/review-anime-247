import React, { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  Facebook,
  ArrowLeft,
  Tv,
  Play,
  ShoppingBag,
  CheckCircle,
  X,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { initialAnimeData } from "./data";
import { AnimeSeries } from "./types";
import VideoModal from "./components/VideoModal";

export default function App() {
  // Theme system state
  const [theme, setTheme] = useState<"dark" | "light">(
    (localStorage.getItem("theme") as "dark" | "light") || "dark",
  );

  // Apply theme to document element
  useEffect(() => {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "dark");
    }
  }, [theme]);

  // Current interface navigation view (Strictly React State mechanism)
  const [view, setView] = useState<"home" | "episodes">("home");
  const [movies] = useState<AnimeSeries[]>(initialAnimeData);
  const [selectedMovie, setSelectedMovie] = useState<AnimeSeries>(
    initialAnimeData[1],
  ); // Default to DBZ

  // Back-to-Top trigger
  const [showScrollBtn, setShowScrollBtn] = useState<boolean>(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState<number>(0);

  // Toast notifications
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info";
  } | null>(null);

  // Monitor window scroll events for header and back-to-top button
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
    type: "success" | "info" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Pure React state routing merged beautifully with the Shopee affiliate tag!
  const handleTimelineClick = (series: AnimeSeries) => {
    // 1. Open affiliate code in helper browser tab
    if (series.shopeeLink) {
      window.open(series.shopeeLink, "_blank", "noopener,noreferrer");
    }

    // 2. Pure React State transition (Instantaneous rendering, zero reload duration, flawless back-navigation)
    setSelectedMovie(series);
    setView("episodes");
  };

  const handleEpisodeClick = (epNum: number) => {
    const epNamePadded = `Tập ${String(epNum).padStart(2, "0")}`;
    const epNameShort = `Tập ${epNum}`;

    const videoDataList = selectedMovie.episodes;
    const foundEpIndex = videoDataList.findIndex(
      (v) => v.name === epNamePadded || v.name === epNameShort,
    );

    if (foundEpIndex !== -1 && videoDataList[foundEpIndex].src) {
      const validEpisodes = videoDataList.filter(
        (ep) => ep.src && ep.src.trim() !== "",
      );
      const finalIndex = validEpisodes.findIndex(
        (e) => e.name === videoDataList[foundEpIndex].name,
      );

      if (finalIndex !== -1) {
        setSelectedEpisodeIndex(finalIndex);
        setIsModalOpen(true);
        triggerToast(
          `🎬 Đang phát: ${selectedMovie.title} - ${videoDataList[foundEpIndex].name}`,
          "success",
        );
      }
    } else {
      alert(
        `Tập ${String(epNum).padStart(2, "0")} hiện tại admin chưa tải lên video lên hệ thống, xin vui lòng quay lại sau!`,
      );
    }
  };

  // Find the highest available episode number with links to badge it as "NEW"
  const getLatestEpisodeNum = (series: AnimeSeries) => {
    const valid = series.episodes.filter(
      (ep) => ep.src && ep.src.trim() !== "",
    );
    if (valid.length === 0) return 0;
    const nums = valid.map((ep) => parseInt(ep.name.replace(/\D/g, "")) || 0);
    return Math.max(...nums);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-[#050508] text-white" : "bg-[#f8fafc] text-[#0f172a]"}`}
    >
      {/* Toast Notification popups */}
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

      {/* Floating Animated blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] top-[-100px] left-[-100px] animate-blob-1" />
        <div className="absolute w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[100px] bottom-[-50px] right-[-100px] animate-blob-2" />
      </div>

      {/* Header section identical style from reviewanime247 */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-400 py-5 ${theme === "dark" ? "bg-[#050508]/85 border-b border-white/5" : "bg-[#f8fafc]/85 border-b border-black/10"} backdrop-blur-md`}
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
            {/* Theme Toggle Button dark/light */}
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

      {/* Main Container Core elements */}
      <main className="relative max-w-6xl mx-auto px-4 pt-28 pb-16 z-10">
        {/* VIEW 1: HOME PAGE (Anime Timeline) */}
        {view === "home" && (
          <div className="space-y-12 animate-fade-in">
            {/* Profile Avatar Header exactly matching reviewanime247 */}
            <section className="flex flex-col items-center text-center max-w-xl mx-auto space-y-4">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                <img
                  src="https://scontent.fhan14-5.fna.fbcdn.net/v/t39.30808-6/709863882_122095903413352638_3815257389828996505_n.jpg?stp=dst-jpg_tt6&cstp=mx960x540&ctp=s960x540&_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=EYIuAjXzvSoQ7kNvwHxANOJ&_nc_oc=AdrQYw8iTlBUx3xcJICehyPJL6A1r7TsNbkAUZxbC2K-Rbf93yBvWo3Bi-ncRUv7Cxk&_nc_zt=23&_nc_ht=scontent.fhan14-5.fna&_nc_gid=QVInmydHDLdn9bftYl3aOA&_nc_ss=7b2a8&oh=00_Af8RPipTvB6OBBTOjF4e0hV7A1T5JSLUvpvAUZb7mC42Hw&oe=6A2C3FDD"
                  alt="Avatar Review Anime 24/7"
                  className="w-full h-full object-cover rounded-full border-4 border-amber-500/30 shadow-2xl animate-pulse"
                  referrerPolicy="no-referrer"
                />

                {/* Share Button linked to Facebook */}
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
                <p className="text-amber-500 font-semibold tracking-wide flex items-center justify-center gap-1.5">
                  <span className="bio">Link phim bên dưới 👇</span>
                </p>
              </div>
            </section>

            {/* Timeline component in the center, converted from DB-TIMELINE */}
            <section className="max-w-xl mx-auto">
              <div
                className={`p-6 rounded-3xl shadow-xl text-left border ${theme === "dark" ? "bg-[#0c0c14] border-white/5" : "bg-white border-black/10 text-slate-800"}`}
              >
                {/* Timeline Header label */}
                <h3 className="font-display text-xl text-[#ee4d2d] font-black pb-4 mb-6 border-b-2 border-dashed border-[#ee4d2d]/20 flex items-center gap-2">
                  <span className="text-2xl text-orange-500">🐲</span> TRÌNH TỰ
                  XEM DRAGON BALL
                </h3>

                {/* Timeline vertical stack flow */}
                <div className="relative pl-2 space-y-6">
                  {/* Vertical connect line */}
                  <div className="absolute left-[17px] top-4 bottom-8 w-0.5 bg-gradient-to-b from-amber-500 to-amber-500/10 pointer-events-none" />

                  {movies
                    .sort((a, b) => a.orderNum - b.orderNum)
                    .map((item, index) => {
                      const latestEp = getLatestEpisodeNum(item);
                      const hasNewBadge = latestEp > 0; // Like Dragon Ball Z has active episodes

                      return (
                        <div
                          key={item.id}
                          className="relative flex gap-4 items-start group select-none"
                        >
                          {/* Circle sequence dot */}
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 z-10 shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
                            {index + 1}
                          </div>

                          {/* Content card */}
                          <div
                            onClick={() => handleTimelineClick(item)}
                            className={`flex-1 p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer
                              ${
                                theme === "dark"
                                  ? "bg-white/[0.03] hover:bg-white/[0.06] border-white/5 hover:border-amber-500/50 hover:translate-x-1.5"
                                  : "bg-slate-50 hover:bg-slate-100/90 border-slate-250 hover:border-amber-500/55 hover:translate-x-1.5"
                              }
                            `}
                          >
                            <div className="space-y-1 text-left">
                              <h4 className="font-bold text-sm sm:text-base flex items-center flex-wrap gap-1.5">
                                <span>{item.title}</span>
                                {hasNewBadge && (
                                  <span className="bg-red-500 text-white text-[11px] px-1.5 py-0.5 rounded-full font-extrabold uppercase animate-pulse tracking-wider">
                                    NEW
                                  </span>
                                )}
                              </h4>
                              <p className="text-xs text-slate-400 font-medium">
                                {item.subtitle}
                              </p>
                            </div>

                            {/* Action visual Icon */}
                            <span className="timeline-action-icon text-lg opacity-65 group-hover:scale-125 group-hover:opacity-100 transition-all duration-300">
                              🎬
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: EPISODES LIST (Rendered instantaneously, smooth as butter!) */}
        {view === "episodes" && selectedMovie && (
          <div className="space-y-8 animate-fade-in text-left">
            {/* Back Button and stats track bar */}
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

            {/* Film Show details Hero exactly mimicking episodes.html layout but upgraded */}
            <section className="relative p-6 sm:p-10 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
              {/* Cover-art backdrop for design glow */}
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

                {/* Affiliate redirect details */}
                <div className="bg-slate-950/75 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-extrabold block">
                      Liên kết Shopee tương thích:
                    </span>
                    <p className="text-xs text-slate-400 font-semibold truncate max-w-xs sm:max-w-md font-mono">
                      {selectedMovie.shopeeLink}
                    </p>
                  </div>
                  <a
                    href={selectedMovie.shopeeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shrink-0"
                    id="shopee-external-fallback"
                  >
                    <span>Mua Đồ Dragon Ball</span>
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </section>

            {/* Episode Grid section matching custom list in episodes.html */}
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <Tv className="w-5 h-5 text-amber-500" />
                  <h2 className="font-display text-xl font-bold uppercase tracking-wide">
                    Danh Sách Tập Phim
                  </h2>
                </div>
                <span className="bg-slate-800/80 border border-slate-750 text-white font-mono text-xs px-3 py-1 rounded-full font-bold">
                  {selectedMovie.epCount} Tập
                </span>
              </div>

              {/* Grid block with animation for beautiful representation */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {Array.from({ length: selectedMovie.epCount }, (_, i) => {
                  const epNum = i + 1;
                  const epNumStr = String(epNum).padStart(2, "0");

                  // Look up if this episode has an active url
                  const epNamePadded = `Tập ${epNumStr}`;
                  const epNameShort = `Tập ${epNum}`;

                  const videoObj = selectedMovie.episodes.find(
                    (v) => v.name === epNamePadded || v.name === epNameShort,
                  );
                  const isAvailable =
                    videoObj && videoObj.src && videoObj.src.trim() !== "";

                  const latestAvailable = getLatestEpisodeNum(selectedMovie);
                  const isLatest =
                    latestAvailable > 0 && epNum === latestAvailable;

                  return (
                    <button
                      key={epNum}
                      onClick={() => handleEpisodeClick(epNum)}
                      className={`relative group/ep border rounded-2xl p-4 flex flex-col items-center justify-center transition-all min-h-[90px] cursor-pointer 
                        ${
                          isAvailable
                            ? isLatest
                              ? "bg-gradient-to-t from-amber-500/15 via-[#0e0f18] to-[#0e0f18] border-amber-500 hover:border-amber-400 hover:-translate-y-1 hover:shadow-lg"
                              : "bg-[#0c0c14] border-white/5 hover:border-amber-500/50 hover:-translate-y-1 hover:shadow-lg"
                            : "bg-white/[0.01] border-transparent opacity-40 cursor-default select-none"
                        }
                      `}
                      id={`ep-btn-${epNum}`}
                    >
                      <span className="text-[10px] text-slate-400 font-semibold absolute top-2 left-2 pb-1 block">
                        Tập
                      </span>
                      <span
                        className={`font-display text-3xl font-black pb-1 pt-2 block ${
                          isLatest
                            ? "text-amber-400"
                            : isAvailable
                              ? "text-white"
                              : "text-slate-500"
                        }`}
                      >
                        {epNumStr}
                      </span>

                      {/* Play hover button indicator */}
                      {isAvailable && (
                        <div className="absolute inset-0 flex items-center justify-center bg-amber-500 rounded-2xl opacity-0 group-hover/ep:opacity-100 transition-opacity flex-col">
                          <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center shadow-md scale-90 group-hover/ep:scale-100 transition-transform">
                            <Play className="w-4 h-4 text-amber-500 fill-current ml-0.5" />
                          </div>
                        </div>
                      )}

                      {/* Sparkle badge for NEW status */}
                      {isLatest && (
                        <span className="absolute top-2 right-2 bg-red-650 text-white font-extrabold text-[8px] uppercase px-1 rounded">
                          New
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Floating Back To Top button converted from original HTML/CSS */}
      {showScrollBtn && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center z-40 transition-all shadow-xl hover:scale-110 cursor-pointer shadow-amber-500/20"
          title="Lên đầu trang"
          id="backToTop"
        >
          <ChevronUp className="w-6 h-6 stroke-[3]" />
        </button>
      )}

      {/* Iframe Video Modal slider (Renders dynamically when a valid episode with video is opened) */}
      {isModalOpen && selectedMovie && (
        <VideoModal
          series={selectedMovie}
          initialEpisodeIndex={selectedEpisodeIndex}
          onClose={() => setIsModalOpen(false)}
          triggerNotification={triggerToast}
        />
      )}

      {/* Aesthetic Footer representation */}
      <footer className="border-t border-white/5 py-10 mt-16 text-slate-500 text-xs text-center relative z-10 bg-[#050508]/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="font-display text-sm font-bold text-slate-400">
            Review Anime 24/7 • Dragon Ball Series
          </p>
          <p className="leading-relaxed px-4"></p>
          <p className="text-[10px] font-mono text-slate-600">
            Phiên Bản 1.3.0 • 2026 UTC
          </p>
        </div>
      </footer>
    </div>
  );
}
