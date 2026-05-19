"use client";

import { useState } from "react";
import type { Game, Player } from "@/types/game";
import { calculateRoundScore } from "@/lib/scoring";

interface TrendsTabProps {
  game: Game | null;
}

interface DataPoint {
  round: number;
  cumulativeScore: number;
}

interface PlayerTrendData {
  player: Player;
  color: string;
  points: DataPoint[];
}

interface TooltipData {
  player: Player;
  round: number;
  score: number;
  x: number;
  y: number;
}

// Predefined color palette for players
const PLAYER_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#22c55e", // green
  "#a855f7", // purple
  "#f97316", // orange
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#eab308", // yellow
];

/**
 * TrendsTab - Shows SVG line chart with score evolution per round
 *
 * Features:
 * - X-axis: Round numbers (0 = start, then 1, 2, 3...)
 * - Y-axis: Cumulative scores
 * - One colored line per player with dots at data points
 * - Tooltip on hover showing player name, round, and score
 * - Responsive SVG that scales with container
 */
export default function TrendsTab({ game }: TrendsTabProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  if (!game) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Score Trends</h3>
        <p className="text-muted-foreground">No game in progress</p>
      </div>
    );
  }

  // Calculate trend data for all players
  const trendData = calculateTrendData(game);

  // If no scored rounds yet, show placeholder
  const scoredRounds = game.rounds.filter((r) => r.phase === "scored");
  if (scoredRounds.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Score Trends</h3>
        <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
          <p className="text-muted-foreground">Complete rounds to see score trends</p>
        </div>
      </div>
    );
  }

  // Chart dimensions
  const width = 600;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate data ranges
  const maxRound = scoredRounds.length;
  const allScores = trendData.flatMap((p) => p.points.map((pt) => pt.cumulativeScore));
  const minScore = Math.min(0, ...allScores);
  const maxScore = Math.max(0, ...allScores);
  const scoreRange = maxScore - minScore || 1; // Avoid division by zero

  // Scale functions
  const xScale = (round: number) => (round / maxRound) * chartWidth + padding.left;
  const yScale = (score: number) =>
    chartHeight - ((score - minScore) / scoreRange) * chartHeight + padding.top;

  // Generate axis labels
  const xLabels = Array.from({ length: maxRound + 1 }, (_, i) => i);
  const yLabelCount = 5;
  const yLabels = Array.from({ length: yLabelCount }, (_, i) => {
    const value = minScore + (scoreRange * i) / (yLabelCount - 1);
    return Math.round(value);
  });

  // Handle mouse events for tooltip
  const handlePointHover = (
    player: Player,
    round: number,
    score: number,
    event: React.MouseEvent<SVGCircleElement>
  ) => {
    const rect = (event.target as SVGCircleElement).getBoundingClientRect();
    setTooltip({
      player,
      round,
      score,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Score Trends</h3>

      {/* SVG Chart */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[300px]"
          style={{ aspectRatio: `${width}/${height}` }}
        >
          {/* Background */}
          <rect
            x={padding.left}
            y={padding.top}
            width={chartWidth}
            height={chartHeight}
            className="fill-muted/50"
          />

          {/* Grid lines */}
          {yLabels.map((label) => (
            <line
              key={`grid-${label}`}
              x1={padding.left}
              y1={yScale(label)}
              x2={width - padding.right}
              y2={yScale(label)}
              className="stroke-muted stroke-1"
            />
          ))}

          {/* Y-axis labels */}
          {yLabels.map((label) => (
            <text
              key={`y-label-${label}`}
              x={padding.left - 8}
              y={yScale(label)}
              className="fill-muted-foreground text-xs"
              textAnchor="end"
              dominantBaseline="middle"
            >
              {label}
            </text>
          ))}

          {/* X-axis labels */}
          {xLabels.map((round) => (
            <text
              key={`x-label-${round}`}
              x={xScale(round)}
              y={height - padding.bottom + 20}
              className="fill-muted-foreground text-xs"
              textAnchor="middle"
            >
              {round}
            </text>
          ))}

          {/* X-axis label */}
          <text
            x={width / 2}
            y={height - 5}
            className="fill-muted-foreground text-sm"
            textAnchor="middle"
          >
            Round
          </text>

          {/* Y-axis label */}
          <text
            x={12}
            y={height / 2}
            className="fill-muted-foreground text-sm"
            textAnchor="middle"
            transform={`rotate(-90, 12, ${height / 2})`}
          >
            Score
          </text>

          {/* Lines for each player */}
          {trendData.map((playerData) => {
            const points = playerData.points;
            if (points.length < 2) return null;

            const pathData = points
              .map((pt, i) => `${i === 0 ? "M" : "L"} ${xScale(pt.round)} ${yScale(pt.cumulativeScore)}`)
              .join(" ");

            return (
              <path
                key={playerData.player.id}
                d={pathData}
                fill="none"
                stroke={playerData.color}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}

          {/* Data points */}
          {trendData.map((playerData) =>
            playerData.points.map((pt) => (
              <circle
                key={`${playerData.player.id}-${pt.round}`}
                cx={xScale(pt.round)}
                cy={yScale(pt.cumulativeScore)}
                r={5}
                fill={playerData.color}
                stroke="white"
                strokeWidth={2}
                className="cursor-pointer transition-transform hover:scale-125"
                onMouseEnter={(e) =>
                  handlePointHover(playerData.player, pt.round, pt.cumulativeScore, e)
                }
                onMouseLeave={() => setTooltip(null)}
              />
            ))
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center">
        {trendData.map((playerData) => (
          <div key={playerData.player.id} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: playerData.color }}
            />
            <span className="text-sm">{playerData.player.name}</span>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-2 py-1 text-xs bg-popover border border-border rounded shadow-md pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y - 30 }}
        >
          <span className="font-medium">{tooltip.player.name}</span>
          <br />
          Round {tooltip.round}: {tooltip.score} pts
        </div>
      )}
    </div>
  );
}

/**
 * Calculate cumulative score trends for each player
 */
function calculateTrendData(game: Game): PlayerTrendData[] {
  const scoredRounds = game.rounds.filter((r) => r.phase === "scored");

  return game.players.map((player, index) => {
    const points: DataPoint[] = [{ round: 0, cumulativeScore: 0 }];
    let cumulative = 0;

    for (const round of scoredRounds) {
      const bid = round.bids.find((b) => b.playerId === player.id);
      if (bid) {
        const tricksWon = round.tricksWon?.[bid.playerId] || 0;
        const scoreResult = calculateRoundScore(bid.tricks, tricksWon);
        cumulative += scoreResult.points;
      }
      points.push({
        round: round.roundNumber,
        cumulativeScore: cumulative,
      });
    }

    return {
      player,
      color: PLAYER_COLORS[index % PLAYER_COLORS.length],
      points,
    };
  });
}