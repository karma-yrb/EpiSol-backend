// Fonctions utilitaires pour l'authentification
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = 'your_secret_key';

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function generateToken(user) {
  return jwt.sign(
    { username: user.username, role: user.role, id: user.id },
    secretKey,
    { expiresIn: '1h' }
  );
}

module.exports = {
  verifyPassword,
  generateToken,
  secretKey
};
