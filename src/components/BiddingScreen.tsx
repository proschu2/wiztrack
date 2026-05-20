 
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
import { Lock, AlertCircle, Check } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { loadGame, saveGame } from "@/lib/storage";
import { getFirstBidder, getBiddingOrder } from "@/lib/dealerRotation";
import { getCardsPerPlayer } from "@/lib/roundCalc";
import { calculateRoundScore } from "@/lib/scoring";
import MenuModal from "@/components/MenuModal";
import type { Game, Round, Bid, Player } from "@/types";

interface BiddingScreenProps {
  roundNumber: number;
}

export default function BiddingScreen({ roundNumber }: BiddingScreenProps) {
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [bids, setBids] = useState<Record<string, number>>({});
  const [currentBidderIndex, setCurrentBidderIndex] = useState(0);
  const [bidsLocked, setBidsLocked] = useState(false);
  const [showLockConfirmation, setShowLockConfirmation] = useState(false);

   
  useEffect(() => {
    const loadedGame = loadGame();
    if (!loadedGame) {
      router.push("/");
      return;
    }
    setGame(loadedGame);

    // Initialize or load round
    const initialDealer = loadedGame.settings.initialDealer;
    const round = loadedGame.rounds.find((r: Round) => r.roundNumber === roundNumber);
    if (round) {
      // Load existing bids
      const existingBids: Record<string, number> = {};
      round.bids.forEach((bid: { playerId: string; tricks: number }) => {
        existingBids[bid.playerId] = bid.tricks;
      });
      setBids(existingBids);
      setBidsLocked(round.bidsLocked);

      // Set current bidder to the next person who hasn't bid
      if (!round.bidsLocked) {
        const biddingOrder = getBiddingOrder(round.dealer, loadedGame.players.length);
        const nextBidderIdx = biddingOrder.findIndex(
          (idx) => !existingBids[loadedGame.players[idx].id]
        );
        setCurrentBidderIndex(nextBidderIdx >= 0 ? nextBidderIdx : 0);
      }
    } else {
      // Create new round
      const newRound: Round = {
        roundNumber,
        cardsDealt: getCardsPerPlayer(roundNumber),
        totalTricks: getCardsPerPlayer(roundNumber),
        phase: "bidding",
        bidsLocked: false,
        bids: [],
        tricksWon: {},
        dealer: (initialDealer + roundNumber - 1) % loadedGame.players.length,
        firstBidder: getFirstBidder(
          (initialDealer + roundNumber - 1) % loadedGame.players.length,
          loadedGame.players.length
        ),
      };
      loadedGame.rounds.push(newRound);
      saveGame(loadedGame);
      setGame(loadedGame);
    }
  }, [roundNumber, router]);

  const round = useMemo(() => {
    if (!game) return null;
    return (
      game.rounds.find((r: Round) => r.roundNumber === roundNumber) ||
      game.rounds[game.rounds.length - 1]
    );
  }, [game, roundNumber]);

  const biddingOrder = useMemo(() => {
    if (!round) return [];
    return getBiddingOrder(round.dealer, game?.players.length || 0);
  }, [round, game?.players.length]);

  // Players sorted by bidding order (first bidder first, dealer last)
  const playersInBiddingOrder = useMemo(() => {
    if (!game || !round) return [];
    const order = getBiddingOrder(round.dealer, game.players.length);
    return order.map((idx) => game.players[idx]);
  }, [game, round]);

  const currentBidder = useMemo(() => {
    if (!game || biddingOrder.length === 0) return null;
    return game.players[biddingOrder[currentBidderIndex]];
  }, [game, biddingOrder, currentBidderIndex]);

  const lastBidder = useMemo(() => {
    if (!game || biddingOrder.length === 0) return null;
    return game.players[biddingOrder[biddingOrder.length - 1]];
  }, [game, biddingOrder]);

  const sumOfBids = useMemo(() => {
    return Object.values(bids).reduce((sum, bid) => sum + bid, 0);
  }, [bids]);

  const isBidsValid = useMemo(() => {
    if (Object.keys(bids).length < (game?.players.length || 0)) return false;
    return sumOfBids !== (round?.totalTricks || 0);
  }, [bids, game?.players.length, round?.totalTricks, sumOfBids]);

  const allBidsPlaced = useMemo(() => {
    if (!game) return false;
    return game.players.every((p: Player) => bids[p.id] !== undefined);
  }, [game, bids]);

  const maxBid = round?.roundNumber ?? 0; // Round X = max bid X

  const handleBidChange = (playerId: string, value: number) => {
    setBids((prev) => ({ ...prev, [playerId]: value }));

    // Advance to next bidder (unless it's the dealer/last player)
    if (game && playersInBiddingOrder.length > 0) {
      const currentPlayer = playersInBiddingOrder[currentBidderIndex];
      const isLastPlayer = currentBidderIndex === playersInBiddingOrder.length - 1;
      
      if (!isLastPlayer && currentPlayer?.id === playerId) {
        setCurrentBidderIndex((prev) => prev + 1);
      }
    }
  };

  const handleLockBids = () => {
    if (!game || !round) return;

    const bidRecords: Bid[] = game.players.map((player) => ({
      playerId: player.id,
      tricks: bids[player.id] || 0,
    }));

    const updatedRound: Round = {
      ...round,
      bids: bidRecords,
      bidsLocked: true,
      phase: "tricks",
    };

    const updatedGame: Game = {
      ...game,
      rounds: game.rounds.map((r: Round) =>
        r.roundNumber === roundNumber ? updatedRound : r
      ),
    };

    saveGame(updatedGame);
    setGame(updatedGame);
    setBidsLocked(true);
    setShowLockConfirmation(true);
    // Hide confirmation after 2 seconds
    setTimeout(() => setShowLockConfirmation(false), 2000);
  };

  const handleNextRound = () => {
    if (!game || !round) return;

    // Create tricksWon records
    const tricksWon: Record<string, number> = {};
    game.players.forEach((p: Player) => {
      tricksWon[p.id] = 0;
    });

    const updatedRound: Round = {
      ...round,
      phase: "scored",
      tricksWon,
    };

    const updatedGame: Game = {
      ...game,
      rounds: game.rounds.map((r: Round) =>
        r.roundNumber === roundNumber ? updatedRound : r
      ),
    };

    // Calculate scores
    round.bids.forEach((bid: Bid) => {
      const score = calculateRoundScore(
        bid.tricks,
        tricksWon[bid.playerId] || 0
      );
    });

    saveGame(updatedGame);
    setGame(updatedGame);

    // Navigate to trick entry
    router.push(`/trick/${roundNumber}`);
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
      <MenuModal />
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Round {roundNumber}</CardTitle>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-muted-foreground">
                {round.cardsDealt} cards each • {round.totalTricks} total tricks
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <span>🎴 Dealer:</span>
                  <span className="font-medium text-foreground">{game.players[round.dealer]?.name}</span>
                </span>
                <span className="mx-2">•</span>
                <span className="inline-flex items-center gap-1">
                  <span>→ Starts bidding:</span>
                  <span className="font-medium text-foreground">{game.players[round.firstBidder]?.name}</span>
                </span>
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Validation Status */}
            <div
              className={`flex items-center justify-center gap-2 rounded-lg p-3 ${
                allBidsPlaced
                  ? isBidsValid
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-muted"
              }`}
            >
              {allBidsPlaced ? (
                isBidsValid ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {sumOfBids} bids / {round.totalTricks} tricks ❌
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {sumOfBids} bids / {round.totalTricks} tricks ✅
                    </span>
                  </>
                )
              ) : (
                <span className="text-sm text-muted-foreground">
                  {Object.keys(bids).length} / {game.players.length} bids placed
                </span>
              )}
            </div>

            {/* Bidding Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/3">Player</TableHead>
                  <TableHead className="w-1/3">Bid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playersInBiddingOrder.map((player, displayIndex) => {
                  // Find original index in game.players
                  const originalIndex = game.players.findIndex(p => p.id === player.id);
                  const isCurrentBidder = displayIndex === currentBidderIndex && !bidsLocked;
                  const isLastPlayer = displayIndex === playersInBiddingOrder.length - 1;
                  const isDealer = originalIndex === round.dealer;
                  const isFirstBidder = originalIndex === round.firstBidder;

                  return (
                    <TableRow key={player.id}>
                      <TableCell className="font-medium">
                        <span className="mr-2">{player.emoji}</span>{player.name}
                        {isDealer && (
                          <span className="ml-2 text-xs" title="Dealer">
                            🎴
                          </span>
                        )}
                        {isCurrentBidder && (
                          <span className="ml-2 text-xs text-primary">
                            (bidding...)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {bidsLocked ? (
                          <span className="text-lg font-semibold">
                            {bids[player.id] ?? 0}
                          </span>
                        ) : (
                          <Select
                            value={
                              bids[player.id] !== undefined
                                ? String(bids[player.id])
                                : ""
                            }
                            onValueChange={(val) =>
                              handleBidChange(player.id, parseInt(val || '0', 10))
                            }
                            disabled={!isCurrentBidder}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select bid" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: maxBid + 1 }, (_, i) => i)
                              .filter((num) => {
                                // Last player cannot bid exactly what's needed for others
                                if (!isLastPlayer) return true;
                                const placedBidsSum = Object.values(bids).reduce((sum, b) => sum + b, 0);
                                return num !== round.totalTricks - placedBidsSum;
                              })
                              .map((num) => (
                                <SelectItem key={num} value={String(num)}>
                                  {num}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Lock Confirmation */}
            {showLockConfirmation && (
              <div className="flex items-center justify-center gap-2 p-3 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-lg animate-pulse">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Bids Locked!</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3">
              {!bidsLocked ? (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleLockBids}
                  disabled={!allBidsPlaced || !isBidsValid}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Lock Bids
                </Button>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleNextRound}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Continue to Trick Entry
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}