import BiddingScreen from "@/components/BiddingScreen";

interface RoundPageProps {
  params: Promise<{ id: string }>;
}

export default async function RoundPage({ params }: RoundPageProps) {
  const resolvedParams = await params;
  const roundNumber = parseInt(resolvedParams.id, 10);

  if (isNaN(roundNumber) || roundNumber < 1) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <p className="text-destructive">Invalid round number</p>
      </div>
    );
  }

  return <BiddingScreen roundNumber={roundNumber} />;
}