import dotenv from 'dotenv';
dotenv.config();
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Initialiser le serveur Express
let expressApp: any = null;

// Fonction pour démarrer l'application
async function startApp() {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Configurer différemment selon l'environnement
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // En développement ou sur un serveur normal, écouter sur le port 5000
  if (process.env.VERCEL !== '1') {
    const port = process.env.PORT || 5000;
    server.listen({
      port: Number(port),
      host: "localhost",
    }, () => {
      log(`serving on port ${port}`);
    });
  }
  
  expressApp = app;
  return server;
}

// Pour les environnements serverless comme Vercel
export default async (req: Request, res: Response) => {
  // Si l'application n'est pas déjà initialisée, initialiser
  if (!expressApp) {
    await startApp();
  }
  
  // Utiliser l'application Express pour traiter la requête
  return expressApp(req, res);
};

// Exécuter la fonction de démarrage si c'est le fichier principal
if (import.meta.url === `file://${process.argv[1]}`) {
  startApp();
}
