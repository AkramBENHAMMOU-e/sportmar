# SportMarocShop

Une boutique en ligne complète de produits sportifs marocains avec un frontend React et un backend Express.js.

## Technologies utilisées

- **Frontend**: React.js, Vite, TailwindCSS, Shadcn/UI
- **Backend**: Express.js, Node.js
- **Base de données**: PostgreSQL (Neon Database)
- **Stockage d'images**: Cloudinary
- **Authentification**: Passport.js

## Déploiement sur Vercel

Le projet a été adapté pour être facilement déployé sur Vercel. Suivez ces étapes pour déployer l'application:

### 1. Prérequis

- Compte [Vercel](https://vercel.com/)
- Compte [Neon Database](https://neon.tech/) (ou autre fournisseur PostgreSQL)
- Compte [Cloudinary](https://cloudinary.com/)

### 2. Configuration des variables d'environnement

Avant de déployer, assurez-vous d'avoir les variables d'environnement suivantes configurées sur Vercel:

```
DATABASE_URL=votre_url_de_base_de_données
CLOUDINARY_CLOUD_NAME=votre_nom_de_cloud
CLOUDINARY_API_KEY=votre_clé_api
CLOUDINARY_API_SECRET=votre_secret_api
NODE_ENV=production
```

### 3. Déploiement

1. Connectez votre dépôt GitHub à Vercel
2. Sélectionnez le dépôt SportMarocShop
3. Configurez le projet avec les paramètres suivants:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: npm run build
   - **Output Directory**: dist/public
   - **Install Command**: npm install
4. Ajoutez les variables d'environnement mentionnées ci-dessus
5. Cliquez sur "Deploy"

## Développement local

Pour exécuter l'application en local:

1. Clonez le dépôt
2. Installez les dépendances: `npm install`
3. Créez un fichier `.env` avec les variables d'environnement nécessaires
4. Démarrez le serveur de développement: `npm run dev`

## Structure du projet

- `/client`: Code frontend React
- `/server`: Code backend Express.js
- `/api`: Points d'entrée pour les fonctions serverless Vercel
- `/shared`: Code partagé entre frontend et backend
