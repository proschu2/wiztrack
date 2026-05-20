"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BiddingScreen from "@/components/BiddingScreen";
import { loadGame } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gamepad2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface RoundPageProps {
  params: Promise<{ id: string }>;
}

export default function RoundPage({ params }: RoundPageProps) {
  const router = useRouter();
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
  if (game && game.currentState.phase === 'tricks') {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-heading">Complete Trick Entry First</h2>
            <p className="text-muted-foreground">
              You are currently on Round {game.currentState.round} tricks.
            </p>
            <Link href={`/trick/${game.currentState.round}`}>
              <Button className="w-full">
                <ArrowRight className="mr-2 h-4 w-4" />
                Go to Trick Entry
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (game && game.currentState.phase === 'complete') {
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

  return <BiddingScreen roundNumber={roundNumber} />;
}