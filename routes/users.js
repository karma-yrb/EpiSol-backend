const express = require('express');
const router = express.Router();
const db = require('../db'); // Assurez-vous que le fichier de connexion à la base de données est correctement configuré
const bcrypt = require('bcrypt');

// Middleware pour restreindre les actions des admins sur les autres admins/superadmins
function restrictAdminActions(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    // Pour la création, on bloque si on tente de créer un admin ou superadmin
    if (req.method === 'POST' && ['admin', 'superadmin'].includes(req.body.role)) {
      return res.status(403).json({ error: 'Un admin ne peut pas créer un admin ou superadmin.' });
    }
    // Pour la suppression, on doit vérifier le rôle de la cible
    if (req.method === 'DELETE') {
      const userId = req.params.id;
      db.query('SELECT role FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Erreur serveur' });
        if (results.length && ['admin', 'superadmin'].includes(results[0].role)) {
          return res.status(403).json({ error: 'Un admin ne peut pas supprimer un admin ou superadmin.' });
        }
        next();
      });
      return;
    }
    // Pour la mise à jour, on bloque si on tente de promouvoir un user en admin/superadmin
    if (req.method === 'PUT' && ['admin', 'superadmin'].includes(req.body.role)) {
      return res.status(403).json({ error: 'Un admin ne peut pas promouvoir un utilisateur en admin ou superadmin.' });
    }
  }
  next();
}

// Liste des utilisateurs (filtrage pour les admins)
router.get('/', (req, res) => {
  let query = 'SELECT id, nom, prenom, email, username, role FROM users';
  let params = [];
  if (req.user && req.user.role === 'admin') {
    query += " WHERE role != 'admin' AND role != 'superadmin'";
  }
  db.query(query, params, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(results);
    }
  });
});

// Détail d'un utilisateur (filtrage pour les admins)
router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
    } else {
      // Si admin, masquer les admins/superadmins
      if (req.user && req.user.role === 'admin' && ['admin', 'superadmin'].includes(results[0].role)) {
        return res.status(403).json({ error: 'Un admin ne peut pas voir cet utilisateur.' });
      }
      res.json(results[0]);
    }
  });
});

// Création d'un utilisateur
router.post('/', restrictAdminActions, async (req, res) => {
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

// Mise à jour d'un utilisateur
router.put('/:id', restrictAdminActions, async (req, res) => {
  const { nom, prenom, email, username, password, role } = req.body;
  let query, params;
  try {
    if (typeof password === 'string' && password.trim() !== '') {
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

// Suppression d'un utilisateur
router.delete('/:id', restrictAdminActions, (req, res) => {
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

// Logs de connexion d'un utilisateur
router.get('/:id/logs', (req, res) => {
  const userId = req.params.id;
  console.log(`[BACKEND] GET /api/users/${userId}/logs - accès reçu`);
  db.query(
    'SELECT id, action, ip, user_agent, created_at FROM user_logs WHERE user_id = ? AND action = "login" ORDER BY created_at DESC',
    [userId],
    (err, results) => {
      if (err) {
        console.error(`[BACKEND] GET /api/users/${userId}/logs - erreur SQL:`, err);
        res.status(500).json({ error: 'Erreur lors de la récupération des logs' });
      } else {
        // Toujours retourner un tableau (même vide)
        res.json(Array.isArray(results) ? results : []);
      }
    }
  );
});

module.exports = router;
