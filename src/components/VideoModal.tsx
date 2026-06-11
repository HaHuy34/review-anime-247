"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Tv,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { AnimeSeries, DbEpisode } from "@/src/types";

interface VideoModalProps {
  series: AnimeSeries;
  initialEpisodeIndex: number; // Index in the valid empty-filtered array
  onClose: () => void;
  triggerNotification: (
    msg: string,
    type: "success" | "error" | "info",
  ) => void;
}

// Thêm hàm getEmbedUrl
const getEmbedUrl = (url: string, iframeId: string) => {
  if (!url) return "";

  // ===== DAILYMOTION =====
  if (url.includes("dailymotion.com")) {
    return `${url}${url.includes("?") ? "&" : "?"}api=1&id=${iframeId}&autoplay=1`;
  }

  // ===== GOOGLE DRIVE =====
  if (url.includes("drive.google.com")) {
    const match = url.match(/\/d\/([^/]+)/);
    if (match?.[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
  }

  return url;
};

export default function VideoModal({
  series,
  initialEpisodeIndex,
  onClose,
  triggerNotification,
}: VideoModalProps) {
  // Filter out episodes that don't have valid source links representation
  const validEpisodes = series.episodes.filter(
    (ep) => ep.src && ep.src.trim() !== "",
  );

  const [currentIndex, setCurrentIndex] = useState<number>(initialEpisodeIndex);

  const [showNav, setShowNav] = useState<boolean>(true);
  const [showSuggestion, setShowSuggestion] = useState<boolean>(false);
  const [dismissedSuggestion, setDismissedSuggestion] = useState<{
    [key: string]: boolean;
  }>({});
  const [suggestionShown, setSuggestionShown] = useState<{
    [key: string]: boolean;
  }>({});

  const navTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const durationsRef = useRef<{ [key: string]: number }>({});

  const resetNavVisibilityTimer = () => {
    setShowNav(true);
    if (navTimeoutRef.current) {
      clearTimeout(navTimeoutRef.current);
    }
    navTimeoutRef.current = setTimeout(() => {
      setShowNav(false);
    }, 3000);
  };

  useEffect(() => {
    resetNavVisibilityTimer();
    return () => {
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    };
  }, [currentIndex]);

  const currentEpisodeDetails = validEpisodes[currentIndex];

  useEffect(() => {
    const handleDailymotionMessages = (event: MessageEvent) => {
      const isDailymotion = event.origin.includes("dailymotion.com");
      if (!isDailymotion) return;

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

      <div
        className="relative w-full max-w-4xl bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl z-10 transition-transform duration-300 scale-100 flex flex-col"
        onMouseMove={resetNavVisibilityTimer}
        onClick={resetNavVisibilityTimer}
        onTouchStart={resetNavVisibilityTimer}
      >
        <div className="p-4 bg-slate-900/60 border-b border-slate-850 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center justify-between text-left">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="bg-amber-500/10 text-amber-500 p-1.5 rounded-lg border border-amber-500/25">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-extrabold flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-pulse" /> Đang phát Anime
              </span>
              <h3 className="text-white font-bold text-sm sm:text-base tracking-tight truncate">
                {series.vietnameseTitle || series.title} •{" "}
                {currentEpisodeDetails.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentEpisodeDetails?.src && (
              <a
                href={currentEpisodeDetails.src}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 rounded-lg text-xs font-black border border-amber-500/25 hover:border-transparent transition-all cursor-pointer shadow-sm hover:scale-[1.03]"
                title="Mở video trong tab mới để xem full HD"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Xem HD / Tab Mới</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="hidden sm:flex p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Đóng trình phát"
              id="close-modal-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative w-full aspect-video min-h-[560px] sm:min-h-[520px] md:min-h-[680px] bg-black overflow-hidden shrink-0">
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
                      className={`absolute left-0 w-full border-0 bg-black transition-all duration-300 ${
                        isCurrent && ep.src?.includes("drive.google.com")
                          ? "-top-[100px] h-[calc(100%+105px)]"
                          : "top-0 h-full"
                      }`}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={`${series.title} - ${ep.name}`}
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

          {showNav && (
            <>
              {currentIndex > 0 && (
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-slate-800/80 flex items-center justify-center transition-all z-20 cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                  id="modal-prev-btn"
                >
                  <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                </button>
              )}

              {currentIndex < validEpisodes.length - 1 && (
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-slate-800/80 flex items-center justify-center transition-all z-20 cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                  id="modal-next-btn"
                >
                  <ChevronRight className="w-6 h-6 stroke-[2.5]" />
                </button>
              )}
            </>
          )}

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

        <div
          className="p-3 bg-slate-900/30 border-t border-slate-905 
  grid grid-cols-1 sm:grid-cols-3 gap-2 items-center text-xs text-slate-400 font-mono"
        >
          <span className="sm:text-left">
            Tổng số tập có video:{" "}
            <strong className="text-white">{validEpisodes.length} Tập</strong>
          </span>

          <span className="sm:text-center">
            Tập đang xem:{" "}
            <strong className="text-amber-500">
              {currentIndex + 1} / {validEpisodes.length}
            </strong>
          </span>

          <p className="text-[11px] text-amber-400/95 font-sans sm:text-right leading-snug">
            ✨ Gợi ý: Nếu G-Drive không tải được, hãy nhấn "Xem HD / Tab Mới"
          </p>
        </div>
      </div>
    </div>
  );
}
