// Fonctions utilitaires pour l'authentification
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = 'your_secret_key';

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function generateToken(user) {
  // Ajoute is_admin booléen dans le token selon le champ role
  const is_admin = user.role === 'admin' || user.role === 1 || user.role === true || user.role === '1' || user.is_admin === true;
  return jwt.sign(
    { username: user.username, role: user.role, id: user.id, is_admin },
    secretKey,
    { expiresIn: '1h' }
  );
}

module.exports = {
  verifyPassword,
  generateToken,
  secretKey
};
