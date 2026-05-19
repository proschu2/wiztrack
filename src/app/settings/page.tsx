"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { loadGame } from "@/lib/storage";

export default function SettingsPage() {
  const router = useRouter();

  // Load game from localStorage
  const game = loadGame();

  // Determine where to send the user when "Back to Game" is clicked
  const getBackToGameDestination = (): string => {
    if (!game || game.rounds.length === 0) {
      // No rounds yet, go to round 1
      return "/round/1";
    }

    const lastRound = game.rounds[game.rounds.length - 1];
    const currentRound = lastRound.roundNumber;

    switch (lastRound.phase) {
      case "bidding":
        // In bidding phase, go to current round
        return `/round/${currentRound}`;
      case "tricks":
        // In tricks phase, go to trick entry for current round
        return `/trick/${currentRound}`;
      case "scored":
        // Round is complete, check if more rounds remain
        if (currentRound < game.settings.totalRounds) {
          return `/round/${currentRound + 1}`;
        } else {
          // All rounds complete, go to complete page
          return "/complete";
        }
      default:
        return "/round/1";
    }
  };

  const handleBackToGame = () => {
    router.push(getBackToGameDestination());
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-8">
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        {/* Settings Content */}
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-muted-foreground">Settings coming soon!</p>
          </CardContent>
        </Card>

        {/* Back to Game Button */}
        <Button onClick={handleBackToGame} className="w-full" size="lg">
          Back to Game
        </Button>
      </div>
    </div>
  );
}