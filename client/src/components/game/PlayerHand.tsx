import { type Card as CardType } from "@shared/schema";
import { Card } from "./Card";

interface PlayerHandProps {
  cards: CardType[];
  selectedCards: CardType[];
  onCardClick: (card: CardType) => void;
  hasValidSequence: boolean;
  hasValidPair: boolean;
}

export function PlayerHand({ cards, selectedCards, onCardClick, hasValidSequence, hasValidPair }: PlayerHandProps) {
  return (
    <div className="flex flex-wrap gap-4 p-6 min-h-[200px] bg-gray-50 rounded-xl border-2 border-gray-100 relative">
      {(hasValidSequence || hasValidPair) && (
        <div className="absolute -top-4 left-4 px-3 py-1 bg-primary text-white text-sm rounded-full">
          {hasValidSequence && hasValidPair ? 'Sequence & Pair Available!' : 
           hasValidSequence ? 'Sequence Available!' : 'Pair Available!'}
        </div>
      )}
      {cards.map((card, i) => (
        <Card
          key={`${card.suit}-${card.value}`}
          card={card}
          selected={selectedCards.some(
            sc => sc.suit === card.suit && sc.value === card.value
          )}
          onClick={() => onCardClick(card)}
          highlight={hasValidSequence || hasValidPair}
        />
      ))}
    </div>
  );
}