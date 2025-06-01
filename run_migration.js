// Script pour exécuter la migration add_numero_ville_to_beneficiaires.sql
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('./db');

const migrationFile = path.join(__dirname, 'migrations', 'add_numero_ville_to_beneficiaires.sql');

console.log('Démarrage de la migration : add_numero_ville_to_beneficiaires.sql');

// Lire le fichier SQL
fs.readFile(migrationFile, 'utf8', (err, sqlContent) => {
  if (err) {
    console.error('Erreur lors de la lecture du fichier de migration:', err);
    process.exit(1);
  }

  // Diviser le contenu en requêtes individuelles (par ';')
  const queries = sqlContent
    .split(';')
    .map(query => query.trim())
    .filter(query => query.length > 0 && !query.startsWith('--'));

  console.log(`Exécution de ${queries.length} requête(s)...`);

  // Exécuter chaque requête
  let completed = 0;
  queries.forEach((query, index) => {
    console.log(`Exécution de la requête ${index + 1}:`, query.substring(0, 50) + '...');
    
    db.query(query, (err, result) => {
      if (err) {
        console.error(`Erreur lors de l'exécution de la requête ${index + 1}:`, err);
        if (err.code !== 'ER_DUP_FIELDNAME') { // Ignorer si la colonne existe déjà
          process.exit(1);
        }
      } else {
        console.log(`Requête ${index + 1} exécutée avec succès`);
      }
      
      completed++;
      if (completed === queries.length) {
        console.log('Migration terminée avec succès !');
        process.exit(0);
      }
    });
  });
});
