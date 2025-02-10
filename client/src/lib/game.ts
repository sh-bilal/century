import { Card, CardSuit, type GameState } from "@shared/schema";
import { nanoid } from "nanoid";

export function createDeck(): Card[] {
  const deck: Card[] = [];
  const suits: CardSuit[] = ["hearts", "diamonds", "clubs", "spades"];
  
  for (const suit of suits) {
    for (let value = 1; value <= 13; value++) {
      deck.push({ suit, value });
    }
  }
  
  return shuffle(deck);
}

export function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function calculateHandScore(cards: Card[]): number {
  return cards.reduce((total, card) => {
    if (card.value === 13) { // King
      return total + (card.suit === "hearts" || card.suit === "diamonds" ? 13 : 0);
    }
    return total + card.value;
  }, 0);
}

export function validateSequence(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  
  const suit = cards[0].suit;
  if (!cards.every(card => card.suit === suit)) return false;
  
  const values = cards.map(card => card.value).sort((a, b) => a - b);
  for (let i = 1; i < values.length; i++) {
    if (values[i] !== values[i-1] + 1) return false;
  }
  
  return true;
}

export function validatePair(cards: Card[]): boolean {
  if (cards.length !== 2) return false;
  return cards[0].value === cards[1].value;
}

export function createInitialGameState(playerNames: string[]): GameState {
  const deck = createDeck();
  const players = playerNames.map(name => ({
    id: nanoid(),
    name,
    hand: deck.splice(0, 4),
    score: 0
  }));

  return {
    id: nanoid(),
    players,
    drawPile: deck,
    discardPile: [deck.splice(0, 1)[0]],
    currentTurn: 0,
    gameOver: false
  };
}
