"use client";

import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { loadGame } from "@/lib/storage";
import { calculateRoundScore } from "@/lib/scoring";
import { cn } from "@/lib/utils";

interface PlayerStanding {
  playerId: string;
  playerName: string;
  playerEmoji: string;
  totalPoints: number;
  rank: number;
}

export default function StandingsFooter() {
  const [standings, setStandings] = useState<PlayerStanding[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hasGame, setHasGame] = useState(false);

  useEffect(() => {
    const game = loadGame();
    if (game && game.status === "in_progress") {
      setHasGame(true);
      setStandings(calculateStandings(game));
    } else {
      setHasGame(false);
    }
  }, []);

  if (!hasGame || standings.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40",
        "bg-background/95 backdrop-blur-sm border-t border-border",
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "h-12" : "h-auto"
      )}
    >
      {/* Header - always visible */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors"
        aria-label={isCollapsed ? "Expand standings" : "Collapse standings"}
      >
        <span className="text-sm font-medium font-heading">🏆 Standings</span>
        {isCollapsed ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {/* Content - hidden when collapsed */}
      {!isCollapsed && (
        <div className="px-4 pb-3 space-y-2">
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${standings.length}, 1fr)` }}>
            {standings.map((player) => (
              <div
                key={player.playerId}
                className={cn(
                  "flex flex-col items-center p-2 rounded-lg",
                  "bg-muted/50",
                  player.isLeader && "bg-primary/10"
                )}
              >
                <span className="text-lg">{player.playerEmoji}</span>
                <span className="text-xs font-medium truncate max-w-full">{player.playerName}</span>
                <span className={cn(
                  "text-sm font-bold",
                  player.isLeader ? "text-primary" : "text-foreground"
                )}>
                  {player.totalPoints >= 0 ? "+" : ""}{player.totalPoints}
                </span>
                <span className="text-xs text-muted-foreground">#{player.rank}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function calculateStandings(game: ReturnType<typeof loadGame>): PlayerStanding[] {
  if (!game) return [];

  // Calculate cumulative scores for each player
  const playerScores = new Map<string, number>();
  game.players.forEach((p) => playerScores.set(p.id, 0));

  game.rounds
    .filter((r) => r.phase === "scored")
    .forEach((round) => {
      round.bids.forEach((bid) => {
        const tricksWon = round.tricksWon?.[bid.playerId] || 0;
        const score = calculateRoundScore(bid.tricks, tricksWon).points;
        playerScores.set(
          bid.playerId,
          (playerScores.get(bid.playerId) || 0) + score
        );
      });
    });

  // Create standings array
  const standings: PlayerStanding[] = game.players.map((p) => ({
    playerId: p.id,
    playerName: p.name,
    playerEmoji: p.emoji,
    totalPoints: playerScores.get(p.id) || 0,
    rank: 0,
    isLeader: false,
  }));

  // Sort by score descending
  standings.sort((a, b) => b.totalPoints - a.totalPoints);

  // Assign ranks (handle ties)
  let currentRank = 1;
  let prevScore: number | null = null;
  standings.forEach((s, index) => {
    if (prevScore !== null && s.totalPoints === prevScore) {
      // Same rank as previous
    } else {
      currentRank = index + 1;
    }
    s.rank = currentRank;
    prevScore = s.totalPoints;
  });

  // Mark leader(s)
  const topScore = standings[0]?.totalPoints || 0;
  standings.forEach((s) => {
    s.isLeader = s.totalPoints === topScore;
  });

  return standings;
}