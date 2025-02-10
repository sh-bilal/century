import { type Card as CardType } from "@shared/schema";
import { cn } from "@/lib/utils";

interface CardProps {
  card: CardType;
  selected?: boolean;
  onClick?: () => void;
}

export function Card({ card, selected, onClick }: CardProps) {
  const { suit, value } = card;
  
  const suitSymbol = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠"
  }[suit];

  const displayValue = {
    1: "A",
    11: "J",
    12: "Q",
    13: "K"
  }[value] || value.toString();

  const isRed = suit === "hearts" || suit === "diamonds";

  return (
    <div
      onClick={onClick}
      className={cn(
        "w-20 h-32 bg-white rounded-lg border-2 shadow-md cursor-pointer transition-transform hover:scale-105",
        "flex flex-col items-center justify-center p-2",
        selected && "border-primary",
        !selected && "border-gray-200"
      )}
    >
      <div className={cn(
        "text-2xl font-bold",
        isRed ? "text-red-500" : "text-gray-900"
      )}>
        {displayValue}
      </div>
      <div className={cn(
        "text-4xl",
        isRed ? "text-red-500" : "text-gray-900"
      )}>
        {suitSymbol}
      </div>
    </div>
  );
}
