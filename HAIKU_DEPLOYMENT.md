# Déploiement du backend SportMarocShop sur Haiku

Ce guide décrit les étapes pour déployer l'API backend de SportMarocShop sur Haiku.

## Prérequis

- Un compte Haiku
- L'interface CLI de Haiku installée (haiku-cli)
- Git installé

## Configuration

1. Le fichier `haiku.yml` a été créé et configuré avec les paramètres suivants :
   - Type d'application : Web (Node.js)
   - Commande de build : `npm run build`
   - Commande de démarrage : `node dist/server/index.js`
   - Variables d'environnement nécessaires

2. Le serveur a été adapté pour :
   - Écouter sur toutes les interfaces en production (`0.0.0.0`)
   - Utiliser le port fourni par Haiku via la variable d'environnement `PORT`
   - Configurer correctement CORS pour accepter les requêtes du frontend Vercel

## Procédure de déploiement

1. **Installer Haiku CLI**

```bash
npm install -g haiku-cli
```

2. **Connexion à Haiku**

```bash
haiku login
```

3. **Initialiser le projet**

```bash
haiku init
```

4. **Créer les secrets pour les variables d'environnement**

```bash
haiku secrets set DATABASE_URL="postgresql://neondb_owner:npg_GkyWtclF76xe@ep-muddy-scene-a2dyqp50-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"
haiku secrets set CLOUDINARY_CLOUD_NAME="df59lsiz9"
haiku secrets set CLOUDINARY_API_KEY="757984422153192"
haiku secrets set CLOUDINARY_API_SECRET="I3wxoL4dP_wR3tQYbfdXxHX19IM"
```

5. **Déployer l'application**

```bash
haiku deploy
```

## Connexion avec le frontend

Une fois le backend déployé, vous devrez mettre à jour le frontend avec l'URL du backend :

1. Sur Vercel, ajoutez la variable d'environnement `REACT_APP_API_URL` pointant vers votre API Haiku
2. Redéployez le frontend Vercel

## Vérification du déploiement

Pour vérifier que votre API fonctionne correctement :

```bash
curl https://votre-app.haiku.run/api/products/featured
```

## Dépannage

Si vous rencontrez des problèmes :

1. Vérifiez les logs avec `haiku logs`
2. Assurez-vous que les variables d'environnement sont correctement configurées
3. Vérifiez que CORS est correctement configuré pour autoriser les requêtes de votre frontend
