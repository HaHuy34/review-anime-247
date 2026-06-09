import React, { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Sparkles, Tv, AlertCircle } from "lucide-react";
import { AnimeSeries, DbEpisode } from "../types";

interface VideoModalProps {
  series: AnimeSeries;
  initialEpisodeIndex: number; // Index in the valid empty-filtered array
  onClose: () => void;
  triggerNotification: (msg: string, type: "success" | "error" | "info") => void;
}

export default function VideoModal({ series, initialEpisodeIndex, onClose, triggerNotification }: VideoModalProps) {
  // Filter out episodes that don't have valid source links representation
  const validEpisodes = series.episodes.filter((ep) => ep.src && ep.src.trim() !== "");
  
  const [currentIndex, setCurrentIndex] = useState<number>(initialEpisodeIndex);
  const [showNav, setShowNav] = useState<boolean>(true);
  const [showSuggestion, setShowSuggestion] = useState<boolean>(false);
  const [dismissedSuggestion, setDismissedSuggestion] = useState<{ [key: string]: boolean }>({});
  const [suggestionShown, setSuggestionShown] = useState<{ [key: string]: boolean }>({});
  
  const navTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const durationsRef = useRef<{ [key: string]: number }>({});

  // Reset timer on mouse move / action to show/hide Next/Prev buttons
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

  // Set up window message listener for Dailymotion events
  useEffect(() => {
    const handleDailymotionMessages = (event: MessageEvent) => {
      if (!event.origin.includes("dailymotion.com")) return;

      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (!data || !data.id) return;

        // data.id is the iframe ID we spawned
        // We look for events to manage the duration/progress bar status to show suggestion boxes
        if (data.event === "durationchange") {
          durationsRef.current[data.id] = data.duration;
        }

        if (data.event === "timeupdate") {
          const totalDuration = durationsRef.current[data.id] || 0;
          const currentTime = data.time;
          const remainingSeconds = totalDuration - currentTime;

          // If remaining time is less than 3 minutes (180s) and they haven't dismissed the prompt yet
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
            // Hide it if they rewinded
            setShowSuggestion(false);
          }
        }

        // Auto move to next episode when the current video ends
        if (data.event === "video_end" || data.event === "end") {
          setShowSuggestion(false);
          if (currentIndex < validEpisodes.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            triggerNotification(`🎉 Đang tự động chuyển sang tập tiếp theo!`, "success");
          } else {
            triggerNotification(`🎬 Bạn đã coi hết các tập hiện có của phần này!`, "info");
          }
        }
      } catch (e) {
        // Suppress parsing errors of non-JSON window messages
      }
    };

    window.addEventListener("message", handleDailymotionMessages);
    return () => {
      window.removeEventListener("message", handleDailymotionMessages);
    };
  }, [currentIndex, validEpisodes, dismissedSuggestion, suggestionShown]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" id="videoModal">
      {/* Modal Dark Overlay */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-300" 
        onClick={onClose} 
      />

      {/* Main Container Content */}
      <div 
        className="relative w-full max-w-4xl bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl z-10 transition-transform duration-300 scale-100 flex flex-col"
        onMouseMove={resetNavVisibilityTimer}
        onClick={resetNavVisibilityTimer}
        onTouchStart={resetNavVisibilityTimer}
      >
        
        {/* Top Header details */}
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
                {series.vietnameseTitle || series.title} • {currentEpisodeDetails.name}
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

        {/* Video Frame Canvas / Slider area */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          
          {/* Slides Carousel container */}
          <div 
            className="flex w-full h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {validEpisodes.map((ep, index) => {
              const iframeId = `dm-iframe-${index}`;
              const isCurrent = index === currentIndex;
              
              // We only render or load the active iframe to save bandwidth and improve smoothness
              const srcUrl = isCurrent 
                ? `${ep.src}${ep.src.includes("?") ? "&" : "?"}api=1&id=${iframeId}&autoplay=1` 
                : "about:blank";

              return (
                <div key={index} className="w-full h-full shrink-0 relative flex flex-col justify-center">
                  {isCurrent ? (
                    <iframe
                      id={iframeId}
                      src={srcUrl}
                      className="w-full h-full border-0 bg-black"
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

          {/* Navigation Overlay Buttons (Next/Prev) */}
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

          {/* Intelligent Suggestion Box popping up at the end of video */}
          {showSuggestion && (
            <div className="absolute bottom-6 right-6 p-4 sm:p-5 bg-slate-950/95 border border-slate-800 rounded-xl max-w-xs text-left shadow-2xl z-30 animate-pulse">
              <div className="flex items-start gap-2.5 mb-2.5">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-200 font-semibold leading-normal">
                  Sắp hết video hiện tại rồi! Bạn có muốn nhảy ngay sang tập mới không?
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

        {/* Bottom index tracks */}
        <div className="p-3 bg-slate-900/30 border-t border-slate-905 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Tổng số tập có video: <strong className="text-white">{validEpisodes.length} Tập</strong></span>
          <span>Tập đang xem: <strong className="text-amber-500">{currentIndex + 1} / {validEpisodes.length}</strong></span>
        </div>

      </div>
    </div>
  );
}
