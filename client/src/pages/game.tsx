import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { GameBoard } from "@/components/game/GameBoard";
import { apiRequest } from "@/lib/queryClient";
import { createInitialGameState } from "@/lib/game";
import { type GameState } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

export default function GamePage() {
  const gameId = "test-game"; // In a real app, this would come from URL/state

  const { data: gameState } = useQuery<GameState>({
    queryKey: ["/api/games", gameId],
  });

  const updateGameMutation = useMutation({
    mutationFn: async (newState: GameState) => {
      await apiRequest("PUT", `/api/games/${gameId}`, newState);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });
    },
  });

  useEffect(() => {
    if (!gameState) {
      const initialState = createInitialGameState(["Player 1", "Player 2"]);
      apiRequest("POST", "/api/games", initialState);
    }
  }, [gameState]);

  if (!gameState) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <GameBoard
        gameState={gameState}
        onUpdateGame={(newState) => updateGameMutation.mutate(newState)}
      />
    </div>
  );
}
