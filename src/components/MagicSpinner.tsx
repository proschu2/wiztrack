"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface MagicSpinnerProps {
  isSpinning: boolean;
  message?: string;
  fullScreen?: boolean;
}

export function MagicSpinner({ isSpinning, message, fullScreen = false }: MagicSpinnerProps) {
  if (!isSpinning) return null;

  const containerClass = fullScreen
    ? "fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
    : "absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg";

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-3">
        {/* Rotating Magic Staff SVG */}
        <div className="relative w-16 h-16">
          {/* Glow effect */}
          <div className="absolute inset-0 animate-ping opacity-20">
            <div className="w-full h-full rounded-full bg-primary" />
          </div>
          {/* Staff */}
          <svg
            viewBox="0 0 64 64"
            className={cn(
              "w-full h-full drop-shadow-lg",
              "animate-[spin_2s_linear_infinite]"
            )}
            style={{
              animation: "spin 2s linear infinite",
              filter: "drop-shadow(0 0 8px rgba(147, 51, 234, 0.5))",
            }}
          >
            {/* Staff pole */}
            <rect x="29" y="20" width="6" height="38" rx="2" fill="#8B5A2B" />
            {/* Staff head orb */}
            <circle cx="32" cy="14" r="10" fill="#9333EA" />
            <circle cx="32" cy="14" r="7" fill="#A855F7" />
            <circle cx="32" cy="14" r="4" fill="#C084FC" />
            {/* Magical sparkle */}
            <circle cx="29" cy="11" r="2" fill="white" opacity="0.8" />
            {/* Gems on staff */}
            <circle cx="32" cy="35" r="3" fill="#F59E0B" />
            <circle cx="32" cy="48" r="2.5" fill="#10B981" />
          </svg>
        </div>
        {message && (
          <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
        )}
      </div>
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Hook for managing save state
import { useState, useCallback } from "react";
import type { Game } from "@/types/game";

export function useSaveWithSpinner(
  saveFn: (game: Game) => boolean,
  delay = 300
) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);

  const save = useCallback(
    (game: Game): boolean => {
      setIsSaving(true);
      
      // Simulate minimum save time for visibility
      const result = saveFn(game);
      
      setTimeout(() => {
        setIsSaving(false);
        setLastSaveTime(Date.now());
      }, delay);
      
      return result;
    },
    [saveFn, delay]
  );

  return { save, isSaving, lastSaveTime };
}