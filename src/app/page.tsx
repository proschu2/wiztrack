"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus, Play } from "lucide-react";
import { calculateRounds } from "@/lib/roundCalc";
import { saveGame } from "@/lib/storage";
import type { Game, Player } from "@/types";

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 6;
const DEFAULT_PLAYERS = 4;
const PREFILL_STORAGE_KEY = "wiztrack_prefill_players";

export default function GameSetupPage() {
  const router = useRouter();
  const [playerCount, setPlayerCount] = useState(DEFAULT_PLAYERS);
  const [playerNames, setPlayerNames] = useState<string[]>(
    Array(DEFAULT_PLAYERS).fill("").map((_, i) => `Player ${i + 1}`)
  );
  const [errors, setErrors] = useState<string[]>(Array(DEFAULT_PLAYERS).fill(""));

  // Load pre-fill player names from sessionStorage on mount
  useEffect(() => {
    try {
      const prefillJson = sessionStorage.getItem(PREFILL_STORAGE_KEY);
      if (prefillJson) {
        const prefillNames: string[] = JSON.parse(prefillJson);
        if (prefillNames && prefillNames.length > 0) {
          // Clear the prefill storage after reading
          sessionStorage.removeItem(PREFILL_STORAGE_KEY);
          // Set player count and names based on prefill
          const count = Math.min(Math.max(prefillNames.length, MIN_PLAYERS), MAX_PLAYERS);
          setPlayerCount(count);
          setPlayerNames(prefillNames.slice(0, count));
        }
      }
    } catch {
      // Ignore prefill errors - use defaults
    }
  }, []);

  // Update player names array when count changes
  useEffect(() => {
    setPlayerNames((prev) => {
      const newNames = [...prev];
      while (newNames.length < playerCount) {
        newNames.push(`Player ${newNames.length + 1}`);
      }
      return newNames.slice(0, playerCount);
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
    // Clear error when user types
    if (errors[index]) {
      setErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = "";
        return newErrors;
      });
    }
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

  const validateAndStartGame = () => {
    const newErrors = playerNames.map((name) =>
      name.trim() === "" ? "Name is required" : ""
    );
    setErrors(newErrors);

    if (newErrors.some((e) => e !== "")) {
      return;
    }

    // Create game
    const players: Player[] = playerNames.map((name, index) => ({
      id: `player-${index + 1}`,
      name: name.trim(),
    }));

    const game: Game = {
      id: `game-${Date.now()}`,
      dateCreated: new Date().toISOString(),
      players,
      settings: {
        playerCount,
        totalRounds: calculateRounds(playerCount),
      },
      rounds: [],
      status: "in_progress",
    };

    // Save to localStorage
    saveGame(game);

    // Navigate to first round
    router.push("/round/1");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">🎴 WizTrack</CardTitle>
            <p className="text-muted-foreground mt-2">
              Set up your game with {MIN_PLAYERS}-{MAX_PLAYERS} players
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Player Count Controls */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Number of Players</span>
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

            {/* Player Name Inputs */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Player Names</label>
              <div className="grid gap-3 sm:grid-cols-2">
                {playerNames.map((name, index) => (
                  <div key={index} className="space-y-1">
                    <Input
                      value={name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      placeholder={`Player ${index + 1}`}
                      className={errors[index] ? "border-destructive" : ""}
                      aria-label={`Player ${index + 1} name`}
                    />
                    {errors[index] && (
                      <p className="text-xs text-destructive">{errors[index]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Game Info */}
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">
                {calculateRounds(playerCount)} rounds •{" "}
                {calculateRounds(playerCount) * playerCount} total tricks
              </p>
            </div>

            {/* Start Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={validateAndStartGame}
            >
              <Play className="mr-2 h-4 w-4" />
              Start Game
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
