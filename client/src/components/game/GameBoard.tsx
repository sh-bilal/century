import { useState } from "react";
import { type Card as CardType, type GameState } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card } from "./Card";
import { PlayerHand } from "./PlayerHand";
import { ScoreBoard } from "./ScoreBoard";
import { calculateHandScore, validatePair, validateSequence } from "@/lib/game";

interface GameBoardProps {
  gameState: GameState;
  onUpdateGame: (newState: GameState) => void;
}

export function GameBoard({ gameState, onUpdateGame }: GameBoardProps) {
  const { toast } = useToast();
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);

  const currentPlayer = gameState.players[gameState.currentTurn];
  const currentPlayerHand = currentPlayer.hand;

  const handleCardClick = (card: CardType) => {
    setSelectedCards(prev => {
      const exists = prev.some(c => c.suit === card.suit && c.value === card.value);
      if (exists) {
        return prev.filter(c => c.suit !== card.suit || c.value !== card.value);
      }
      return [...prev, card];
    });
  };

  const handleDiscard = () => {
    if (selectedCards.length === 0) {
      toast({ title: "Select cards to discard" });
      return;
    }

    if (selectedCards.length > 1) {
      if (!validatePair(selectedCards) && !validateSequence(selectedCards)) {
        toast({ 
          title: "Invalid selection",
          description: "Multiple cards must form a pair or sequence"
        });
        return;
      }
    }

    const newState = { ...gameState };
    const currentPlayer = newState.players[newState.currentTurn];

    currentPlayer.hand = currentPlayer.hand.filter(card => 
      !selectedCards.some(sc => sc.suit === card.suit && sc.value === card.value)
    );

    newState.discardPile.push(...selectedCards);
    setSelectedCards([]);
    newState.currentTurn = (newState.currentTurn + 1) % newState.players.length;

    onUpdateGame(newState);
  };

  const handleDraw = (fromDiscard: boolean) => {
    const newState = { ...gameState };
    const currentPlayer = newState.players[newState.currentTurn];

    if (fromDiscard) {
      const card = newState.discardPile.pop();
      if (card) currentPlayer.hand.push(card);
    } else {
      const card = newState.drawPile.pop();
      if (card) currentPlayer.hand.push(card);
    }

    onUpdateGame(newState);
  };

  const handleShow = () => {
    const handScore = calculateHandScore(currentPlayerHand);
    if (handScore > 5) {
      toast({ 
        title: "Cannot show yet",
        description: "Your hand score must be 5 or less"
      });
      return;
    }

    const newState = { ...gameState };
    const lowestScore = Math.min(...newState.players.map(p => 
      calculateHandScore(p.hand)
    ));

    if (handScore > lowestScore) {
      currentPlayer.score += 30;
      toast({ 
        title: "Penalty!",
        description: "Someone had a lower score - 30 points added"
      });
    }

    if (currentPlayer.score >= 100) {
      newState.gameOver = true;
    }

    onUpdateGame(newState);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-xl shadow-md p-6">
        <ScoreBoard 
          players={gameState.players}
          currentTurn={gameState.currentTurn}
        />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <Button
              onClick={() => handleDraw(false)}
              disabled={gameState.drawPile.length === 0}
              className="bg-primary hover:bg-primary/90"
            >
              Draw Card
            </Button>
            <Button
              onClick={() => handleDraw(true)}
              disabled={gameState.discardPile.length === 0}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
            >
              Take from Discard
            </Button>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={handleDiscard}
              disabled={selectedCards.length === 0}
              variant="secondary"
            >
              Discard Selected
            </Button>
            <Button
              onClick={handleShow}
              variant="destructive"
            >
              Show ({calculateHandScore(currentPlayerHand)})
            </Button>
          </div>
        </div>

        <div className="flex gap-8 justify-center mb-8">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-500 mb-2">Draw Pile</div>
            <div className="bg-gray-100 w-24 h-36 rounded-xl shadow-inner flex items-center justify-center border-2 border-dashed border-gray-300">
              <span className="text-gray-400">{gameState.drawPile.length}</span>
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm font-medium text-gray-500 mb-2">Discard Pile</div>
            {gameState.discardPile.length > 0 ? (
              <Card card={gameState.discardPile[gameState.discardPile.length - 1]} />
            ) : (
              <div className="bg-gray-100 w-24 h-36 rounded-xl shadow-inner flex items-center justify-center border-2 border-dashed border-gray-300">
                <span className="text-gray-400">Empty</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Your Hand</h2>
          <PlayerHand
            cards={currentPlayerHand}
            selectedCards={selectedCards}
            onCardClick={handleCardClick}
          />
        </div>
      </div>
    </div>
  );
}