import { type GameState } from "@shared/schema";

export interface IStorage {
  createGame(gameState: GameState): Promise<GameState>;
  getGame(id: string): Promise<GameState | undefined>;
  updateGame(id: string, gameState: GameState): Promise<GameState>;
  deleteGame(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private games: Map<string, GameState>;

  constructor() {
    this.games = new Map();
  }

  async createGame(gameState: GameState): Promise<GameState> {
    this.games.set(gameState.id, gameState);
    return gameState;
  }

  async getGame(id: string): Promise<GameState | undefined> {
    return this.games.get(id);
  }

  async updateGame(id: string, gameState: GameState): Promise<GameState> {
    this.games.set(id, gameState);
    return gameState;
  }

  async deleteGame(id: string): Promise<void> {
    this.games.delete(id);
  }
}

export const storage = new MemStorage();
