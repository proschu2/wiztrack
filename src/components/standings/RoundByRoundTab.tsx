"use client";

import type { Game } from "@/types/game";
import { calculateRoundScore } from "@/lib/scoring";

interface RoundByRoundTabProps {
  game: Game | null;
}

interface PlayerRoundData {
  bid: number | null;
  tricks: number | null;
  points: number | null;
}

/**
 * RoundByRoundTab - Shows detailed table with bid/tricks/points/cumulative
 */
export default function RoundByRoundTab({ game }: RoundByRoundTabProps) {
  if (!game) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Round by Round Details</h3>
        <p className="text-sm text-muted-foreground">No game data available</p>
      </div>
    );
  }

  const players = game.players;
  const rounds = game.rounds;

  // Calculate cumulative totals for each player across all scored rounds
  const cumulativeTotals: Record<string, number> = {};
  players.forEach((p) => {
    let total = 0;
    rounds.forEach((round) => {
      if (round.phase === 'scored') {
        const bidEntry = round.bids.find((b) => b.playerId === p.id);
        const tricks = round.tricksWon[p.id];
        if (bidEntry !== undefined && tricks !== undefined) {
          total += calculateRoundScore(bidEntry.tricks, tricks).points;
        }
      }
    });
    cumulativeTotals[p.id] = total;
  });

  // Helper to get player round data
  function getPlayerRoundData(
    round: (typeof rounds)[0],
    playerId: string
  ): PlayerRoundData {
    const bidEntry = round.bids.find((b) => b.playerId === playerId);
    const bid = bidEntry?.tricks ?? null;
    const tricks = round.tricksWon[playerId] ?? null;

    let points: number | null = null;
    if (bid !== null && tricks !== null) {
      points = calculateRoundScore(bid, tricks).points;
    }

    return { bid, tricks, points };
  }

  // Render cell content based on round phase
  function renderCellContent(
    roundData: PlayerRoundData,
    phase: 'bidding' | 'tricks' | 'scored'
  ): string {
    const { bid, tricks, points } = roundData;

    // Phase: bidding - only show bid if locked
    if (phase === 'bidding') {
      if (bid !== null) {
        return `B:${bid}`;
      }
      return '-';
    }

    // Phase: tricks - show bid + in progress
    if (phase === 'tricks') {
      if (bid !== null) {
        if (tricks !== null) {
          return `B:${bid} W:${tricks} ...`;
        }
        return `B:${bid} (in progress)`;
      }
      return '-';
    }

    // Phase: scored - show full data
    if (phase === 'scored') {
      if (bid !== null && tricks !== null && points !== null) {
        return `B:${bid} W:${tricks} P:${points >= 0 ? '+' + points : points}`;
      }
      return '-';
    }

    return '-';
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Round by Round Details</h3>

      {/* Landscape hint - show on mobile portrait only */}
      <div className="md:hidden text-xs text-muted-foreground text-center">
        📱 Rotate device for better view
      </div>

      {/* Table container with horizontal scroll */}
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full text-sm min-w-[400px]">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-2 text-left font-medium whitespace-nowrap">
                Round
              </th>
              {players.map((p) => (
                <th
                  key={p.id}
                  className="p-2 text-left font-medium whitespace-nowrap min-w-[80px]"
                >
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rounds.map((round) => (
              <tr
                key={round.roundNumber}
                className="border-b hover:bg-muted/30"
              >
                <td className="p-2 font-medium whitespace-nowrap">
                  {round.roundNumber}
                </td>
                {players.map((player) => {
                  const roundData = getPlayerRoundData(round, player.id);
                  return (
                    <td
                      key={player.id}
                      className="p-2 whitespace-nowrap font-mono text-xs"
                    >
                      {renderCellContent(roundData, round.phase)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 bg-muted/70 font-semibold">
              <td className="p-2 whitespace-nowrap">Total</td>
              {players.map((p) => {
                const total = cumulativeTotals[p.id] ?? 0;
                return (
                  <td
                    key={p.id}
                    className="p-2 whitespace-nowrap font-mono text-xs"
                  >
                    {total >= 0 ? `+${total}` : total}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Swipe hint - show on mobile only */}
      <p className="text-xs text-muted-foreground text-center md:hidden">
        ← swipe for more →
      </p>

      {/* Legend */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          <span className="font-medium">B</span> = Bid |{" "}
          <span className="font-medium">W</span> = Tricks Won |{" "}
          <span className="font-medium">P</span> = Points
        </p>
      </div>
    </div>
  );
}