const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3001;

const secretKey = 'your_secret_key';

app.use(cors({
  origin: "http://localhost:3000", // Autoriser uniquement le frontend sur le port 3000
  credentials: true,
}));

app.use(express.json());

const db = require('./db'); // Import the database connection from db.js

// Ajouter une route pour la racine
app.get('/', (req, res) => {
  res.send("Bienvenue à l'API de l'épicerie sociale");
});

const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

const beneficiairesRoutes = require('./routes/beneficiaires');
app.use('/beneficiaires', beneficiairesRoutes);

const categoriesRoutes = require('./routes/categories');
app.use('/categories', categoriesRoutes);

const produitsRoutes = require('./routes/produits');
app.use('/produits', produitsRoutes);

const achatsRoutes = require('./routes/achats');
app.use('/achats', achatsRoutes);

const usersRouter = require('./routes/users');
app.use('/api', usersRouter);

// Suppression du middleware de log debug

app.get('/test', (req, res) => {
  res.status(200).send('Test route is working');
});

app.listen(port, () => {
  // Serveur démarré
}).on('error', (err) => {
  // Erreur lors du démarrage du serveur
});

// Gestion propre des 404 (à placer tout à la fin)
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});
