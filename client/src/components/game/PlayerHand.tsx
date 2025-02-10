import { type Card as CardType } from "@shared/schema";
import { Card } from "./Card";

interface PlayerHandProps {
  cards: CardType[];
  selectedCards: CardType[];
  onCardClick: (card: CardType) => void;
}

export function PlayerHand({ cards, selectedCards, onCardClick }: PlayerHandProps) {
  return (
    <div className="flex gap-4 p-4 min-h-[200px] bg-gray-100 rounded-lg">
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
