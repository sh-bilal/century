import { type Card as CardType } from "@shared/schema";
import { Card } from "./Card";

interface PlayerHandProps {
  cards: CardType[];
  selectedCards: CardType[];
  onCardClick: (card: CardType) => void;
}

export function PlayerHand({ cards, selectedCards, onCardClick }: PlayerHandProps) {
  return (
    <div className="flex flex-wrap gap-4 p-6 min-h-[200px] bg-gray-50 rounded-xl border-2 border-gray-100">
      {cards.map((card, i) => (
        <Card
          key={`${card.suit}-${card.value}`}
          card={card}
          selected={selectedCards.some(
            sc => sc.suit === card.suit && sc.value === card.value
          )}
          onClick={() => onCardClick(card)}
        />
      ))}
    </div>
  );
}