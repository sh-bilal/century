import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { GameBoard } from "@/components/game/GameBoard";
import { apiRequest } from "@/lib/queryClient";
import { createInitialGameState } from "@/lib/game";
import { type GameState } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

export default function GamePage() {
  const gameId = "test-game"; // In a real app, this would come from URL/state

  const { data: gameState, isLoading: isLoadingGame } = useQuery<GameState>({
    queryKey: ["/api/games", gameId],
  });

  const createGameMutation = useMutation({
    mutationFn: async (initialState: GameState) => {
      await apiRequest("POST", "/api/games", initialState);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });
    },
  });

  useEffect(() => {
    const initializeGame = async () => {
      if (!gameState && !createGameMutation.isPending) {
        const initialState = createInitialGameState(["Player 1", "Player 2"]);
        await createGameMutation.mutateAsync(initialState);
      }
    };

    initializeGame();
  }, [gameState, createGameMutation]);

  if (isLoadingGame || createGameMutation.isPending) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-32 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="flex gap-8">
            <Skeleton className="h-32 w-20" />
            <Skeleton className="h-32 w-20" />
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!gameState) {
    return <div>Error loading game</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <GameBoard
        gameState={gameState}
        onUpdateGame={(newState) => {
          apiRequest("PUT", `/api/games/${gameId}`, newState)
            .then(() => {
              queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });
            })
            .catch((error) => {
              console.error("Failed to update game:", error);
            });
        }}
      />
    </div>
  );
}