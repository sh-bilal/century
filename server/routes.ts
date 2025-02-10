import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { GameState } from "@shared/schema";

export function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  app.post("/api/games", async (req, res) => {
    const gameState = req.body as GameState;
    const game = await storage.createGame(gameState);
    res.json(game);
  });

  app.get("/api/games/:id", async (req, res) => {
    const game = await storage.getGame(req.params.id);
    if (!game) {
      res.status(404).json({ message: "Game not found" });
      return;
    }
    res.json(game);
  });

  app.put("/api/games/:id", async (req, res) => {
    const gameState = req.body as GameState;
    const game = await storage.updateGame(req.params.id, gameState);
    res.json(game);
  });

  app.delete("/api/games/:id", async (req, res) => {
    await storage.deleteGame(req.params.id);
    res.status(204).send();
  });

  return httpServer;
}
