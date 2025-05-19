# Documentation de déploiement Render pour le backend EpiSol

## Prérequis
- Un repo GitHub contenant le dossier backend (avec package.json, server.js, etc.)
- Un compte Render (https://dashboard.render.com/)

## Variables d'environnement à configurer sur Render
- PORT (Render le définit automatiquement)
- JWT_SECRET
- DB_HOST
- DB_USER
- DB_PASSWORD
- DB_NAME
- DB_PORT (optionnel, 3306 par défaut)
- CORS_ORIGIN (URL du frontend)

## Procédure de déploiement
1. Pousser le code du backend sur GitHub
2. Créer un nouveau Web Service sur Render
   - Type : Node
   - Build Command : npm install
   - Start Command : npm start
   - Root Directory : backend
   - Ajouter les variables d'environnement listées ci-dessus
3. Lancer le déploiement
4. Récupérer l'URL publique du backend pour la config du frontend

## Conseils
- Ne jamais commiter de vrai fichier .env avec des secrets !
- Utiliser .env.example comme référence pour la configuration sur Render.
