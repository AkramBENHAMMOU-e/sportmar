import dotenv from 'dotenv';
dotenv.config();
import express, { type Request, Response } from "express";
import cors from "cors";
import { setupAuth } from "../server/auth";
import { storage } from "../server/storage-db";
import { insertProductSchema, insertOrderSchema, cartItemSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { v2 as cloudinary } from 'cloudinary';

// Initialiser l'application Express
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuration CORS pour l'API - plus permissive
app.use(cors({
  origin: '*', // Autoriser toutes les origines
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware de logging détaillé
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  console.log(`Headers: ${JSON.stringify(req.headers)}`);
  
  // Intercepter la réponse pour logger
  const originalSend = res.send;
  res.send = function(body) {
    console.log(`Response status: ${res.statusCode}`);
    console.log(`Response body: ${typeof body === 'object' ? JSON.stringify(body).substring(0, 200) : body}`);
    return originalSend.call(this, body);
  };
  
  next();
});

// Middleware pour ajuster le chemin de l'URL
app.use((req, res, next) => {
  // Vercel supprime le préfixe /api dans les fonctions serverless, il faut l'ajouter
  if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url === '/' ? '' : req.url}`;
  }
  next();
});

// Configurer Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUD_NAME',
  api_key: process.env.CLOUDINARY_API_KEY || 'YOUR_API_KEY',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'YOUR_API_SECRET',
  secure: true,
});

// Configurer l'authentification
setupAuth(app);

// Helper to check if user is admin
function isAdmin(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Non authentifié" });
  }
  
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Accès non autorisé" });
  }
  
  next();
}

// Helper for input validation
function validateBody(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: Function) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(400).json({ message: "Données invalides" });
      }
    }
  };
}

// Route de santé pour vérifier si l'API est en ligne
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    vercel: process.env.VERCEL === '1' ? true : false,
  });
});

// Routes simplifiées pour déboguer
app.get('/api/user', (req, res) => {
  try {
    res.json({ 
      message: "Route user fonctionne", 
      authenticated: false,
      user: null
    });
  } catch (error) {
    console.error('Erreur route user:', error);
    res.status(500).json({ message: "Erreur serveur", error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get("/api/products/featured", (req, res) => {
  try {
    res.json([
      { 
        id: 1, 
        name: "Whey Protein Premium", 
        price: 35000, 
        description: "Protéine de haute qualité pour la récupération musculaire", 
        imageUrl: "https://images.unsplash.com/photo-1579722821273-0f6d7a4bd178?q=80&w=2070&auto=format&fit=crop",
        category: "supplement",
        subcategory: "proteines",
        stock: 15,
        featured: true
      },
      {
        id: 2,
        name: "Tapis de Yoga Pro",
        price: 25000,
        description: "Tapis antidérapant haute densité pour yoga et fitness",
        imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2020&auto=format&fit=crop",
        category: "equipment",
        subcategory: "fitness",
        stock: 8,
        featured: true
      }
    ]);
  } catch (error) {
    console.error('Erreur route produits en vedette:', error);
    res.status(500).json({ message: "Erreur serveur", error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get("/api/cart", (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error('Erreur route panier:', error);
    res.status(500).json({ message: "Erreur serveur", error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Route de debug
app.get('/api/debug', (req, res) => {
  res.json({
    env: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL ? "Défini" : "Non défini",
    url: req.url,
    method: req.method,
    headers: req.headers
  });
});

// Capture toutes les autres routes API
app.all('/api/*', (req, res) => {
  res.json({
    message: `Route ${req.url} non implémentée mais reçue correctement`,
    method: req.method,
  });
});

// Gérer les erreurs
app.use((err, req, res, next) => {
  console.error('Erreur API:', err);
  res.status(500).json({
    message: "Erreur interne du serveur",
    error: err instanceof Error ? err.message : 'Unknown error'
  });
});

// Handler pour Vercel
export default async (req: Request, res: Response) => {
  try {
    return app(req, res);
  } catch (error) {
    console.error('Erreur handler serverless:', error);
    res.status(500).json({
      message: "Erreur interne du serveur",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 