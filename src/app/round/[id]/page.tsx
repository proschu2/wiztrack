"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BiddingScreen from "@/components/BiddingScreen";

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

  // Always show BiddingScreen - it handles its own state and guards
  return <BiddingScreen roundNumber={roundNumber} />;
}