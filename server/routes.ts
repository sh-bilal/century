import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { GameState } from "@shared/schema";

export function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  app.post("/api/games", async (req, res) => {
    try {
      const gameState = req.body as GameState;
      const game = await storage.createGame(gameState);
      res.json(game);
    } catch (error) {
      console.error("Error creating game:", error);
      res.status(500).json({ message: "Failed to create game" });
    }
  });

  app.get("/api/games/:id", async (req, res) => {
    try {
      const game = await storage.getGame(req.params.id);
      if (!game) {
        res.status(404).json({ message: "Game not found" });
        return;
      }
      res.json(game);
    } catch (error) {
      console.error("Error getting game:", error);
      res.status(500).json({ message: "Failed to get game" });
    }
  });

  app.put("/api/games/:id", async (req, res) => {
    try {
      const gameState = req.body as GameState;
      const game = await storage.updateGame(req.params.id, gameState);
      res.json(game);
    } catch (error) {
      console.error("Error updating game:", error);
      res.status(500).json({ message: "Failed to update game" });
    }
  });

  app.delete("/api/games/:id", async (req, res) => {
    try {
      await storage.deleteGame(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting game:", error);
      res.status(500).json({ message: "Failed to delete game" });
    }
  });

  return httpServer;
}