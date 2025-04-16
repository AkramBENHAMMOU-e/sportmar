// Ce fichier n'est pas utilisé dans l'approche monolithique.
// Nous utilisons directement server/index.ts comme point d'entrée principal.
// Ce fichier est conservé uniquement pour référence si vous souhaitez revenir à l'approche séparée.

import dotenv from 'dotenv';
dotenv.config();
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../routes";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configurer CORS pour autoriser les requêtes externes si nécessaire
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));

// Middleware de logging simplifié pour l'environnement de production
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      console.log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

const server = registerRoutes(app);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// Pour Vercel, nous devons exporter l'application Express
export default app; 