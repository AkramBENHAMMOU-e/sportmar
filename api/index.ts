import dotenv from 'dotenv';
dotenv.config();
import express, { type Request, Response } from "express";
import cors from "cors";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { insertUserSchema, insertProductSchema, cartItemSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { v2 as cloudinary } from 'cloudinary';

// Configuration Neon Database
neonConfig.webSocketConstructor = ws;
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_GkyWtclF76xe@ep-muddy-scene-a2dyqp50-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require";
const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool, { schema });

// Fonction pour hacher un mot de passe
const scryptAsync = promisify(scrypt);
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Vérifier un mot de passe
async function verifyPassword(storedPassword: string, suppliedPassword: string) {
  const [hashedPassword, salt] = storedPassword.split('.');
  const hashedPasswordBuf = Buffer.from(hashedPassword, 'hex');
  const suppliedPasswordBuf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
  return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
}

// Initialiser l'application Express
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuration CORS pour l'API
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Configuration de la session
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 heures
  }
}));

// Initialiser Passport
app.use(passport.initialize());
app.use(passport.session());

// Configurer la stratégie d'authentification locale
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    // Chercher l'utilisateur par nom d'utilisateur
    const users = await db.select().from(schema.users).where(eb => eb.eq(schema.users.username, username));
    const user = users[0];
    
    if (!user) {
      return done(null, false, { message: 'Nom d\'utilisateur incorrect' });
    }
    
    // Vérifier le mot de passe
    const isValid = await verifyPassword(user.password, password);
    if (!isValid) {
      return done(null, false, { message: 'Mot de passe incorrect' });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Sérialisation et désérialisation de l'utilisateur
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const users = await db.select().from(schema.users).where(eb => eb.eq(schema.users.id, id));
    done(null, users[0]);
  } catch (error) {
    done(error);
  }
});

// Configurer Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUD_NAME',
  api_key: process.env.CLOUDINARY_API_KEY || 'YOUR_API_KEY',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'YOUR_API_SECRET',
  secure: true,
});

// Middleware de logging
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// Middleware pour ajuster le chemin de l'URL
app.use((req, res, next) => {
  if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url === '/' ? '' : req.url}`;
  }
  next();
});

// Helper pour vérifier si un utilisateur est administrateur
function isAdmin(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Non authentifié" });
  }
  
  if (!(req.user as any).isAdmin) {
    return res.status(403).json({ message: "Accès non autorisé" });
  }
  
  next();
}

// Helper pour la validation des données
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

// ROUTES API

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    vercel: process.env.VERCEL === '1' ? true : false,
    database: 'connected'
  });
});

// ROUTES D'AUTHENTIFICATION

// Obtenir l'utilisateur courant
app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  } else {
    res.status(401).json({ message: "Non authentifié" });
  }
});

// Connexion
app.post('/api/auth/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message || "Échec de l'authentification" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    });
  })(req, res, next);
});

// Inscription
app.post('/api/auth/register', validateBody(insertUserSchema), async (req, res) => {
  try {
    // Vérifier si le nom d'utilisateur existe déjà
    const existingUsers = await db.select().from(schema.users).where(eb => eb.eq(schema.users.username, req.body.username));
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Ce nom d'utilisateur est déjà pris" });
    }
    
    // Vérifier si l'email existe déjà
    const existingEmails = await db.select().from(schema.users).where(eb => eb.eq(schema.users.email, req.body.email));
    if (existingEmails.length > 0) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }
    
    // Hacher le mot de passe
    const hashedPassword = await hashPassword(req.body.password);
    
    // Insérer l'utilisateur
    const [newUser] = await db.insert(schema.users).values({
      ...req.body,
      password: hashedPassword,
      isAdmin: false,
      createdAt: new Date()
    }).returning();
    
    // Connecter l'utilisateur automatiquement
    req.logIn(newUser, (err) => {
      if (err) {
        return res.status(500).json({ message: "Erreur lors de la connexion automatique" });
      }
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    res.status(500).json({ message: "Erreur lors de l'inscription" });
  }
});

// Déconnexion
app.post('/api/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Erreur lors de la déconnexion" });
    }
    res.json({ message: "Déconnecté avec succès" });
  });
});

// ROUTES PRODUITS

// Obtenir tous les produits
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.select().from(schema.products);
    res.json(products);
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des produits" });
  }
});

// Obtenir les produits en vedette
app.get('/api/products/featured', async (req, res) => {
  try {
    const products = await db.select().from(schema.products).where(eb => eb.eq(schema.products.featured, true));
    res.json(products);
  } catch (error) {
    console.error("Erreur lors de la récupération des produits en vedette:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des produits" });
  }
});

// Obtenir un produit par ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID produit invalide" });
    }
    
    const products = await db.select().from(schema.products).where(eb => eb.eq(schema.products.id, id));
    if (products.length === 0) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    
    res.json(products[0]);
  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error);
    res.status(500).json({ message: "Erreur lors de la récupération du produit" });
  }
});

// Obtenir les produits par catégorie
app.get('/api/products/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const products = await db.select().from(schema.products).where(eb => eb.eq(schema.products.category, category));
    res.json(products);
  } catch (error) {
    console.error("Erreur lors de la récupération des produits par catégorie:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des produits" });
  }
});

// ROUTES PANIER

// Initialiser le panier dans la session
const initGuestCart = (req) => {
  if (!req.session.guestCart) {
    req.session.guestCart = {};
  }
  return req.session.guestCart;
};

// Obtenir le panier
app.get('/api/cart', async (req, res) => {
  try {
    // Pour le moment, simplifier et retourner un panier vide
    res.json([]);
  } catch (error) {
    console.error("Erreur lors de la récupération du panier:", error);
    res.status(500).json({ message: "Erreur lors de la récupération du panier" });
  }
});

// Route de debug
app.get('/api/debug', (req, res) => {
  res.json({
    env: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL ? "Défini" : "Non défini",
    url: req.url,
    method: req.method,
    headers: req.headers,
    authenticated: req.isAuthenticated ? req.isAuthenticated() : false,
    user: req.user ? (({ password, ...rest }) => rest)(req.user as any) : null
  });
});

// Capture toutes les autres routes API
app.all('/api/*', (req, res) => {
  res.status(404).json({
    message: `Route ${req.url} non trouvée`,
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