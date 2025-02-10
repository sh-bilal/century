import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { GameBoard } from "@/components/game/GameBoard";
import { PlayerSelection } from "@/components/game/PlayerSelection";
import { apiRequest } from "@/lib/queryClient";
import { createInitialGameState } from "@/lib/game";
import { type GameState } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

export default function GamePage() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerCount, setPlayerCount] = useState<number | null>(null);

  const { data: gameState, isLoading: isLoadingGame } = useQuery<GameState>({
    queryKey: [`/api/games/${gameId}`],
    enabled: !!gameId,
  });

  const createGameMutation = useMutation({
    mutationFn: async (initialState: GameState) => {
      const response = await apiRequest("POST", "/api/games", initialState);
      const data = await response.json();
      return data as GameState;
    },
    onSuccess: (data) => {
      setGameId(data.id);
      queryClient.invalidateQueries({ queryKey: [`/api/games/${data.id}`] });
    },
  });

  useEffect(() => {
    const initializeGame = async () => {
      if (!gameId && !createGameMutation.isPending && playerCount) {
        console.log("Initializing new game...");
        const playerNames = Array.from(
          { length: playerCount },
          (_, i) => `Player ${i + 1}`
        );
        const initialState = createInitialGameState(playerNames);
        await createGameMutation.mutateAsync(initialState);
      }
    };

    initializeGame().catch(console.error);
  }, [gameId, createGameMutation, playerCount]);

  // Show player selection if game hasn't started
  if (!playerCount) {
    return (
      <PlayerSelection
        onStart={(count) => setPlayerCount(count)}
      />
    );
  }

  if (!gameId || isLoadingGame || createGameMutation.isPending) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Error Loading Game</h1>
          <p className="mt-2 text-gray-600">Unable to initialize the game state.</p>
        </div>
      </div>
    );
  }

  console.log("Current game state:", gameState);

  return (
    <div className="min-h-screen bg-gray-50">
      <GameBoard
        gameState={gameState}
        onUpdateGame={(newState) => {
          if (!gameId) return;

          apiRequest("PUT", `/api/games/${gameId}`, newState)
            .then(() => {
              queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}`] });
            })
            .catch((error) => {
              console.error("Failed to update game:", error);
            });
        }}
      />
    </div>
  );
}