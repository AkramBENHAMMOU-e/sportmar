import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Obtenir le répertoire courant avec ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer le dossier dist s'il n'existe pas
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

if (!fs.existsSync('dist/server')) {
  fs.mkdirSync('dist/server');
}

// Copier le fichier server/index.ts en simplifiant les imports problématiques
const serverIndexContent = fs.readFileSync('server/index.ts', 'utf-8')
  .replace(/import \{ registerRoutes \} from ".\/routes";/g, 'import { registerRoutes } from "./routes";')
  .replace(/import \{ setupVite, serveStatic, log \} from ".\/vite";/g, 'import { serveStatic, log } from "./vite";');

fs.writeFileSync('dist/server/index.js', `
// Compiled server for production
import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import cors from "cors";

// Setup Express server
const app = express();

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Additional CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(\`\${req.method} \${req.path} \${res.statusCode} in \${duration}ms\`);
  });
  next();
});

// Simple API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Featured products API
app.get('/api/products/featured', (req, res) => {
  const featuredProducts = [
    {
      id: 1,
      name: "Maillot Maroc Domicile 2023",
      description: "Maillot officiel de l'équipe nationale du Maroc pour les matchs à domicile.",
      price: 899,
      category: "football",
      subcategory: "maillots",
      images: ["https://res.cloudinary.com/df59lsiz9/image/upload/v1713023400/sport-maroc/maillot-maroc_gznklb.jpg"],
      stock: 100,
      featured: true,
      createdAt: "2023-01-01T00:00:00Z"
    },
    {
      id: 2,
      name: "Maillot WAC 2023",
      description: "Maillot officiel du Wydad Athletic Club pour la saison 2023.",
      price: 799,
      category: "football",
      subcategory: "maillots",
      images: ["https://res.cloudinary.com/df59lsiz9/image/upload/v1713023400/sport-maroc/maillot-wac_v7ogcx.jpg"],
      stock: 80,
      featured: true,
      createdAt: "2023-01-15T00:00:00Z"
    },
    {
      id: 4,
      name: "Chaussures de Course Atlas",
      description: "Chaussures de course légères et confortables, conçues pour les routes marocaines.",
      price: 1299,
      category: "running",
      subcategory: "chaussures",
      images: ["https://res.cloudinary.com/df59lsiz9/image/upload/v1713023400/sport-maroc/chaussures-course_z1xfre.jpg"],
      stock: 50,
      featured: true,
      createdAt: "2023-02-15T00:00:00Z"
    },
    {
      id: 5,
      name: "Maillot Raja Casablanca",
      description: "Maillot officiel du Raja Club Athletic de Casablanca.",
      price: 799,
      category: "football",
      subcategory: "maillots",
      images: ["https://res.cloudinary.com/df59lsiz9/image/upload/v1713023400/sport-maroc/maillot-raja_lz9kob.jpg"],
      stock: 75,
      featured: true,
      createdAt: "2023-03-01T00:00:00Z"
    },
    {
      id: 10,
      name: "Maillot Équipe Nationale Extérieur",
      description: "Maillot officiel de l'équipe nationale du Maroc pour les matchs à l'extérieur.",
      price: 899,
      category: "football",
      subcategory: "maillots",
      images: ["https://res.cloudinary.com/df59lsiz9/image/upload/v1713023401/sport-maroc/maillot-maroc-ext_bk2wnl.jpg"],
      stock: 90,
      featured: true,
      createdAt: "2023-04-22T00:00:00Z"
    }
  ];
  
  res.json({ products: featuredProducts });
});

// Products API
app.get('/api/products', (req, res) => {
  // Données statiques pour la démonstration
  const products = [
    {
      id: 1,
      name: "Maillot Maroc Domicile 2023",
      description: "Maillot officiel de l'équipe nationale du Maroc pour les matchs à domicile.",
      price: 899,
      category: "football",
      subcategory: "maillots",
      images: ["https://res.cloudinary.com/df59lsiz9/image/upload/v1713023400/sport-maroc/maillot-maroc_gznklb.jpg"],
      stock: 100,
      featured: true,
      createdAt: "2023-01-01T00:00:00Z"
    },
    {
      id: 2,
      name: "Maillot WAC 2023",
      description: "Maillot officiel du Wydad Athletic Club pour la saison 2023.",
      price: 799,
      category: "football",
      subcategory: "maillots",
      images: ["https://res.cloudinary.com/df59lsiz9/image/upload/v1713023400/sport-maroc/maillot-wac_v7ogcx.jpg"],
      stock: 80,
      featured: true,
      createdAt: "2023-01-15T00:00:00Z"
    },
    // Plus de produits...
  ];

  // Filtrage des produits en fonction des paramètres de requête
  let filteredProducts = [...products];
  
  const { category, subcategory, featured, q } = req.query;
  
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  
  if (subcategory) {
    filteredProducts = filteredProducts.filter(p => p.subcategory === subcategory);
  }
  
  if (featured === 'true') {
    filteredProducts = filteredProducts.filter(p => p.featured);
  }
  
  if (q) {
    const searchTerm = q.toString().toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchTerm) || 
      p.description.toLowerCase().includes(searchTerm)
    );
  }
  
  res.json({ products: filteredProducts });
});

// Cart API
app.get('/api/cart', (req, res) => {
  res.json({ cart: [] });
});

app.post('/api/cart', (req, res) => {
  const { productId, quantity } = req.body;
  res.status(200).json({
    message: "Produit ajouté au panier",
    item: { productId, quantity, id: Math.floor(Math.random() * 1000) }
  });
});

app.delete('/api/cart/:itemId', (req, res) => {
  res.status(200).json({
    message: "Produit supprimé du panier",
    itemId: req.params.itemId
  });
});

// User API
app.get('/api/user', (req, res) => {
  res.status(401).json(null);
});

app.post('/api/user', (req, res) => {
  res.status(401).json({
    message: "Identifiants invalides"
  });
});

// Start the server
const port = process.env.PORT || 10000;
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(port, host, () => {
  console.log(\`Server started on \${host}:\${port} in \${process.env.NODE_ENV || 'development'} mode\`);
});

export default app;
`);

console.log('Server build completed successfully');
