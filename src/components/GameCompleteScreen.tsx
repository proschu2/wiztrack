"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, RotateCcw } from "lucide-react";
import { loadGame, clearGame } from "@/lib/storage";
import { calculateRoundScore } from "@/lib/scoring";
import type { Game, Player, Round, Bid } from "@/types";

interface RankedPlayer {
  player: Player;
  totalScore: number;
  rank: number;
  tieBreaker: string;
}

export default function GameCompleteScreen() {
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);

   
  useEffect(() => {
    const loadedGame = loadGame();
    if (!loadedGame) {
      // No game found, redirect to home
      return;
    }
    setGame(loadedGame);
  }, []);

  const rankedPlayers = useMemo((): RankedPlayer[] => {
    if (!game) return [];

    // Calculate total scores for each player
    const playerScores = new Map<string, number>();
    game.players.forEach((player: Player) => {
      let totalScore = 0;
      game.rounds.forEach((round: Round) => {
        if (round.phase === "scored") {
          const bid = round.bids.find((b: Bid) => b.playerId === player.id);
          const tricksWon = round.tricksWon?.[player.id] || 0;
          if (bid) {
            const score = calculateRoundScore(bid.tricks, tricksWon).points;
            totalScore += score;
          }
        }
      });
      playerScores.set(player.id, totalScore);
    });

    // Create ranking entries
    const entries: RankedPlayer[] = game.players.map((player: Player) => ({
      player,
      totalScore: playerScores.get(player.id) || 0,
      rank: 0,
      tieBreaker: "",
    }));

    // Sort by score descending
    entries.sort((a, b) => b.totalScore - a.totalScore);

    // Assign ranks with tie handling
    let currentRank = 1;
    let tieCount = 0;
    let prevScore: number | null = null;

    entries.forEach((entry) => {
      if (prevScore === null || entry.totalScore === prevScore) {
        tieCount++;
        prevScore = entry.totalScore;
      } else {
        currentRank += tieCount;
        tieCount = 1;
        prevScore = entry.totalScore;
      }
      entry.rank = currentRank;
    });

    return entries;
  }, [game]);

  const winners = useMemo(() => {
    if (rankedPlayers.length === 0) return [];
    const topScore = rankedPlayers[0].totalScore;
    return rankedPlayers
      .filter((p) => p.totalScore === topScore)
      .map((p) => p.player.name);
  }, [rankedPlayers]);

  const handleNewGame = () => {
    clearGame();
    router.push("/");
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">🎉 Game Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <p className="text-muted-foreground">
                No game data found. Start a new game to begin.
              </p>
              <Button className="w-full" size="lg" onClick={handleNewGame}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Start New Game
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <Trophy className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <CardTitle className="text-2xl">🎉 Game Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Winner Announcement */}
            <div className="rounded-lg bg-primary/10 p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {winners.length > 1 ? "Winners" : "Winner"}
              </p>
              <p className="text-2xl font-bold">
                {winners.join(" & ")}
              </p>
              <p className="text-lg font-semibold text-primary mt-2">
                {rankedPlayers[0]?.totalScore} points
              </p>
              {winners.length > 1 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Shared 1st place
                </p>
              )}
            </div>

            {/* Final Scores Table */}
            <div>
              <h3 className="text-sm font-medium mb-3">Final Scores</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/6">Rank</TableHead>
                    <TableHead className="w-3/6">Player</TableHead>
                    <TableHead className="w-2/6 text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankedPlayers.map((entry) => (
                    <TableRow key={entry.player.id}>
                      <TableCell>
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            entry.rank === 1
                              ? "bg-yellow-500 text-white"
                              : entry.rank === 2
                              ? "bg-gray-400 text-white"
                              : entry.rank === 3
                              ? "bg-amber-600 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {entry.rank}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.player.emoji} {entry.player.name}
                        {entry.rank === 1 && (
                          <span className="ml-2">👑</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {entry.totalScore}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Game Stats */}
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground text-center">
                {game.settings.playerCount} players • {game.settings.totalRounds}{" "}
                rounds • {game.rounds.length} rounds played
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              className="w-full"
              size="lg"
              onClick={handleNewGame}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              New Game
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}