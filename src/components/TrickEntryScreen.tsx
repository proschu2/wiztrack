 
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Check, X } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { loadGame, saveGame } from "@/lib/storage";
import { calculateRoundScore } from "@/lib/scoring";
import { getBiddingOrder } from "@/lib/dealerRotation";
import type { Game, Round } from "@/types";

interface TrickEntryScreenProps {
  roundNumber: number;
}

export default function TrickEntryScreen({ roundNumber }: TrickEntryScreenProps) {
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [tricks, setTricks] = useState<Record<string, number>>({});
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);

   
  useEffect(() => {
    const loadedGame = loadGame();
    if (!loadedGame) {
      router.push("/");
      return;
    }
    setGame(loadedGame);

    // Initialize tricks from round if available
    const round = loadedGame.rounds.find((r) => r.roundNumber === roundNumber);
    if (round) {
      // Only initialize tricks from saved data if:
      // 1. Round phase is 'scored' (already completed), AND
      // 2. tricksWon has actual entries
      const isAlreadyScored = round.phase === "scored";
      const hasExistingTricks = round.tricksWon && Object.keys(round.tricksWon).length > 0;
      
      if (isAlreadyScored && hasExistingTricks) {
        // Restoring a completed round
        const existingTricks: Record<string, number> = {};
        loadedGame.players.forEach((p) => {
          existingTricks[p.id] = round.tricksWon?.[p.id];
        });
        setTricks(existingTricks);
        setCurrentPlayerIndex(loadedGame.players.length); // Disable sequential entry for completed rounds
      } else {
        // Fresh round (bidding or tricks phase not yet completed)
        setTricks({});
        setCurrentPlayerIndex(0);
      }
    }
  }, [roundNumber, router]);

  const round = useMemo(() => {
    if (!game) return null;
    return game.rounds.find((r) => r.roundNumber === roundNumber);
  }, [game, roundNumber]);

  const playerScores = useMemo(() => {
    if (!game || !round) return new Map<string, number>();

    const scores = new Map<string, number>();
    game.players.forEach((player) => {
      const bid = round.bids.find((b) => b.playerId === player.id);
      const tricksWon = tricks[player.id] || 0;
      const score = calculateRoundScore(bid?.tricks || 0, tricksWon).points;
      scores.set(player.id, score);
    });
    return scores;
  }, [game, round, tricks]);

  const sumOfTricks = useMemo(() => {
    return Object.values(tricks).reduce((sum, t) => sum + t, 0);
  }, [tricks]);

  const allTricksPlaced = useMemo(() => {
    if (!game) return false;
    return game.players.every((p) => tricks[p.id] !== undefined);
  }, [game, tricks]);

  const isTricksValid = useMemo(() => {
    return sumOfTricks === (round?.totalTricks || 0);
  }, [sumOfTricks, round?.totalTricks]);

  const handleTrickChange = (playerId: string, value: number) => {
    setTricks((prev) => {
      const updatedTricks = { ...prev, [playerId]: value };

      // Advance to next player in bidding order who hasn't entered tricks yet
      if (game && round) {
        const biddingOrder = getBiddingOrder(round.dealer, game.players.length);
        const currentPlayerId = game.players[biddingOrder[currentPlayerIndex]]?.id;

        if (currentPlayerId === playerId) {
          // Find next player who hasn't entered tricks
          let nextIdx = currentPlayerIndex + 1;
          while (nextIdx < biddingOrder.length) {
            const nextPlayerId = game.players[biddingOrder[nextIdx]].id;
            if (updatedTricks[nextPlayerId] === undefined) {
              setCurrentPlayerIndex(nextIdx);
              break;
            }
            nextIdx++;
          }
        }
      }

      return updatedTricks;
    });
  };

  const playerResults = useMemo(() => {
    if (!game || !round) return [];

    // Calculate running totals up to (but not including) this round
    const runningTotals = new Map<string, number>();
    game.players.forEach((p) => runningTotals.set(p.id, 0));

    // Sum up scores from all previous scored rounds
    game.rounds
      .filter((r) => r.roundNumber < roundNumber && r.phase === "scored")
      .forEach((prevRound) => {
        prevRound.bids.forEach((bid) => {
          const tricksWon = prevRound.tricksWon?.[bid.playerId] || 0;
          const score = calculateRoundScore(bid.tricks, tricksWon).points;
          runningTotals.set(
            bid.playerId,
            (runningTotals.get(bid.playerId) || 0) + score
          );
        });
      });

    return game.players.map((player) => {
      const bid = round.bids.find((b) => b.playerId === player.id);
      const tricksWon = tricks[player.id] || 0;
      const roundScore = calculateRoundScore(bid?.tricks || 0, tricksWon);
      const previousTotal = runningTotals.get(player.id) || 0;
      const newTotal = previousTotal + roundScore.points;

      return {
        player,
        bid: bid?.tricks || 0,
        tricksWon,
        roundScore,
        previousTotal,
        newTotal,
      };
    });
  }, [game, round, tricks, roundNumber]);

  const handleConfirmResults = () => {
    if (!game || !round) return;

    const updatedRound: Round = {
      ...round,
      tricksWon: tricks,
      phase: "scored",
    };

    const nextState = roundNumber >= game.settings.totalRounds
      ? { phase: 'complete' as const }
      : { phase: 'bidding' as const, round: roundNumber + 1 };

    const updatedGame: Game = {
      ...game,
      rounds: game.rounds.map((r) =>
        r.roundNumber === roundNumber ? updatedRound : r
      ),
      currentState: nextState,
    };

    saveGame(updatedGame);
    setGame(updatedGame);
    setShowResults(true);
  };

  const handleNextRound = () => {
    if (!game) return;

    if (roundNumber >= game.settings.totalRounds) {
      router.push("/complete");
    } else {
      router.push(`/round/${roundNumber + 1}`);
    }
  };

  const handleEndGame = () => {
    router.push("/complete");
  };

  if (!game || !round) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              Round {roundNumber} - Trick Entry
            </CardTitle>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-muted-foreground">
                {round.cardsDealt} cards each • {round.totalTricks} total tricks
              </p>
              <p className="text-xs text-muted-foreground">
                Enter tricks won for each player
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Validation Status */}
            <div
              className={`flex items-center justify-center gap-2 rounded-lg p-3 ${
                allTricksPlaced
                  ? isTricksValid
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-muted"
              }`}
            >
              {allTricksPlaced ? (
                isTricksValid ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {sumOfTricks} / {round.totalTricks} tricks ✅
                    </span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {sumOfTricks} / {round.totalTricks} tricks (expected{" "}
                      {round.totalTricks})
                    </span>
                  </>
                )
              ) : (
                <span className="text-sm text-muted-foreground">
                  {Object.keys(tricks).length} / {game.players.length} players
                  entered
                </span>
              )}
            </div>

            {/* Tricks Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/5">Player</TableHead>
                  <TableHead className="w-1/5">Bid</TableHead>
                  <TableHead className="w-2/5">Tricks Won</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {game.players.map((player) => {
                  const bid = round.bids.find((b) => b.playerId === player.id);
                  const biddingOrder = getBiddingOrder(round.dealer, game.players.length);
                  const currentPlayerId = biddingOrder[currentPlayerIndex] !== undefined 
                    ? game.players[biddingOrder[currentPlayerIndex]]?.id 
                    : null;
                  const isCurrentPlayer = player.id === currentPlayerId && !showResults;

                  return (
                    <TableRow key={player.id}>
                      <TableCell className="font-medium">
                        <span className="mr-2">{player.emoji}</span>{player.name}
                        {isCurrentPlayer && (
                          <span className="ml-2 text-xs text-primary">(entering...)</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          bid:{bid?.tricks ?? 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={
                            tricks[player.id] !== undefined
                              ? String(tricks[player.id])
                              : ""
                          }
                          disabled={!isCurrentPlayer}
                          onValueChange={(val) =>
                            handleTrickChange(player.id, parseInt(val || "0", 10))
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Tricks" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from(
                              { length: round.cardsDealt + 1 },
                              (_, i) => i
                            ).map((num) => (
                              <SelectItem key={num} value={String(num)}>
                                {num}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Live Scores */}
            <div className="rounded-lg bg-muted p-4">
              <h3 className="text-sm font-medium mb-3">Round Scores</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {game.players.map((player) => {
                  const score = playerScores.get(player.id);
                  const bid = round.bids.find((b) => b.playerId === player.id);
                  const isExact =
                    score !== undefined &&
                    Math.abs(
                      (bid?.tricks ?? 0) - (tricks[player.id] || 0)
                    ) === 0;

                  return (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between rounded-lg p-2 ${
                        score !== undefined && score > 0
                          ? "bg-green-100 dark:bg-green-900/30"
                          : score !== undefined && score < 0
                          ? "bg-red-100 dark:bg-red-900/30"
                          : "bg-background"
                      }`}
                    >
                      <span className="text-sm font-medium"><span className="mr-1">{player.emoji}</span>{player.name}</span>
                      <div className="flex items-center gap-2">
                        {score !== undefined && (
                          <>
                            <span
                              className={`text-sm ${
                                score > 0
                                  ? "text-green-700 dark:text-green-400"
                                  : score < 0
                                  ? "text-red-700 dark:text-red-400"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {score > 0 ? "+" : ""}
                              {score}
                            </span>
                            {isExact && (
                              <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                            )}
                          </>
                        )}
                        {score === undefined && (
                          <span className="text-xs text-muted-foreground">
                            ...
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            {!showResults ? (
              <div className="flex flex-col gap-3">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleConfirmResults}
                  disabled={!allTricksPlaced || !isTricksValid}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Confirm Results
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Inline Results */}
                <div className="rounded-lg bg-muted p-4">
                  <h3 className="text-sm font-medium mb-3">
                    Round {roundNumber} Results
                  </h3>
                  <div className="grid gap-2">
                    {playerResults.map((result) => {
                      const isMadeBid = result.roundScore.points >= 0;
                      return (
                        <div
                          key={result.player.id}
                          className="flex items-center justify-between rounded-lg bg-background p-3"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">
                              <span className="mr-2">{result.player.emoji}</span>{result.player.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Bid: {result.bid} • Tricks: {result.tricksWon}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span
                              className={`text-sm font-semibold ${
                                isMadeBid
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {result.roundScore.points >= 0 ? "+" : ""}
                              {result.roundScore.points}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Total: {result.newTotal}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Next Round Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={
                    roundNumber >= game.settings.totalRounds
                      ? handleEndGame
                      : handleNextRound
                  }
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  {roundNumber >= game.settings.totalRounds
                    ? "End Game"
                    : "Next Round"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}