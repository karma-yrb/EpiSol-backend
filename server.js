require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const versionInfo = require('./utils/versionInfo');
const app = express();
const port = 3001;

const secretKey = 'your_secret_key';

// CORS dynamique selon la variable d'environnement
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
app.use(cors({
  origin: [
    'https://episol.yade-services.fr',
    'https://api.episol.yade-services.fr',
    'http://localhost:3000'
  ],
  credentials: true,
}));

app.use(express.json());

const db = require('./db'); // Import the database connection from db.js

// Ajouter une route pour la racine
app.get('/', (req, res) => {
  res.send("Bienvenue à l'API de l'épicerie sociale");
});

// Route version
app.get('/api/version', (req, res) => {
  res.json(versionInfo.getVersionInfo());
});

const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

const beneficiairesRoutes = require('./routes/beneficiaires');
app.use('/api/beneficiaires', beneficiairesRoutes);

const categoriesRoutes = require('./routes/categories');
app.use('/api/categories', categoriesRoutes);

const produitsRoutes = require('./routes/produits');
app.use('/api/produits', produitsRoutes);

const achatsRoutes = require('./routes/achats');
app.use('/api/achats', achatsRoutes);

const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

// Suppression du middleware de log debug

app.get('/test', (req, res) => {
  res.status(200).send('Test route is working');
});

app.listen(port, () => {
  versionInfo.logStartup();
  console.log(`🌐 Server running on port ${port}`);
}).on('error', (err) => {
  console.error('❌ Error starting server:', err);
});

// Gestion propre des 404 (à placer tout à la fin)
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});
