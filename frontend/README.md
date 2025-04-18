# SportMarocShop Frontend

Ce répertoire contient le frontend de l'application SportMarocShop, une plateforme e-commerce pour la vente de produits sportifs au Maroc.

## Structure du projet

- `src/` - Code source principal
  - `components/` - Composants React réutilisables
  - `hooks/` - Hooks React personnalisés
  - `lib/` - Utilitaires et fonctions d'aide
  - `pages/` - Pages de l'application
- `public/` - Ressources statiques
- `shared/` - Types et schémas partagés avec le backend

## Technologies utilisées

- React avec TypeScript
- Vite comme bundler
- TailwindCSS pour le styling
- Shadcn UI (basé sur Radix UI)
- React Query pour la gestion des données
- Wouter pour le routing
- React Hook Form pour les formulaires
- Zod pour la validation
- Stripe pour l'intégration des paiements

## Installation

```bash
# Installer les dépendances
npm install
```

## Développement

```bash
# Démarrer le serveur de développement sur le port 3000
npm run dev
```

## Production

```bash
# Construire pour la production
npm run build

# Prévisualiser la build
npm run preview
```

## Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=votre_clé_publique_stripe
```

## Communication avec le backend

Le frontend communique avec le backend via des requêtes API REST. Par défaut, il suppose que le backend est accessible à l'URL spécifiée dans `VITE_API_URL`. 