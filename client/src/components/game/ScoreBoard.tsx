import { type PlayerState } from "@shared/schema";
import { Card } from "@/components/ui/card";

interface ScoreBoardProps {
  players: PlayerState[];
  currentTurn: number;
}

export function ScoreBoard({ players, currentTurn }: ScoreBoardProps) {
  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold mb-4">Scores</h2>
      <div className="space-y-2">
        {players.map((player, i) => (
          <div
            key={player.id}
            className="flex justify-between items-center p-2 rounded"
          >
            <div className="flex items-center gap-2">
              <div className={currentTurn === i ? "text-primary font-bold" : ""}>
                {player.name}
              </div>
              {currentTurn === i && (
                <span className="text-sm text-primary">(Current Turn)</span>
              )}
            </div>
            <div className="font-mono">
              {player.score} / 100
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
