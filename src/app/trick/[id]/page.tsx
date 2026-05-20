"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TrickEntryScreen from "@/components/TrickEntryScreen";
import { loadGame } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gamepad2, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

interface TrickPageProps {
  params: Promise<{ id: string }>;
}

export default function TrickPage({ params }: TrickPageProps) {
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

  // Check if there's no game or we're in bidding phase
  if (!existingGame) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-heading">No Game Found</h2>
            <p className="text-muted-foreground">Start a new game from the home page.</p>
            <Link href="/">
              <Button className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Find the round
  const round = existingGame.rounds.find(r => r.roundNumber === roundNumber);
  
  // If round doesn't exist or bids not locked, redirect to bidding
  if (!round || !round.bidsLocked) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-heading">Complete Bidding First</h2>
            <p className="text-muted-foreground">
              You need to complete the bidding for Round {roundNumber} before entering tricks.
            </p>
            <div className="flex gap-3">
              <Link href={`/round/${roundNumber}`} className="flex-1">
                <Button className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go to Bidding
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

  // If round is already scored, show options
  if (round.phase === "scored") {
    const nextRound = roundNumber + 1;
    const hasNextRound = nextRound <= existingGame.settings.totalRounds;
    
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-heading">Round {roundNumber} Complete</h2>
            <p className="text-muted-foreground">
              This round has already been scored.
            </p>
            <div className="flex gap-3">
              {hasNextRound ? (
                <Link href={`/round/${nextRound}`} className="flex-1">
                  <Button className="w-full">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Round {nextRound}
                  </Button>
                </Link>
              ) : (
                <Link href="/complete" className="flex-1">
                  <Button className="w-full">
                    View Results
                  </Button>
                </Link>
              )}
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

  return <TrickEntryScreen roundNumber={roundNumber} />;
}