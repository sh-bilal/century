import { useState, useEffect } from "react";
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

export function GameBoard({ gameState, onUpdateGame }: GameBoardProps) {
  const { toast } = useToast();
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
  const [roundEnded, setRoundEnded] = useState(false);
  const [needsToDraw, setNeedsToDraw] = useState(false);
  const [lastDiscarded, setLastDiscarded] = useState<CardType[]>([]);

  const currentPlayer = gameState.players[gameState.currentTurn];
  const currentPlayerHand = currentPlayer.hand;

  // Show turn notification
  useEffect(() => {
    toast({
      title: `${currentPlayer.name}'s Turn`,
      duration: 3000
    });
  }, [gameState.currentTurn]);

  // Check for valid combinations in hand
  const hasValidSequence = currentPlayerHand.length >= 3 && 
    currentPlayerHand.some((card1, i) => 
      currentPlayerHand.some((card2, j) => 
        currentPlayerHand.some((card3, k) => 
          i !== j && j !== k && i !== k && 
          validateSequence([card1, card2, card3])
        )
      )
    );

  const hasValidPair = currentPlayerHand.length >= 2 && 
    currentPlayerHand.some((card1, i) => 
      currentPlayerHand.some((card2, j) => 
        i !== j && validatePair([card1, card2])
      )
    );

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

    // Store the previously discarded card before adding new ones
    setLastDiscarded([...selectedCards]);
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
      // Remove the last discarded cards from the discard pile
      lastDiscarded.forEach(() => newState.discardPile.pop());
      // Get the top card that was there before the last discard
      const card = newState.discardPile[newState.discardPile.length - 1];
      if (card) currentPlayer.hand.push(card);
    } else {
      const card = newState.drawPile.pop();
      if (card) currentPlayer.hand.push(card);
    }

    setNeedsToDraw(false);
    setLastDiscarded([]);
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
    const showingPlayer = newState.players[newState.currentTurn];
    const otherPlayers = newState.players.filter((_, i) => i !== newState.currentTurn);

    const lowestScore = Math.min(...otherPlayers.map(p => calculateHandScore(p.hand)));

    if (handScore > lowestScore) {
      // Penalize the showing player if someone has a lower score
      showingPlayer.score += 30;
      toast({ 
        title: "Penalty!",
        description: "Someone had a lower score - 30 points added"
      });
    } else {
      // Add other players' scores to their totals
      otherPlayers.forEach(player => {
        const playerScore = calculateHandScore(player.hand);
        player.score += playerScore;
        toast({
          title: `${player.name}'s Score`,
          description: `Added ${playerScore} points`
        });
      });
    }

    if (showingPlayer.score >= 100) {
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
    setLastDiscarded([]);

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
            hasValidSequence={hasValidSequence}
            hasValidPair={hasValidPair}
          />
        </div>
      </div>
    </div>
  );
}