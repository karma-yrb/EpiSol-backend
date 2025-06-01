// Script de test pour reproduire le bug de quantité vide
const mysql = require('mysql2');
require('dotenv').config();

// Configuration de la base de données
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'episol_db'
});

async function testQuantityBug() {
  console.log('🧪 Test du bug de quantité vide...');
  
  try {
    // 1. Insérer un achat sans lignes d'achat (pour simuler le problème de production)
    console.log('1. Insertion d\'un achat orphelin...');
    const insertResult = await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO achats (beneficiaire_id, date_achat, total) VALUES (?, NOW(), ?)',
        [1, 99.99], // bénéficiaire ID 1, total 99.99
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
    
    const achatId = insertResult.insertId;
    console.log(`✅ Achat orphelin créé avec ID: ${achatId}`);
    
    // 2. Tester la requête originale (qui cause le problème)
    console.log('2. Test requête originale (avec SUM sans COALESCE)...');
    const originalQuery = `SELECT a.id, a.date_achat, a.total, b.nom AS beneficiaire_nom, b.prenom AS beneficiaire_prenom,
      (SELECT SUM(al.quantite) FROM achats_lignes al WHERE al.achat_id = a.id) AS quantite
      FROM achats a
      JOIN beneficiaires b ON a.beneficiaire_id = b.id
      WHERE a.id = ?`;
    
    const originalResult = await new Promise((resolve, reject) => {
      db.query(originalQuery, [achatId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    console.log('📊 Résultat requête originale:', {
      id: originalResult[0].id,
      quantite: originalResult[0].quantite,
      type: typeof originalResult[0].quantite
    });
    
    // 3. Tester la requête corrigée (avec COALESCE)
    console.log('3. Test requête corrigée (avec COALESCE)...');
    const fixedQuery = `SELECT a.id, a.date_achat, a.total, b.nom AS beneficiaire_nom, b.prenom AS beneficiaire_prenom,
      COALESCE((SELECT SUM(al.quantite) FROM achats_lignes al WHERE al.achat_id = a.id), 0) AS quantite
      FROM achats a
      JOIN beneficiaires b ON a.beneficiaire_id = b.id
      WHERE a.id = ?`;
    
    const fixedResult = await new Promise((resolve, reject) => {
      db.query(fixedQuery, [achatId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    console.log('📊 Résultat requête corrigée:', {
      id: fixedResult[0].id,
      quantite: fixedResult[0].quantite,
      type: typeof fixedResult[0].quantite
    });
    
    // 4. Nettoyer l'achat test
    console.log('4. Nettoyage de l\'achat test...');
    await new Promise((resolve, reject) => {
      db.query('DELETE FROM achats WHERE id = ?', [achatId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    console.log('✅ Test terminé et nettoyé');
    
    // 5. Conclusion
    console.log('\n🔍 CONCLUSION:');
    console.log(`- Requête originale retourne: ${originalResult[0].quantite} (type: ${typeof originalResult[0].quantite})`);
    console.log(`- Requête corrigée retourne: ${fixedResult[0].quantite} (type: ${typeof fixedResult[0].quantite})`);
    
    if (originalResult[0].quantite === null) {
      console.log('🐛 BUG CONFIRMÉ: La requête originale retourne NULL pour les achats sans lignes');
      console.log('✅ SOLUTION: Utiliser COALESCE pour convertir NULL en 0');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    db.end();
  }
}

testQuantityBug();
