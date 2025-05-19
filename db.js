const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost', // Remplacez par l'hôte de votre base de données
  user: 'root', // Remplacez par votre nom d'utilisateur MySQL
  password: '089122', // Remplacez par votre mot de passe MySQL
  database: 'episol' // Remplacez par le nom de votre base de données
});

db.connect((err) => {
  if (err) {
    process.exit(1);
  } else {
    // Connexion réussie
  }
});

module.exports = db;
