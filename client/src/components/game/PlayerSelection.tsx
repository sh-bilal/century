import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface PlayerSelectionProps {
  onStart: (playerCount: number) => void;
}

export function PlayerSelection({ onStart }: PlayerSelectionProps) {
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [error, setError] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (playerCount < 2 || playerCount > 6) {
      setError("Please select between 2 to 6 players");
      return;
    }

    onStart(playerCount);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          Start New Game
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Number of Players (2-6)
            </label>
            <Input
              type="number"
              min={2}
              max={6}
              value={playerCount}
              onChange={(e) => {
                setPlayerCount(parseInt(e.target.value));
                setError("");
              }}
              className="w-full"
            />
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Start Game
          </Button>
        </form>
      </Card>
    </div>
  );
}
