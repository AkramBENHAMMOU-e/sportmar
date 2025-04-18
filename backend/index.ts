import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import { registerRoutes } from "./routes";
import cors from 'cors';
import session from 'express-session';
import MemoryStore from 'memorystore';

const MemoryStoreSession = MemoryStore(session);
const app = express();

// Middleware de base
app.use(cors({
  origin: ['https://sportmarocshop.vercel.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Session simplifiée
app.use(session({
  secret: process.env.SESSION_SECRET || 'sportmarocshop-secret',
  resave: false,
  saveUninitialized: false,
  store: new MemoryStoreSession({
    checkPeriod: 86400000 // 24 heures
  })
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging minimal
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Page d'accueil simple
app.get('/', (req, res) => {
  res.send('SportMarocShop API fonctionne');
});

// Enregistrer toutes les routes
registerRoutes(app);

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: err.message || 'Erreur interne du serveur' });
});

// Pour Vercel serverless
export default app; 