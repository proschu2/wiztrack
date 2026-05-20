"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TrickEntryScreen from "@/components/TrickEntryScreen";

interface TrickPageProps {
  params: Promise<{ id: string }>;
}

export default function TrickPage({ params }: TrickPageProps) {
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

  // Always show TrickEntryScreen - it handles its own state and guards
  return <TrickEntryScreen roundNumber={roundNumber} />;
}
