"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { Game } from "@/types/game";
import { calculateRoundScore } from "@/lib/scoring";

interface TrendsTabProps {
  game: Game | null;
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

export default function TrendsTab({ game }: TrendsTabProps) {
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);

  if (!game) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Score Trends</h3>
        <p className="text-muted-foreground">No game in progress</p>
      </div>
    );
  }

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

  // Prepare data for Recharts
  const chartData = prepareChartData(game);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Score Trends</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="round"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "currentColor" }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "currentColor" }}
            label={{
              value: "Score",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 12 },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
            }}
          />
          <Legend />
          {game.players.map((player, index) => (
            <Line
              key={player.id}
              type="monotone"
              dataKey={player.name}
              stroke={PLAYER_COLORS[index % PLAYER_COLORS.length]}
              strokeWidth={2.5}
              dot={{ r: 5, strokeWidth: 2 }}
              activeDot={{ r: 7, strokeWidth: 2 }}
              connectNulls
              onMouseEnter={() => setHoveredPlayer(player.id)}
              onMouseLeave={() => setHoveredPlayer(null)}
              style={{
                opacity: hoveredPlayer && hoveredPlayer !== player.id ? 0.3 : 1,
                transition: "opacity 0.2s",
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function prepareChartData(game: Game): { round: number; [key: string]: number | string }[] {
  const scoredRounds = game.rounds.filter((r) => r.phase === "scored");
  const data: { round: number; [key: string]: number | string }[] = [
    { round: 0 },
  ];

  // Initialize scores for round 0
  game.players.forEach((player) => {
    data[0][player.name] = 0;
  });

  // Calculate cumulative scores per round
  scoredRounds.forEach((round) => {
    const roundData: { round: number; [key: string]: number | string } = {
      round: round.roundNumber,
    };

    game.players.forEach((player) => {
      // Get previous cumulative score
      const prevData = data[data.length - 1];
      const prevScore = (prevData[player.name] as number) || 0;

      // Calculate this round's score
      const bid = round.bids.find((b) => b.playerId === player.id);
      let roundScore = 0;
      if (bid) {
        const tricksWon = round.tricksWon?.[bid.playerId] || 0;
        const scoreResult = calculateRoundScore(bid.tricks, tricksWon);
        roundScore = scoreResult.points;
      }

      roundData[player.name] = prevScore + roundScore;
    });

    data.push(roundData);
  });

  return data;
}
