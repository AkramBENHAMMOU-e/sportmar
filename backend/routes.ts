import type { Express } from "express";
import { setupAuth } from "./auth";
import { storage } from "./storage-db";
import { insertProductSchema, cartItemSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { v2 as cloudinary } from 'cloudinary';

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUD_NAME',
  api_key: process.env.CLOUDINARY_API_KEY || 'YOUR_API_KEY',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'YOUR_API_SECRET',
  secure: true,
});

// Validation d'entrée
function validateBody(schema: z.ZodTypeAny) {
  return (req, res, next) => {
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

// Auth middleware
function isAdmin(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Non authentifié" });
  }
  
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Accès non autorisé" });
  }
  
  next();
}

export function registerRoutes(app: Express): void {
  // Auth setup
  setupAuth(app);
  
  // PRODUCT ROUTES
  
  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des produits" });
    }
  });
  
  // Get featured products
  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des produits" });
    }
  });
  
  // Get product by ID
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
  
  // Create product (admin only)
  app.post("/api/products", isAdmin, validateBody(insertProductSchema), async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Erreur lors de la création du produit" });
    }
  });
  
  // CART ROUTES
  
  // Helper functions for guest cart
  const initGuestCart = (req) => {
    if (!req.session.guestCart) {
      req.session.guestCart = {};
    }
    return req.session.guestCart;
  };
  
  // Get cart
  app.get("/api/cart", async (req, res) => {
    try {
      if (req.isAuthenticated()) {
        const cart = await storage.getCart(req.user.id);
        const cartItems = [];
        
        for (const [productId, quantity] of cart.entries()) {
          const product = await storage.getProduct(productId);
          if (product) {
            cartItems.push({ product, quantity });
          }
        }
        
        res.json(cartItems);
      } else {
        const guestCartObj = initGuestCart(req);
        const cartItems = [];
        
        for (const [productIdStr, quantity] of Object.entries(guestCartObj)) {
          const productId = parseInt(productIdStr);
          const product = await storage.getProduct(productId);
          if (product) {
            cartItems.push({ product, quantity });
          }
        }
        
        res.json(cartItems);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Erreur lors de la récupération du panier" });
    }
  });
  
  // Add to cart
  app.post("/api/cart", validateBody(cartItemSchema), async (req, res) => {
    try {
      const { productId, quantity } = req.body;
      
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }
      
      if (product.stock < quantity) {
        return res.status(400).json({ message: "Stock insuffisant" });
      }
      
      if (req.isAuthenticated()) {
        await storage.addToCart(req.user.id, productId, quantity);
        const cart = await storage.getCart(req.user.id);
        const cartItems = [];
        
        for (const [pId, qty] of cart.entries()) {
          const product = await storage.getProduct(pId);
          if (product) {
            cartItems.push({ product, quantity: qty });
          }
        }
        
        res.status(200).json(cartItems);
      } else {
        const guestCart = initGuestCart(req);
        const currentQty = guestCart[productId] || 0;
        guestCart[productId] = currentQty + quantity;
        req.session.guestCart = guestCart;
        
        const cartItems = [];
        for (const [pIdStr, qty] of Object.entries(guestCart)) {
          const pId = parseInt(pIdStr);
          const product = await storage.getProduct(pId);
          if (product) {
            cartItems.push({ product, quantity: qty });
          }
        }
        
        res.status(200).json(cartItems);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Erreur lors de l'ajout au panier" });
    }
  });
  
  // USER ROUTES
  
  // Get current user
  app.get("/api/user", (req, res) => {
      if (req.isAuthenticated()) {
      res.json(req.user);
      } else {
      res.status(401).json({ message: "Non authentifié" });
    }
  });
} 