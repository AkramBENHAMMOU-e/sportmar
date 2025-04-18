# SportMarocShop

Une plateforme e-commerce de produits de fitness et de nutrition sportive au Maroc.

## Structure du projet

- `frontend/` : Application React/Vite (client)
- `backend/` : Serveur Express (API)
- `shared/` : Types et validations partagés

## Déploiement

### Déploiement du backend sur Vercel

1. Créez un compte sur [Vercel](https://vercel.com) si vous n'en avez pas déjà un.
2. Installez l'outil CLI Vercel : `npm i -g vercel`
3. Configurez les variables d'environnement dans le dashboard Vercel :
   - `NODE_ENV`: production
   - `CLOUDINARY_CLOUD_NAME`: Votre nom de cloud Cloudinary
   - `CLOUDINARY_API_KEY`: Votre clé API Cloudinary
   - `CLOUDINARY_API_SECRET`: Votre secret API Cloudinary
   - `SESSION_SECRET`: Une chaîne aléatoire pour les sessions

4. Déployez le backend :
```bash
cd backend
vercel
```

5. Après le déploiement, notez l'URL générée et mettez-la à jour dans le fichier `.env` du frontend :
```
VITE_API_URL=https://votre-backend.vercel.app/api
```

### Déploiement du frontend sur Vercel

1. Déployez le frontend :
```bash
cd frontend
vercel
```

2. Configurez les variables d'environnement dans le dashboard Vercel :
   - `VITE_API_URL`: URL du backend déployé (https://votre-backend.vercel.app/api)

## Développement local

1. Installez les dépendances :
```bash
cd backend && npm install
cd frontend && npm install
```

2. Démarrez les serveurs de développement :
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

3. Accédez au site à http://localhost:3000 