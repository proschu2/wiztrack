"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { loadGame } from "@/lib/storage";
import MenuModal from "@/components/MenuModal";

export default function SettingsPage() {
  const router = useRouter();

  const game = loadGame();

  const getBackToGameDestination = (): string => {
    if (!game || game.rounds.length === 0) {
      return "/round/1";
    }

    const lastRound = game.rounds[game.rounds.length - 1];
    const currentRound = lastRound.roundNumber;

    switch (lastRound.phase) {
      case "bidding":
        return `/round/${currentRound}`;
      case "tricks":
        return `/trick/${currentRound}`;
      case "scored":
        if (currentRound < game.settings.totalRounds) {
          return `/round/${currentRound + 1}`;
        } else {
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
      <MenuModal />
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center pt-8">
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-muted-foreground">Settings coming soon!</p>
          </CardContent>
        </Card>

        <Button onClick={handleBackToGame} className="w-full" size="lg">
          Back to Game
        </Button>
      </div>
    </div>
  );
}