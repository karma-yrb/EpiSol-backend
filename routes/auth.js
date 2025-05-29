const express = require('express');
const db = require('../db');
const { verifyPassword, generateToken } = require('../utils/authUtils');

const router = express.Router();

// Route de connexion
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error('Erreur SQL:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    if (results.length === 0) {
      console.warn('Aucun utilisateur trouvé pour', username);
      return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect' });
    }
    const user = results[0];
    try {
      const match = await verifyPassword(password, user.password);
      if (!match) {
        console.warn('Mot de passe incorrect pour', username);
        return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect' });
      }
      const token = generateToken(user);
      // Log de connexion utilisateur
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || null;
      const userAgent = req.headers['user-agent'] || null;
      db.query(
        'INSERT INTO user_logs (user_id, action, ip, user_agent) VALUES (?, ?, ?, ?)',
        [user.id, 'login', ip, userAgent],
        (logErr) => {
          if (logErr) {
            console.error('Erreur lors de l\'insertion du log de connexion:', logErr, {
              user_id: user.id, ip, userAgent
            });
          } else {
            console.log('Log de connexion inséré pour user_id', user.id);
          }
        }
      );
      console.log('Connexion réussie pour', username);
      res.status(200).json({ message: 'Connexion réussie', token, username: user.username, role: user.role });
    } catch (error) {
      console.error('Erreur lors de la vérification du mot de passe ou de la génération du token:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });
});

module.exports = router;
