const express = require('express');
const router = express.Router();
const db = require('../db'); // Assurez-vous que le fichier de connexion à la base de données est correctement configuré
const bcrypt = require('bcrypt');

router.get('/users', (req, res) => {
  const query = 'SELECT id, nom, prenom, email, username, role FROM users';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(results);
    }
  });
});

router.get('/users/:id', (req, res) => {
  const query = 'SELECT id, nom, prenom, email, username, role FROM users WHERE id = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
    } else {
      res.json(results[0]);
    }
  });
});

// POST /users : création d'un utilisateur avec hashage du mot de passe
router.post('/users', async (req, res) => {
  const { nom, prenom, email, username, password, role } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Le mot de passe est requis' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (nom, prenom, email, username, password, role) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [nom, prenom, email, username, hashedPassword, role], (err, results) => {
      if (err) {
        res.status(500).json({ error: 'Erreur serveur' });
      } else {
        res.status(201).json({ id: results.insertId, nom, prenom, email, username, role });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /users/:id : mise à jour d'un utilisateur (hashage si mot de passe fourni)
router.put('/users/:id', async (req, res) => {
  const { nom, prenom, email, username, password, role } = req.body;
  let query, params;
  try {
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = 'UPDATE users SET nom = ?, prenom = ?, email = ?, username = ?, password = ?, role = ? WHERE id = ?';
      params = [nom, prenom, email, username, hashedPassword, role, req.params.id];
    } else {
      query = 'UPDATE users SET nom = ?, prenom = ?, email = ?, username = ?, role = ? WHERE id = ?';
      params = [nom, prenom, email, username, role, req.params.id];
    }
    db.query(query, params, (err, results) => {
      if (err) {
        res.status(500).json({ error: 'Erreur serveur' });
      } else if (results.affectedRows === 0) {
        res.status(404).json({ error: 'Utilisateur non trouvé' });
      } else {
        res.json({ id: req.params.id, nom, prenom, email, username, role });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/users/:id', (req, res) => {
  const query = 'DELETE FROM users WHERE id = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
    } else {
      res.status(204).send();
    }
  });
});

module.exports = router;
