import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const CardSuit = z.enum(["hearts", "diamonds", "clubs", "spades"]);
export type CardSuit = z.infer<typeof CardSuit>;

export const Card = z.object({
  suit: CardSuit,
  value: z.number().min(1).max(13),
});
export type Card = z.infer<typeof Card>;

export const PlayerState = z.object({
  id: z.string(),
  name: z.string(),
  hand: z.array(Card),
  score: z.number(),
});
export type PlayerState = z.infer<typeof PlayerState>;

export const GameState = z.object({
  id: z.string(),
  players: z.array(PlayerState),
  drawPile: z.array(Card),
  discardPile: z.array(Card),
  currentTurn: z.number(),
  gameOver: z.boolean(),
});
export type GameState = z.infer<typeof GameState>;

export const games = pgTable("games", {
  id: text("id").primaryKey(),
  state: jsonb("state").$type<GameState>().notNull(),
});

export const insertGameSchema = createInsertSchema(games);
export type InsertGame = z.infer<typeof insertGameSchema>;
