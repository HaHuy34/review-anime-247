"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { X, Sparkles, Tv, AlertCircle, Eye, EyeOff } from "lucide-react";
import { AnimeSeries, DbEpisode } from "@/src/types";

interface VideoModalProps {
  series: AnimeSeries;
  initialEpisodeIndex: number; // Index in the valid empty-filtered array
  onClose: () => void;
  triggerNotification: (
    msg: string,
    type: "success" | "error" | "info",
  ) => void;
  products?: { id?: string; name: string; image: string; link: string }[];
}

const getEmbedUrl = (url: string, iframeId: string) => {
  if (!url) return "";

  // Dailymotion
  if (url.includes("dailymotion.com")) {
    return `${url}${
      url.includes("?") ? "&" : "?"
    }api=1&id=${iframeId}&autoplay=1`;
  }

  // Google Drive
  if (url.includes("drive.google.com")) {
    const match = url.match(/\/d\/([^/]+)/);

    if (match?.[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview?rm=minimal`;
    }
  }

  // Streamtape
  if (url.includes("streamtape.com")) {
    const match = url.match(/streamtape\.com\/(?:v|e)\/([^/]+)/);
    if (match?.[1]) {
      return `https://streamtape.com/e/${match[1]}/`;
    }
    return url;
  }

  // Odysee
  if (url.includes("odysee.com")) {
    if (url.includes("/$/embed/")) return url;
    const match = url.match(/odysee\.com\/([^?]+)/);
    if (match?.[1]) {
      return `https://odysee.com/$/embed/${match[1]}`;
    }
  }

  return url;
};

export default function VideoModal({
  series,
  initialEpisodeIndex,
  onClose,
  triggerNotification,
  products = [],
}: VideoModalProps) {
  const validEpisodes = series.episodes.filter(
    (ep) => ep.src && ep.src.trim() !== "",
  );

  const randomProducts = useMemo(
    () => [...products].sort(() => 0.5 - Math.random()).slice(0, 4),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // Chỉ random 1 lần khi modal mở
  );

  const [currentIndex, setCurrentIndex] = useState<number>(initialEpisodeIndex);
  const [showSuggestion, setShowSuggestion] = useState<boolean>(false);
  const [dismissedSuggestion, setDismissedSuggestion] = useState<{
    [key: string]: boolean;
  }>({});
  const [suggestionShown, setSuggestionShown] = useState<{
    [key: string]: boolean;
  }>({});

  const [slowLoadWarning, setSlowLoadWarning] = useState(false);
  const slowLoadTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Chế độ xem đơn giản: ẩn header + footer, chỉ giữ lại video
  const [isSimpleMode, setIsSimpleMode] = useState<boolean>(false);

  // Gợi ý "Chế độ đơn giản" cho người dùng chưa biết tính năng này
  const [showSimpleModeHint, setShowSimpleModeHint] = useState<boolean>(false);
  const simpleModeHintTimerRef = useRef<NodeJS.Timeout | null>(null);

  const durationsRef = useRef<{ [key: string]: number }>({});

  const currentEpisodeDetails = validEpisodes[currentIndex];

  useEffect(() => {
    setSlowLoadWarning(false);
    if (slowLoadTimerRef.current) clearTimeout(slowLoadTimerRef.current);

    const isOdysee = currentEpisodeDetails?.src?.includes("odysee.com");
    if (isOdysee) {
      slowLoadTimerRef.current = setTimeout(() => {
        setSlowLoadWarning(true);
      }, 9000);
    }

    return () => {
      if (slowLoadTimerRef.current) clearTimeout(slowLoadTimerRef.current);
    };
  }, [currentIndex, currentEpisodeDetails?.src]);

  useEffect(() => {
    const handleDailymotionMessages = (event: MessageEvent) => {
      if (!event.origin.includes("dailymotion.com")) return;

      try {
        const data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (!data || !data.id) return;

        if (data.event === "durationchange") {
          durationsRef.current[data.id] = data.duration;
        }

        if (data.event === "timeupdate") {
          const totalDuration = durationsRef.current[data.id] || 0;
          const currentTime = data.time;
          const remainingSeconds = totalDuration - currentTime;

          if (
            remainingSeconds > 0 &&
            remainingSeconds <= 180 &&
            !dismissedSuggestion[data.id] &&
            currentIndex < validEpisodes.length - 1
          ) {
            if (!suggestionShown[data.id]) {
              setSuggestionShown((prev) => ({ ...prev, [data.id]: true }));
              setShowSuggestion(true);
            }
          } else if (remainingSeconds > 180) {
            setShowSuggestion(false);
          }
        }

        if (data.event === "video_end" || data.event === "end") {
          setShowSuggestion(false);
          if (currentIndex < validEpisodes.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            triggerNotification(
              `🎉 Đang tự động chuyển sang tập tiếp theo!`,
              "success",
            );
          } else {
            triggerNotification(
              `🎬 Bạn đã coi hết các tập hiện có của phần này!`,
              "info",
            );
          }
        }
      } catch (e) {}
    };

    window.addEventListener("message", handleDailymotionMessages);
    return () => {
      window.removeEventListener("message", handleDailymotionMessages);
    };
  }, [
    currentIndex,
    validEpisodes,
    dismissedSuggestion,
    suggestionShown,
    triggerNotification,
  ]);

  useEffect(() => {
    // Chỉ gợi ý khi modal vừa mở và người dùng chưa bật chế độ đơn giản
    if (!isSimpleMode) {
      setShowSimpleModeHint(true);
      simpleModeHintTimerRef.current = setTimeout(() => {
        setShowSimpleModeHint(false);
      }, 4500);
    }

    return () => {
      if (simpleModeHintTimerRef.current)
        clearTimeout(simpleModeHintTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const activeThumb = document.getElementById(
      `episode-thumb-${currentIndex}`,
    );
    activeThumb?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < validEpisodes.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowSuggestion(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowSuggestion(false);
    }
  };

  const handleSuggestionNext = () => {
    setShowSuggestion(false);
    if (currentIndex < validEpisodes.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSuggestionDismiss = () => {
    setShowSuggestion(false);
    const iframeId = `dm-iframe-${currentIndex}`;
    setDismissedSuggestion((prev) => ({ ...prev, [iframeId]: true }));
  };

  if (validEpisodes.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      id="videoModal"
    >
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl z-10 transition-transform duration-300 scale-100 flex flex-col">
        {!isSimpleMode && (
          <div className="p-4 bg-slate-900/60 border-b border-slate-850 flex items-center justify-between text-left">
            <div className="flex items-center gap-2">
              <div className="bg-amber-500/10 text-amber-500 p-1.5 rounded-lg border border-amber-500/25">
                <Tv className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-extrabold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 animate-pulse" /> Đang phát Anime
                </span>
                <h3 className="text-white font-bold text-sm sm:text-base tracking-tight truncate max-w-md sm:max-w-xl">
                  {series.vietnameseTitle || series.title} •{" "}
                  {currentEpisodeDetails.name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <div className="relative">
                <button
                  onClick={() => {
                    setIsSimpleMode(true);
                    setShowSimpleModeHint(false);
                    if (simpleModeHintTimerRef.current)
                      clearTimeout(simpleModeHintTimerRef.current);
                  }}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Chế độ xem đơn giản"
                  id="simple-mode-btn"
                >
                  <EyeOff className="w-4 h-4" />
                </button>

                {showSimpleModeHint && (
                  <div className="absolute top-full right-0 mt-2 z-40">
                    <div className="absolute -top-1.5 right-3 w-3 h-3 bg-amber-500 rotate-45 animate-bounce" />
                    <div className="bg-amber-500 text-slate-950 text-xs font-bold rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                      Thử chế độ xem đơn giản tại đây!
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Đóng trình phát"
                id="close-modal-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <div className="relative w-full aspect-video min-h-[340px] sm:min-h-[420px] bg-black overflow-hidden">
          {isSimpleMode && (
            <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5">
              <button
                onClick={() => setIsSimpleMode(false)}
                className="p-2 bg-slate-950/70 hover:bg-slate-900 backdrop-blur-sm rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Hiện giao diện đầy đủ"
                id="exit-simple-mode-btn"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-slate-950/70 hover:bg-slate-900 backdrop-blur-sm rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Đóng trình phát"
                id="close-modal-simple-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div
            className="flex w-full h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {validEpisodes.map((ep: any, index: any) => {
              const iframeId = `dm-iframe-${index}`;
              const isCurrent = index === currentIndex;
              const srcUrl = isCurrent
                ? getEmbedUrl(ep.src, iframeId)
                : "about:blank";

              return (
                <div
                  key={index}
                  className="w-full h-full shrink-0 relative flex flex-col justify-center"
                >
                  {isCurrent ? (
                    <iframe
                      id={iframeId}
                      src={srcUrl}
                      className={`
                        border-0 bg-black absolute inset-0
                        ${
                          ep.src?.includes("drive.google.com")
                            ? `w-full h-full sm:-top-[70px] sm:h-[calc(100%+125px)]`
                            : `w-full h-full`
                        }
                      `}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={`${series.title} - ${ep.name}`}
                      onLoad={() => {
                        // Load xong trước timeout → xoá cảnh báo
                        const isOdysee = ep.src?.includes("odysee.com");
                        if (!isOdysee) {
                          setSlowLoadWarning(false);
                          if (slowLoadTimerRef.current)
                            clearTimeout(slowLoadTimerRef.current);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-950 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full border-2 border-slate-700 border-t-amber-500 animate-spin" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Odysee slow load warning */}
          {slowLoadWarning && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm px-4 py-3 bg-slate-950/95 border border-amber-500/30 rounded-xl z-30 shadow-xl flex items-center justify-center gap-3">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-xs text-center text-amber-300 font-semibold flex-1 leading-relaxed">
                ⏳ Video đang tải chậm, vui lòng chờ thêm 15-20s
              </p>
              <button
                onClick={() => setSlowLoadWarning(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Dailymotion next episode suggestion */}
          {showSuggestion && (
            <div className="absolute bottom-6 right-6 p-4 sm:p-5 bg-slate-950/95 border border-slate-800 rounded-xl max-w-xs text-left shadow-2xl z-30 animate-pulse">
              <div className="flex items-start gap-2.5 mb-2.5">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-200 font-semibold leading-normal">
                  Sắp hết video hiện tại rồi! Bạn có muốn nhảy ngay sang tập mới
                  không?
                </p>
              </div>
              <div className="flex justify-end gap-2 text-xs">
                <button
                  onClick={handleSuggestionDismiss}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-400 font-medium rounded-lg transition-colors cursor-pointer"
                  id="dismiss-suggestion-btn"
                >
                  Để sau
                </button>
                <button
                  onClick={handleSuggestionNext}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow-md transition-colors cursor-pointer"
                  id="play-next-suggestion-btn"
                >
                  Xem Tiếp tục
                </button>
              </div>
            </div>
          )}
        </div>

        {!isSimpleMode && (
          <div className="p-3 bg-slate-900/30 border-t border-slate-905">
            <div className="flex items-center justify-between mb-2 text-xs text-slate-400 font-mono">
              <span>Danh sách tập</span>
              <span>
                Tổng:{" "}
                <strong className="text-white">
                  {validEpisodes.length} Tập
                </strong>
              </span>
            </div>
            <div
              className="flex items-center gap-2 overflow-x-auto pb-3"
              style={{ scrollbarWidth: "thin" }}
            >
              {validEpisodes.map((ep: any, index: any) => {
                const isActive = index === currentIndex;
                return (
                  <button
                    key={index}
                    id={`episode-thumb-${index}`}
                    onClick={() => {
                      setCurrentIndex(index);
                      setShowSuggestion(false);
                    }}
                    title={ep.name}
                    className={`shrink-0 min-w-[44px] h-9 px-3 rounded-lg text-xs font-bold font-mono border transition-colors cursor-pointer ${
                      isActive
                        ? "bg-amber-500/15 border-amber-500 text-amber-400"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!isSimpleMode && randomProducts.length > 0 && (
          <div className="px-3 pb-3 bg-slate-900/30 border-t border-white/5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2">
              👑 Chỉ dành cho fan đẳng cấp
            </p>
            <div className="grid grid-cols-2 gap-2">
              {randomProducts.map((p) => (
                <a
                  key={p.id}
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-2 items-center bg-slate-900 rounded-xl p-2 border border-white/5 hover:border-amber-500/40 transition-all group"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover shrink-0 border border-white/10"
                  />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-200 font-medium line-clamp-2 leading-tight">
                      {p.name}
                    </p>
                    <span className="text-[10px] text-[#ee4d2d] font-bold mt-0.5 block group-hover:underline">
                      Xem trên Shopee →
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
