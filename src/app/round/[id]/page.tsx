"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BiddingScreen from "@/components/BiddingScreen";
import { loadGame } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gamepad2, Play, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface RoundPageProps {
  params: Promise<{ id: string }>;
}

export default function RoundPage({ params }: RoundPageProps) {
  const router = useRouter();
  const [roundNumber, setRoundNumber] = useState<number | null>(null);
  const [existingGame, setExistingGame] = useState<ReturnType<typeof loadGame>>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      const num = parseInt(resolved.id, 10);
      if (isNaN(num) || num < 1) {
        router.push("/");
        return;
      }
      setRoundNumber(num);

      // Check for existing game
      const game = loadGame();
      if (!game || game.status !== "in_progress") {
        setExistingGame(null);
      } else {
        setExistingGame(game);
      }
      setLoading(false);
    };
    resolveParams();
  }, [params, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!roundNumber) return null;

  // Check if this round is valid for the game
  if (existingGame && roundNumber > existingGame.settings.totalRounds) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-heading">Game Complete</h2>
            <p className="text-muted-foreground">
              All {existingGame.settings.totalRounds} rounds have been played.
            </p>
            <div className="flex gap-3">
              <Link href="/complete" className="flex-1">
                <Button className="w-full">
                  View Results
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if there's a game in progress but we're at the wrong round
  if (existingGame && existingGame.rounds.length > 0) {
    const lastRound = existingGame.rounds[existingGame.rounds.length - 1];
    const expectedRound = lastRound.phase === "scored" 
      ? lastRound.roundNumber + 1 
      : lastRound.roundNumber;

    if (roundNumber !== expectedRound && roundNumber <= existingGame.settings.totalRounds) {
      // Show option to go to correct round
      return (
        <div className="min-h-screen bg-background p-4 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center space-y-4">
              <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-heading">Wrong Round</h2>
              <p className="text-muted-foreground">
                You should be on Round {expectedRound}, not Round {roundNumber}.
              </p>
              <div className="flex gap-3">
                <Link href={`/round/${expectedRound}`} className="flex-1">
                  <Button className="w-full">
                    <Play className="mr-2 h-4 w-4" />
                    Go to Round {expectedRound}
                  </Button>
                </Link>
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return <BiddingScreen roundNumber={roundNumber} />;
}
