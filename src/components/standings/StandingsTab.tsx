"use client";

import type { Game, Player } from "@/types/game";
import { calculateRoundScore } from "@/lib/scoring";

interface StandingsTabProps {
  game: Game | null;
}

/**
 * Player standings data with calculated totals
 */
interface PlayerStanding {
  player: Player;
  totalPoints: number;
  currentRoundBid: number | null;
  rank: number;
  isLeader: boolean;
}

/**
 * StandingsTab - Shows current rankings, player totals, current round bids
 * 
 * Features:
 * - Calculate cumulative scores from scored rounds only
 * - Sort players by total points (descending)
 * - Show current round bids if in bidding/tricks phase
 * - Highlight leader(s) with gold color
 * - Handle ties with same rank
 */
export default function StandingsTab({ game }: StandingsTabProps) {
  if (!game) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Current Standings</h3>
        <p className="text-muted-foreground">No game in progress</p>
      </div>
    );
  }

  // Calculate player standings
  const standings = calculateStandings(game);

  // Determine current round info
  const currentRound = game.rounds.length;
  const totalRounds = game.settings.totalRounds;
  const lastRound = game.rounds[game.rounds.length - 1];
  const showCurrentBids = lastRound && (lastRound.phase === "bidding" || lastRound.phase === "tricks");

  return (
    <div className="space-y-4">
      {/* Header with game progress */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Current Standings</h3>
        <p className="text-sm text-muted-foreground">
          Round {currentRound} of {totalRounds}
        </p>
      </div>

      {/* Standings list */}
      <div className="space-y-2">
        {standings.map((standing) => (
          <div
            key={standing.player.id}
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              standing.isLeader ? "bg-amber-500/20 border border-amber-500/30" : "bg-muted"
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Rank badge */}
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                  standing.isLeader
                    ? "bg-amber-500 text-amber-950"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {standing.rank}
              </div>

              {/* Player name */}
              <span
                className={`font-medium ${
                  standing.isLeader ? "text-amber-500 font-bold" : ""
                }`}
              >
                <span className="mr-2">{standing.player.emoji}</span>{standing.player.name}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Current round bid (if applicable) */}
              {showCurrentBids && standing.currentRoundBid !== null && (
                <span className="text-sm text-muted-foreground">
                  Bid: {standing.currentRoundBid}
                </span>
              )}

              {/* Total points */}
              <span
                className={`font-mono text-lg ${
                  standing.isLeader ? "text-amber-500 font-bold" : ""
                }`}
              >
                {standing.totalPoints} pts
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Legend for ties */}
      {hasTies(standings) && (
        <p className="text-xs text-muted-foreground text-center pt-2">
          Players with the same score share the same rank
        </p>
      )}
    </div>
  );
}

/**
 * Calculate standings for all players
 */
function calculateStandings(game: Game): PlayerStanding[] {
  // Build a map of playerId -> totalPoints
  const playerTotals: Record<string, number> = {};
  const playerCurrentBids: Record<string, number> = {};

  // Initialize for all players
  for (const player of game.players) {
    playerTotals[player.id] = 0;
    playerCurrentBids[player.id] = 0;
  }

  // Get the last round to check phase for current bids
  const lastRound = game.rounds[game.rounds.length - 1];
  const showCurrentBids = lastRound && (lastRound.phase === "bidding" || lastRound.phase === "tricks");

  // Process each scored round
  for (const round of game.rounds) {
    if (round.phase === "scored") {
      for (const bid of round.bids) {
        const tricksWon = round.tricksWon?.[bid.playerId] || 0;
        const scoreResult = calculateRoundScore(bid.tricks, tricksWon);
        playerTotals[bid.playerId] = (playerTotals[bid.playerId] || 0) + scoreResult.points;
      }
    }

    // Capture current round bids if in bidding or tricks phase
    if (showCurrentBids && round === lastRound) {
      for (const bid of round.bids) {
        playerCurrentBids[bid.playerId] = bid.tricks;
      }
    }
  }

  // Build standings array
  const standings: PlayerStanding[] = game.players.map((player) => ({
    player,
    totalPoints: playerTotals[player.id],
    currentRoundBid: showCurrentBids ? playerCurrentBids[player.id] : null,
    rank: 0, // Will be calculated after sorting
    isLeader: false,
  }));

  // Sort by total points descending
  standings.sort((a, b) => b.totalPoints - a.totalPoints);

  // Assign ranks with tie handling
  let currentRank = 1;
  for (let i = 0; i < standings.length; i++) {
    if (i > 0 && standings[i].totalPoints === standings[i - 1].totalPoints) {
      // Same score as previous, keep same rank
      standings[i].rank = standings[i - 1].rank;
    } else {
      standings[i].rank = currentRank;
    }
    currentRank++;
  }

  // Mark leaders (players with the highest score)
  const highestScore = standings.length > 0 ? standings[0].totalPoints : 0;
  for (const standing of standings) {
    standing.isLeader = standing.totalPoints === highestScore;
  }

  return standings;
}

/**
 * Check if there are any ties in the standings
 */
function hasTies(standings: PlayerStanding[]): boolean {
  if (standings.length < 2) return false;
  
  for (let i = 1; i < standings.length; i++) {
    if (standings[i].totalPoints === standings[i - 1].totalPoints) {
      return true;
    }
  }
  return false;
}