"use client";

import { useState } from "react";
import { getYouTubeId } from "../../lib/youtube";

type CustomVideoPlayerProps = {
  videoUrl: string;
  title: string;
  accentColor?: string;
};

export default function CustomVideoPlayer({ videoUrl, title, accentColor }: CustomVideoPlayerProps) {
  const videoId = getYouTubeId(videoUrl);
  const [isPlaying, setIsPlaying] = useState(false);
  const [thumbUrl, setThumbUrl] = useState(
    videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : ""
  );

  const spotColor = accentColor || "#0099ff";

  if (!videoId) {
    return (
      <div
        className="w-full py-20 px-8 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed relative overflow-hidden animate-scale-in"
        style={{
          borderColor: "var(--color-hairline)",
          background: "linear-gradient(135deg, rgba(20, 20, 20, 0.4) 0%, rgba(28, 28, 28, 0.2) 100%)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div 
          className="absolute -inset-10 bg-radial-gradient from-[var(--spot-glow)]/5 to-transparent blur-3xl pointer-events-none animate-pulse-glow" 
          style={{
            // @ts-ignore
            '--spot-glow': spotColor
          }}
        />
        <div className="relative z-10 space-y-4 max-w-md">
          <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center border border-[var(--color-hairline)] bg-neutral-900/60">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={spotColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 7a2 2 0 0 0-2.45-1.45L16 7V5a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2l4.55 1.45A2 2 0 0 0 23 17V7z" />
            </svg>
          </div>
          <h3 className="text-headline font-bold" style={{ color: "var(--color-ink)" }}>
            Video Lesson Coming Soon
          </h3>
          <p className="text-body-sm max-w-sm mx-auto leading-relaxed" style={{ color: "var(--color-ink-muted)" }}>
            We are hard at work productionizing this lesson. In the meantime, you can explore the notes and interactive quiz below.
          </p>
        </div>
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`;

  return (
    <div
      className="w-full rounded-2xl overflow-hidden border shadow-2xl transition-all duration-300 hover:border-neutral-700 animate-scale-in relative group"
      style={{
        borderColor: "var(--color-hairline)",
        background: "var(--color-surface-1)",
      }}
    >
      {/* Dynamic Atmospheric Spotlight Aura behind browser frame */}
      <div 
        className="absolute -inset-10 bg-radial-gradient from-[var(--spotlight-color)]/8 to-transparent blur-3xl pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity duration-500"
        style={{
          // @ts-ignore
          '--spotlight-color': spotColor
        }}
      />

      {/* Browser Chrome Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b select-none relative z-10"
        style={{
          background: "var(--color-surface-2)",
          borderColor: "var(--color-hairline)",
        }}
      >
        {/* Window Dots */}
        <div className="flex items-center gap-1.5 w-1/4">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        
        {/* Active Tab / Address bar */}
        <div
          className="flex items-center justify-center gap-2 px-3 py-1 text-[11px] font-semibold rounded-md border text-ink-muted w-1/2 md:w-2/5 truncate"
          style={{
            background: "var(--color-canvas)",
            borderColor: "var(--color-hairline)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse-glow" style={{ backgroundColor: spotColor }} />
          <span className="truncate font-mono tracking-tight">skilluni.edu/player/{videoId}</span>
        </div>

        {/* Right metadata info indicator */}
        <div className="w-1/4" />
      </div>

      {/* Video Player Container */}
      <div className="aspect-video w-full relative z-10 bg-black">
        {isPlaying ? (
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div 
            onClick={() => setIsPlaying(true)}
            className="w-full h-full relative cursor-pointer group/player overflow-hidden"
          >
            {/* Thumbnail Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbUrl}
              alt={title}
              onError={() => setThumbUrl(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`)}
              className="w-full h-full object-cover transition-transform duration-700 group-hover/player:scale-105"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover/player:bg-black/35 transition-colors duration-300" />
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative flex items-center justify-center">
                {/* Ping animation ring */}
                <div 
                  className="absolute -inset-4 rounded-full border border-white/20 animate-ping opacity-75 duration-1000"
                  style={{ animationDuration: '2s' }}
                />
                {/* Glow ring */}
                <div 
                  className="absolute -inset-2 rounded-full blur-md opacity-50 group-hover/player:opacity-80 transition-opacity duration-300"
                  style={{
                    background: spotColor
                  }}
                />
                {/* Circular Glassmorphic Button */}
                <div className="h-16 w-16 md:h-20 md:w-20 flex items-center justify-center rounded-full transition-all duration-300 shadow-2xl scale-100 group-hover/player:scale-110 bg-white/12 group-hover/player:bg-white/20 border border-white/24 backdrop-blur-md text-white relative z-10">
                  <svg 
                    className="h-7 w-7 text-white fill-current stroke-current" 
                    style={{ strokeWidth: "1.5px", strokeLinejoin: "round" }}
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64a1 1 0 0 0-1.5.86z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
