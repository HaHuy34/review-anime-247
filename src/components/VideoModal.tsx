"use client";
import React, { useState, useEffect, useRef } from "react";
import { X, Sparkles, Tv, AlertCircle } from "lucide-react";
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
}: VideoModalProps) {
  const validEpisodes = series.episodes.filter(
    (ep) => ep.src && ep.src.trim() !== "",
  );

  const [currentIndex, setCurrentIndex] = useState<number>(initialEpisodeIndex);
  const [showSuggestion, setShowSuggestion] = useState<boolean>(false);
  const [dismissedSuggestion, setDismissedSuggestion] = useState<{
    [key: string]: boolean;
  }>({});
  const [suggestionShown, setSuggestionShown] = useState<{
    [key: string]: boolean;
  }>({});

  // --- Odysee slow load ---
  const [slowLoadWarning, setSlowLoadWarning] = useState(false);
  const slowLoadTimerRef = useRef<NodeJS.Timeout | null>(null);

  const durationsRef = useRef<{ [key: string]: number }>({});

  const currentEpisodeDetails = validEpisodes[currentIndex];

  // Odysee timeout: reset mỗi khi đổi tập
  useEffect(() => {
    setSlowLoadWarning(false);
    if (slowLoadTimerRef.current) clearTimeout(slowLoadTimerRef.current);

    const isOdysee = currentEpisodeDetails?.src?.includes("odysee.com");
    if (isOdysee) {
      slowLoadTimerRef.current = setTimeout(() => {
        setSlowLoadWarning(true);
      }, 9000); // 9  s giây chưa load xong → cảnh báo
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

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Đóng trình phát"
            id="close-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative w-full aspect-video min-h-[340px] sm:min-h-[420px] bg-black overflow-hidden">
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

        <div className="p-3 bg-slate-900/30 border-t border-slate-905 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>
            Tổng số tập có video:{" "}
            <strong className="text-white">{validEpisodes.length} Tập</strong>
          </span>
          <span>
            Tập đang xem:{" "}
            <strong className="text-amber-500">
              {currentIndex + 1} / {validEpisodes.length}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
