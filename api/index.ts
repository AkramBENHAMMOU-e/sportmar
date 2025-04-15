import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { registerRoutes } from '../server/routes';

// Create Express app
const app = express();

// Essential middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Basic error handling
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Server error:', err);
  const status = err?.status || err?.statusCode || 500;
  const message = err?.message || 'Internal Server Error';
  res.status(status).json({ error: message });
});

// Register API routes - handle safely
// The registerRoutes function appears to return a Server directly or via Promise
try {
  // Just call the function without trying to chain promises
  registerRoutes(app);
  console.log('Routes registration initiated');
} catch (err) {
  console.error('Error during route registration setup:', err);
}

// Simple response for root path
app.get('/', (_req, res) => {
  res.send(`
    <html>
      <head>
        <title>SportMarocShop API</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; }
          p { color: #666; }
        </style>
      </head>
      <body>
        <h1>SportMarocShop API</h1>
        <p>L'API est en cours d'exécution. Pour accéder au frontend, veuillez utiliser une approche différente de déploiement.</p>
        <p>Vercel est optimisé pour les applications JAMstack, mais votre application utilise une architecture monolithique.</p>
      </body>
    </html>
  `);
});

// For Vercel serverless functions
export default app;

