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
        "w-24 h-36 bg-white rounded-xl shadow-lg cursor-pointer transition-all duration-200",
        "flex flex-col items-center justify-between p-3 relative hover:scale-105",
        "border-2",
        selected ? "border-primary ring-2 ring-primary/50" : "border-gray-200",
        onClick && "hover:border-primary/50"
      )}
    >
      {/* Top left value and suit */}
      <div className="absolute top-2 left-2 flex flex-col items-start">
        <span className={cn(
          "text-lg font-bold",
          isRed ? "text-red-500" : "text-gray-900"
        )}>
          {displayValue}
        </span>
        <span className={cn(
          "text-xl",
          isRed ? "text-red-500" : "text-gray-900"
        )}>
          {suitSymbol}
        </span>
      </div>

      {/* Center suit */}
      <div className={cn(
        "text-5xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
        isRed ? "text-red-500" : "text-gray-900"
      )}>
        {suitSymbol}
      </div>

      {/* Bottom right value and suit (inverted) */}
      <div className="absolute bottom-2 right-2 flex flex-col items-end rotate-180">
        <span className={cn(
          "text-lg font-bold",
          isRed ? "text-red-500" : "text-gray-900"
        )}>
          {displayValue}
        </span>
        <span className={cn(
          "text-xl",
          isRed ? "text-red-500" : "text-gray-900"
        )}>
          {suitSymbol}
        </span>
      </div>
    </div>
  );
}