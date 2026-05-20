"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus, Play, RotateCcw, Gamepad2 } from "lucide-react";
import { calculateRounds } from "@/lib/roundCalc";
import { saveGame, loadGame } from "@/lib/storage";
import { getResumeDestination } from "@/lib/gameState";
import { getRandomInitialDealer } from "@/lib/dealerRotation";
import MenuModal from "@/components/MenuModal";
import type { Game, Player } from "@/types";

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 6;
const DEFAULT_PLAYERS = 4;

// Fantasy/medieval/magic themed emojis
const EMOJI_OPTIONS = [
  "🧙", "🧝", "🧚", "🧛", "🧜", "🐉", "🧞", "🧟", "👑", "⚔️", "🛡️", "🔮",
  "🗡️", "🏹", "🪄", "🌟", "🌙", "☀️", "🔥", "❄️", "⚡", "💎", "🏆", "👻",
];

export default function GameSetupPage() {
  const router = useRouter();
  const [existingGame, setExistingGame] = useState<Game | null>(null);
  const [playerCount, setPlayerCount] = useState(DEFAULT_PLAYERS);
  const [playerNames, setPlayerNames] = useState<string[]>(
    Array(DEFAULT_PLAYERS).fill("").map((_, i) => `Player ${i + 1}`)
  );
  const [playerEmojis, setPlayerEmojis] = useState<string[]>(
    EMOJI_OPTIONS.slice(0, DEFAULT_PLAYERS)
  );
  const [editingEmojiIndex, setEditingEmojiIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<string[]>(Array(DEFAULT_PLAYERS).fill(""));
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);

  // Check for existing game on mount
  useEffect(() => {
    const game = loadGame();
    if (game && game.status === "in_progress") {
      setExistingGame(game);
      // Populate form from existing game
      setPlayerCount(game.players.length);
      setPlayerNames(game.players.map((p) => p.name));
      setPlayerEmojis(game.players.map((p) => p.emoji));
    }
  }, []);

  useEffect(() => {
    setPlayerNames((prev) => {
      const newNames = [...prev];
      while (newNames.length < playerCount) {
        newNames.push(`Player ${newNames.length + 1}`);
      }
      return newNames.slice(0, playerCount);
    });
    setPlayerEmojis((prev) => {
      const newEmojis = [...prev];
      while (newEmojis.length < playerCount) {
        newEmojis.push(EMOJI_OPTIONS[newEmojis.length % EMOJI_OPTIONS.length]);
      }
      return newEmojis.slice(0, playerCount);
    });
    setErrors((prev) => {
      const newErrors = [...prev];
      while (newErrors.length < playerCount) {
        newErrors.push("");
      }
      return newErrors.slice(0, playerCount);
    });
  }, [playerCount]);

  const handleNameChange = (index: number, value: string) => {
    setPlayerNames((prev) => {
      const newNames = [...prev];
      newNames[index] = value;
      return newNames;
    });
    if (errors[index]) {
      setErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = "";
        return newErrors;
      });
    }
  };

  const handleEmojiSelect = (index: number, emoji: string) => {
    setPlayerEmojis((prev) => {
      const newEmojis = [...prev];
      newEmojis[index] = emoji;
      return newEmojis;
    });
    setEditingEmojiIndex(null);
  };

  const addPlayer = () => {
    if (playerCount < MAX_PLAYERS) {
      setPlayerCount((prev) => prev + 1);
    }
  };

  const removePlayer = () => {
    if (playerCount > MIN_PLAYERS) {
      setPlayerCount((prev) => prev - 1);
    }
  };

  const handleResumeGame = () => {
    if (!existingGame) return;
    router.push(getResumeDestination(existingGame));
  };

  const handleStartNewGame = () => {
    setShowNewGameConfirm(false);
    setExistingGame(null);
    setPlayerCount(DEFAULT_PLAYERS);
    setPlayerNames(Array(DEFAULT_PLAYERS).fill("").map((_, i) => `Player ${i + 1}`));
    setPlayerEmojis(EMOJI_OPTIONS.slice(0, DEFAULT_PLAYERS));
  };

  const validateAndStartGame = () => {
    const newErrors = playerNames.map((name) =>
      name.trim() === "" ? "Name is required" : ""
    );
    setErrors(newErrors);

    if (newErrors.some((e) => e !== "")) {
      return;
    }

    const players: Player[] = playerNames.map((name, index) => ({
      id: `player-${index + 1}`,
      name: name.trim(),
      emoji: playerEmojis[index],
    }));

    const initialDealer = getRandomInitialDealer(playerCount);

    const game: Game = {
      id: `game-${Date.now()}`,
      dateCreated: new Date().toISOString(),
      players,
      settings: {
        playerCount,
        totalRounds: calculateRounds(playerCount),
        initialDealer,
      },
      rounds: [],
      status: "in_progress",
      currentState: { phase: "bidding", round: 1 },
    };

    saveGame(game);
    router.push("/round/1");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8" id="main-content">
      <MenuModal />
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-heading">🎴 WizTrack</CardTitle>
            <p className="text-muted-foreground mt-2">
              {MIN_PLAYERS}-{MAX_PLAYERS} players • {calculateRounds(playerCount)} rounds
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Resume Game Banner */}
            {existingGame && (
              <div className="rounded-lg border-2 border-primary bg-primary/10 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Gamepad2 className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Game in Progress</p>
                      <p className="text-sm text-muted-foreground">
                        {existingGame.rounds.length} / {existingGame.settings.totalRounds} rounds played
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    className="flex-1"
                    size="lg"
                    onClick={handleResumeGame}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Resume Game
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowNewGameConfirm(true)}
                    aria-label="Start new game"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {showNewGameConfirm && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                <p className="text-sm mb-3">Start a new game? Current progress will be lost.</p>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleStartNewGame}
                  >
                    Yes, Start New
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewGameConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Player Setup */}
            {!showNewGameConfirm && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Players</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={removePlayer}
                      disabled={playerCount <= MIN_PLAYERS}
                      aria-label="Remove player"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-semibold">{playerCount}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={addPlayer}
                      disabled={playerCount >= MAX_PLAYERS}
                      aria-label="Add player"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Player Names</label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {playerNames.map((name, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex gap-2 items-center">
                          {/* Emoji selector */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setEditingEmojiIndex(editingEmojiIndex === index ? null : index)}
                              className="w-10 h-10 flex items-center justify-center text-2xl rounded-lg border bg-muted hover:bg-muted/80 transition-colors"
                              aria-label={`Select emoji for Player ${index + 1}`}
                            >
                              {playerEmojis[index]}
                            </button>
                            {/* Emoji picker popup */}
                            {editingEmojiIndex === index && (
                              <div className="absolute left-0 top-12 z-50 p-2 bg-card border rounded-lg shadow-lg">
                                <div className="grid grid-cols-6 gap-1 w-52">
                                  {EMOJI_OPTIONS.map((emoji) => (
                                    <button
                                      key={emoji}
                                      type="button"
                                      onClick={() => handleEmojiSelect(index, emoji)}
                                      className="w-8 h-8 flex items-center justify-center text-xl hover:bg-muted rounded transition-colors"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <Input
                            value={name}
                            onChange={(e) => handleNameChange(index, e.target.value)}
                            placeholder={`Player ${index + 1}`}
                            className={errors[index] ? "border-destructive" : ""}
                            aria-label={`Player ${index + 1} name`}
                          />
                        </div>
                        {errors[index] && (
                          <p className="text-xs text-destructive">{errors[index]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    {calculateRounds(playerCount)} rounds •{" "}
                    {calculateRounds(playerCount) * playerCount} total tricks
                  </p>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={validateAndStartGame}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {existingGame ? "Start New Game" : "Start Game"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}