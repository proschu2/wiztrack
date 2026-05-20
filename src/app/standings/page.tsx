"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { loadGame } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { Game } from "@/types/game";
import MenuModal from "@/components/MenuModal";

import StandingsTab from "@/components/standings/StandingsTab";
import TrendsTab from "@/components/standings/TrendsTab";
import RoundByRoundTab from "@/components/standings/RoundByRoundTab";

type TabId = "standings" | "trends" | "round-by-round";

export default function StandingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("standings");

  const game = loadGame();

  const getResumeGameDestination = (): string => {
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

  const handleResumeGame = () => {
    router.push(getResumeGameDestination());
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "standings", label: "Standings" },
    { id: "trends", label: "Trends" },
    { id: "round-by-round", label: "Round by Round" },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <MenuModal />
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center pt-8">
          <h1 className="text-2xl font-bold">Standings</h1>
        </div>

        <div className="space-y-4">
          <div className="flex border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 py-3 px-4 text-sm font-medium text-center",
                  "border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Card>
            <CardContent className="p-4">
              {activeTab === "standings" && <StandingsTab game={game} />}
              {activeTab === "trends" && <TrendsTab game={game} />}
              {activeTab === "round-by-round" && <RoundByRoundTab game={game} />}
            </CardContent>
          </Card>
        </div>

        <Button onClick={handleResumeGame} className="w-full" size="lg">
          Resume Game
        </Button>
      </div>
    </div>
  );
}