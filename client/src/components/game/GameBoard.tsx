import { useState } from "react";
import { type Card as CardType, type GameState } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card } from "./Card";
import { PlayerHand } from "./PlayerHand";
import { ScoreBoard } from "./ScoreBoard";
import { calculateHandScore, validatePair, validateSequence, createDeck } from "@/lib/game";

interface GameBoardProps {
  gameState: GameState;
  onUpdateGame: (newState: GameState) => void;
}

const suits = ["hearts", "diamonds", "clubs", "spades"];
const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];


export function GameBoard({ gameState, onUpdateGame }: GameBoardProps) {
  const { toast } = useToast();
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
  const [roundEnded, setRoundEnded] = useState(false);
  const [needsToDraw, setNeedsToDraw] = useState(false);

  const currentPlayer = gameState.players[gameState.currentTurn];
  const currentPlayerHand = currentPlayer.hand;

  const handleCardClick = (card: CardType) => {
    if (roundEnded || needsToDraw) return;

    setSelectedCards(prev => {
      const exists = prev.some(c => c.suit === card.suit && c.value === card.value);
      if (exists) {
        return prev.filter(c => c.suit !== card.suit || c.value !== card.value);
      }
      return [...prev, card];
    });
  };

  const handleDiscard = () => {
    if (roundEnded) return;

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
    setNeedsToDraw(true);

    onUpdateGame(newState);
  };

  const handleDraw = (fromDiscard: boolean) => {
    if (roundEnded || !needsToDraw) return;

    const newState = { ...gameState };
    const currentPlayer = newState.players[newState.currentTurn];

    // Check if hand would exceed 4 cards
    if (currentPlayer.hand.length >= 4) {
      toast({ 
        title: "Hand full",
        description: "You cannot have more than 4 cards"
      });
      return;
    }

    if (fromDiscard) {
      const card = newState.discardPile.pop();
      if (card) currentPlayer.hand.push(card);
    } else {
      const card = newState.drawPile.pop();
      if (card) currentPlayer.hand.push(card);
    }

    setNeedsToDraw(false);
    newState.currentTurn = (newState.currentTurn + 1) % newState.players.length;
    onUpdateGame(newState);
  };

  const handleShow = () => {
    if (roundEnded) return;

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

    setRoundEnded(true);
    onUpdateGame(newState);
  };

  const handleResetRound = () => {
    const newState = { ...gameState };
    // Reset hands and create a new deck
    const deck = createDeck();

    newState.players.forEach(player => {
      player.hand = deck.splice(0, 4);
    });

    newState.drawPile = deck;
    newState.discardPile = [deck.splice(0, 1)[0]];
    newState.currentTurn = 0;
    newState.gameOver = false;

    setRoundEnded(false);
    setNeedsToDraw(false);
    setSelectedCards([]);

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
            {needsToDraw ? (
              <>
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
              </>
            ) : (
              <Button 
                onClick={handleDiscard}
                disabled={selectedCards.length === 0 || roundEnded}
                variant="secondary"
              >
                Discard Selected
              </Button>
            )}
          </div>

          <div className="flex gap-4">
            {roundEnded ? (
              <Button
                onClick={handleResetRound}
                className="bg-primary hover:bg-primary/90"
              >
                Start New Round
              </Button>
            ) : (
              <Button
                onClick={handleShow}
                variant="destructive"
                disabled={needsToDraw}
              >
                Show ({calculateHandScore(currentPlayerHand)})
              </Button>
            )}
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
          <h2 className="text-xl font-bold mb-4">Your Hand {needsToDraw && "(Draw a card to continue)"}</h2>
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