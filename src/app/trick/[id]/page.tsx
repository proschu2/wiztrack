import TrickEntryScreen from "@/components/TrickEntryScreen";

interface TrickPageProps {
  params: Promise<{ id: string }>;
}

export default async function TrickPage({ params }: TrickPageProps) {
  const resolvedParams = await params;
  const roundNumber = parseInt(resolvedParams.id, 10);

  if (isNaN(roundNumber) || roundNumber < 1) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <p className="text-destructive">Invalid round number</p>
      </div>
    );
  }

  return <TrickEntryScreen roundNumber={roundNumber} />;
}
