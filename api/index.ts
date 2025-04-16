import dotenv from 'dotenv';
dotenv.config();
import express, { type Request, Response } from "express";
import cors from "cors";
import { registerRoutes } from "../server/routes";

// Initialiser l'application Express
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuration CORS pour l'API
app.use(cors({
  origin: true,
  credentials: true
}));

// Middleware de logging simplifié
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.path}`);
  next();
});

// Initialiser les routes
const server = registerRoutes(app);

// Handler pour Vercel
export default async (req: Request, res: Response) => {
  return app(req, res);
}; 