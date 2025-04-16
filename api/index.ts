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

// Configuration CORS pour l'API
app.use(cors({
  origin: true,
  credentials: true
}));

// Middleware de logging simplifié
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
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

// Configuration des routes API

// USER ROUTES
app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    // Filtrer les données sensibles
    const { password, ...user } = req.user;
    res.json(user);
  } else {
    res.status(401).json({ message: "Non authentifié" });
  }
});

// PRODUCT ROUTES
app.get("/api/products", async (req, res) => {
  try {
    const products = await storage.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des produits" });
  }
});

app.get("/api/products/featured", async (req, res) => {
  try {
    const products = await storage.getFeaturedProducts();
    res.json(products);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des produits" });
  }
});

app.get("/api/products/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const products = await storage.getProductsByCategory(category);
    res.json(products);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des produits" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID produit invalide" });
    }
    
    const product = await storage.getProduct(id);
    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Erreur lors de la récupération du produit" });
  }
});

// CART ROUTES
// Initialiser le panier dans la session pour les utilisateurs non connectés
const initGuestCart = (req) => {
  if (!req.session.guestCart) {
    // Stocker le panier comme un objet JS standard (pas de Map) dans la session
    req.session.guestCart = {};
  }
  return req.session.guestCart;
};

// Get cart
app.get("/api/cart", async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      // Utilisateur connecté - récupérer le panier depuis le stockage
      const cart = await storage.getCart(req.user.id);
      
      // Convertir la Map en tableau d'items avec les détails produits
      const cartItems = [];
      for (const [productId, quantity] of cart.entries()) {
        const product = await storage.getProduct(productId);
        if (product) {
          cartItems.push({
            product,
            quantity,
          });
        }
      }
      
      res.json(cartItems);
    } else {
      // Utilisateur non connecté - récupérer le panier depuis la session
      const guestCartObj = initGuestCart(req);
      const cartItems = [];
      
      // Convertir l'objet panier en tableau d'items avec les détails produits
      for (const [productIdStr, quantity] of Object.entries(guestCartObj)) {
        const productId = parseInt(productIdStr);
        const product = await storage.getProduct(productId);
        if (product) {
          cartItems.push({
            product,
            quantity,
          });
        }
      }
      
      res.json(cartItems);
    }
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Erreur lors de la récupération du panier" });
  }
});

// Handler pour Vercel
export default async (req: Request, res: Response) => {
  return app(req, res);
}; 