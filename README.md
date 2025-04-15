# SportMarocShop

## Déploiement sur Render.com

### Prérequis
- Un compte [Render.com](https://render.com)
- Votre code sur GitHub (recommandé pour un déploiement facile)

### Instructions de déploiement

1. **Créez un nouveau service Web sur Render**
   - Connectez-vous à votre compte Render
   - Cliquez sur "New +" puis sélectionnez "Web Service"
   - Connectez votre dépôt GitHub ou choisissez "Upload Files" pour télécharger votre code

2. **Configurez votre application**
   - Nom : SportMarocShop (ou le nom de votre choix)
   - Runtime : Node
   - Build Command : `npm install && npm run build`
   - Start Command : `npm start`

3. **Configurez les variables d'environnement**
   - Dans l'onglet "Environment", ajoutez les variables suivantes :
     ```
     NODE_ENV=production
     DATABASE_URL=postgresql://neondb_owner:npg_GkyWtclF76xe@ep-muddy-scene-a2dyqp50-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
     CLOUDINARY_CLOUD_NAME=df59lsiz9
     CLOUDINARY_API_KEY=757984422153192
     CLOUDINARY_API_SECRET=I3wxoL4dP_wR3tQYbfdXxHX19IM
     ```

4. **Déployez votre application**
   - Cliquez sur "Create Web Service"
   - Render va automatiquement construire et déployer votre application
   - Une fois le déploiement terminé, cliquez sur l'URL fournie pour accéder à votre application

### Notes importantes

- Assurez-vous que votre base de données Neon est accessible depuis Render.com
- Si vous rencontrez des problèmes, vérifiez les logs dans le tableau de bord Render
- Render fournit un sous-domaine gratuit (votreapp.onrender.com) mais vous pouvez configurer un domaine personnalisé dans les paramètres
