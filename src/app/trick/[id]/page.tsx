"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TrickEntryScreen from "@/components/TrickEntryScreen";
import { loadGame } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gamepad2, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface TrickPageProps {
  params: Promise<{ id: string }>;
}

export default function TrickPage({ params }: TrickPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [roundNumber, setRoundNumber] = useState<number | null>(null);
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

  // Check if we're in the right state for this page
  const game = loadGame();
  
  // If no game, TrickEntryScreen will handle redirect
  if (game && game.currentState) {
    // If we're in bidding phase, send to bidding
    if (game.currentState.phase === 'bidding') {
      return (
        <div className="min-h-screen bg-background p-4 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center space-y-4">
              <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-heading">Complete Bidding First</h2>
              <p className="text-muted-foreground">
                You are currently on Round {game.currentState.round} bidding.
              </p>
              <Link href={`/round/${game.currentState.round}`}>
                <Button className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go to Bidding
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      );
    }

    // If game is complete, show results
    if (game.currentState.phase === 'complete') {
      return (
        <div className="min-h-screen bg-background p-4 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center space-y-4">
              <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-heading">Game Complete</h2>
              <p className="text-muted-foreground">
                All rounds have been played.
              </p>
              <Link href="/complete">
                <Button className="w-full">
                  View Results
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      );
    }

    // If we're in tricks but for a different round
    if (game.currentState.phase === 'tricks' && game.currentState.round !== roundNumber) {
      return (
        <div className="min-h-screen bg-background p-4 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center space-y-4">
              <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-heading">Wrong Round</h2>
              <p className="text-muted-foreground">
                You should be on Round {game.currentState.round} tricks.
              </p>
              <Link href={`/trick/${game.currentState.round}`}>
                <Button className="w-full">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Go to Round {game.currentState.round}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return <TrickEntryScreen roundNumber={roundNumber} />;
}