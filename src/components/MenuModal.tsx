"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { loadGame, clearGame } from "@/lib/storage";

const THEME_KEY = "wiztrack-theme";

function getTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function setTheme(theme: "dark" | "light") {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
  const current = getTheme();
  setTheme(current === "dark" ? "light" : "dark");
}

export function MenuModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRestartConfirmDialog, setShowRestartConfirmDialog] = useState(false);
  const [playerNamesForPrefill, setPlayerNamesForPrefill] = useState<string[]>([]);
  const [theme, setThemeState] = useState<"dark" | "light">("light");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setThemeState(getTheme());
  }, []);

  const handleThemeToggle = useCallback(() => {
    toggleTheme();
    setThemeState(getTheme());
  }, []);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  const handleMenuItemClick = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  const isStandingsPage = pathname === "/standings";

  const menuItems = [
    {
      label: isStandingsPage ? "Resume Game" : "Standings",
      onClick: () => {
        if (isStandingsPage) {
          router.push("/");
        } else {
          router.push("/standings");
        }
      },
    },
    {
      label: "New Game",
      onClick: () => {
        // Load current game to get player names for pre-fill
        const game = loadGame();
        if (game && game.players && game.players.length > 0) {
          setPlayerNamesForPrefill(game.players.map((p) => p.name));
        } else {
          setPlayerNamesForPrefill([]);
        }
        setShowConfirmDialog(true);
      },
    },
    {
      label: "Restart",
      onClick: () => {
        setShowRestartConfirmDialog(true);
      },
    },
  ];

  return (
    <>
      {/* Burger Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed top-4 left-4 z-50 p-2 rounded-lg",
          "text-2xl leading-none w-10 h-10 flex items-center justify-center",
          "bg-background/80 backdrop-blur-sm border border-border",
          "hover:bg-muted transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
        aria-label="Open menu"
        aria-expanded={isOpen}
      >
        <span className="sr-only">Menu</span>
        <span className="text-lg">⚔️</span>
      </button>

      {/* Theme Toggle Button */}
      <button
        onClick={handleThemeToggle}
        className={cn(
          "fixed top-4 left-[3.5rem] z-50 p-2 rounded-lg",
          "text-xl leading-none w-10 h-10 flex items-center justify-center",
          "bg-background/80 backdrop-blur-sm border border-border",
          "hover:bg-muted transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        <span className="sr-only">{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        <span className="text-lg">{theme === "dark" ? "☀️" : "🌙"}</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className={cn(
            "fixed inset-0 z-50",
            "flex items-center justify-center",
            "bg-black/60 backdrop-blur-sm"
          )}
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div
            className={cn(
              "relative w-full max-w-sm mx-4",
              "bg-background border-2 border-border rounded-xl",
              "shadow-2xl shadow-black/50",
              "animate-in fade-in zoom-in-95 duration-200"
            )}
            style={{
              boxShadow: "0 0 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
                className="h-8 w-8"
              >
                ✕
              </Button>
            </div>

            {/* Menu Items */}
            <nav className="p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={item.onClick}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-lg",
                        "text-sm font-medium",
                        "bg-muted/50 hover:bg-muted",
                        "transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      )}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Footer with Close button */}
            <div className="p-4 pt-0">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                [ Close ]
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for New Game */}
      {showConfirmDialog && (
        <div
          className={cn(
            "fixed inset-0 z-[60]",
            "flex items-center justify-center",
            "bg-black/70 backdrop-blur-sm"
          )}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowConfirmDialog(false);
            }
          }}
          role="alertdialog"
          aria-modal="true"
          aria-label="Confirm New Game"
        >
          <div
            className={cn(
              "relative w-full max-w-sm mx-4 p-6",
              "bg-background border-2 border-border rounded-xl",
              "shadow-2xl shadow-black/50",
              "animate-in fade-in zoom-in-95 duration-200"
            )}
            style={{
              boxShadow: "0 0 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2">New Game</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure? Current game will be lost.
            </p>
            <div className="flex gap-3">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  // Store player names in sessionStorage for pre-fill before clearing
                  if (playerNamesForPrefill.length > 0) {
                    sessionStorage.setItem(
                      "wiztrack_prefill_players",
                      JSON.stringify(playerNamesForPrefill)
                    );
                  }
                  // Clear the game from localStorage
                  clearGame();
                  // Navigate to setup page
                  setShowConfirmDialog(false);
                  setIsOpen(false);
                  router.push("/");
                }}
              >
                [ Yes ]
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowConfirmDialog(false);
                }}
              >
                [ Cancel ]
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Restart */}
      {showRestartConfirmDialog && (
        <div
          className={cn(
            "fixed inset-0 z-[60]",
            "flex items-center justify-center",
            "bg-black/70 backdrop-blur-sm"
          )}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowRestartConfirmDialog(false);
            }
          }}
          role="alertdialog"
          aria-modal="true"
          aria-label="Confirm Restart"
        >
          <div
            className={cn(
              "relative w-full max-w-sm mx-4 p-6",
              "bg-background border-2 border-border rounded-xl",
              "shadow-2xl shadow-black/50",
              "animate-in fade-in zoom-in-95 duration-200"
            )}
            style={{
              boxShadow: "0 0 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2">Restart</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Restart with same players? All rounds will be reset.
            </p>
            <div className="flex gap-3">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  // Load current game, keep players, reset rounds and status
                  const game = loadGame();
                  if (game) {
                    // Keep players, reset rounds and status
                    const updatedGame = {
                      ...game,
                      rounds: [],
                      status: "waiting",
                    };
                    // Save back to localStorage
                    localStorage.setItem("wiztrack_game", JSON.stringify(updatedGame));
                  }
                  setShowRestartConfirmDialog(false);
                  setIsOpen(false);
                  router.push("/round/1");
                }}
              >
                [ Yes ]
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowRestartConfirmDialog(false);
                }}
              >
                [ Cancel ]
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MenuModal;