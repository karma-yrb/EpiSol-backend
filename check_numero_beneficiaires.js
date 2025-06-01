// Script pour vérifier les numéros de bénéficiaires avant migration
require('dotenv').config();
const mysql = require('mysql');

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'episol',
  port: process.env.DB_PORT || 3306
});

db.connect((err) => {
  if (err) {
    console.error('❌ Erreur de connexion à la base de données:', err);
    return;
  }
  console.log('✅ Connexion à la base de données réussie\n');
});

console.log('🔍 Vérification des numéros de bénéficiaires...\n');

// Vérifier les numéros problématiques
db.query(`
  SELECT numero, LENGTH(numero) as longueur 
  FROM beneficiaires 
  WHERE LENGTH(numero) > 5 OR numero NOT REGEXP '^[0-9]+$'
`, (err, problematicResults) => {
  if (err) {
    console.error('❌ Erreur lors de la vérification:', err);
    return;
  }
  
  console.log('📊 Numéros problématiques (plus de 5 chiffres ou contenant des caractères non numériques):');
  if (problematicResults.length === 0) {
    console.log('✅ Aucun numéro problématique trouvé');
  } else {
    console.table(problematicResults);
  }
  
  // Vérifier tous les numéros
  db.query(`
    SELECT numero, LENGTH(numero) as longueur 
    FROM beneficiaires 
    ORDER BY LENGTH(numero) DESC, numero
  `, (err, allResults) => {
    if (err) {
      console.error('❌ Erreur lors de la récupération:', err);
      return;
    }
    
    console.log('\n📋 Tous les numéros (triés par longueur décroissante):');
    console.table(allResults);
    
    // Statistiques
    const longueurs = allResults.map(r => r.longueur);
    const maxLength = Math.max(...longueurs);
    const minLength = Math.min(...longueurs);
    const avgLength = (longueurs.reduce((a, b) => a + b, 0) / longueurs.length).toFixed(2);
    
    console.log('\n📈 Statistiques:');
    console.log(`   Longueur maximum: ${maxLength}`);
    console.log(`   Longueur minimum: ${minLength}`);
    console.log(`   Longueur moyenne: ${avgLength}`);
    console.log(`   Total bénéficiaires: ${allResults.length}`);
    
    // Compter par longueur
    const countByLength = {};
    longueurs.forEach(l => {
      countByLength[l] = (countByLength[l] || 0) + 1;
    });
    
    console.log('\n📊 Répartition par longueur:');
    Object.keys(countByLength).sort().forEach(length => {
      console.log(`   ${length} chiffres: ${countByLength[length]} bénéficiaires`);
    });
    
    db.end();
  });
});
