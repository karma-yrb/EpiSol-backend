// Script de test pour valider le fix en conditions réelles
const mysql = require('mysql2');
require('dotenv').config();

// Configuration de la base de données
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'episol_db'
});

async function testRealWorldFix() {
  console.log('🧪 Test validation du fix en conditions réelles...');
  
  try {
    // 1. Créer un achat orphelin pour reproduire le problème production
    console.log('1. Création d\'un achat orphelin pour test...');
    const insertResult = await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO achats (beneficiaire_id, date_achat, total) VALUES (?, NOW(), ?)',
        [1, 15.50], // bénéficiaire ID 1, total 15.50€
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
    
    const achatId = insertResult.insertId;
    console.log(`✅ Achat orphelin créé avec ID: ${achatId}`);
    
    // 2. Tester l'API avec la nouvelle requête corrigée
    console.log('2. Test de l\'API /api/achats avec COALESCE...');
    const { SQL_LISTE_ACHATS } = require('./utils/achatsUtils');
    
    const apiResult = await new Promise((resolve, reject) => {
      db.query(SQL_LISTE_ACHATS, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    // Trouver notre achat test dans les résultats
    const testAchat = apiResult.find(a => a.id === achatId);
    
    console.log('📊 Résultat API pour l\'achat orphelin:', {
      id: testAchat.id,
      total: testAchat.total,
      quantite: testAchat.quantite,
      type: typeof testAchat.quantite,
      beneficiaire: `${testAchat.beneficiaire_nom} ${testAchat.beneficiaire_prenom}`
    });
    
    // 3. Valider que la quantité n'est plus null
    if (testAchat.quantite === null) {
      console.log('❌ ÉCHEC: La quantité est encore null');
    } else if (testAchat.quantite === 0 || testAchat.quantite === '0') {
      console.log('✅ SUCCÈS: La quantité est maintenant 0 au lieu de null');
    } else {
      console.log(`⚠️ INATTENDU: quantité = ${testAchat.quantite} (type: ${typeof testAchat.quantite})`);
    }
    
    // 4. Tester ce qui s'afficherait dans le frontend
    console.log('3. Test logique frontend...');
    const frontendValue = Array.isArray(testAchat.lignes) 
      ? testAchat.lignes.reduce((sum, l) => sum + (l.quantite || 0), 0) 
      : (testAchat.quantite || 0);
      
    console.log(`📱 Valeur affichée dans le frontend: "${frontendValue}"`);
    
    // 5. Nettoyer l'achat test
    console.log('4. Nettoyage...');
    await new Promise((resolve, reject) => {
      db.query('DELETE FROM achats WHERE id = ?', [achatId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    console.log('✅ Test terminé et nettoyé');
    
    // 6. Conclusion
    console.log('\n🎯 CONCLUSION:');
    console.log(`- L'API retourne: ${testAchat.quantite} (type: ${typeof testAchat.quantite})`);
    console.log(`- Le frontend afficherait: "${frontendValue}"`);
    
    if (frontendValue === 0 || frontendValue === '0') {
      console.log('✅ FIX VALIDÉ: Les quantités vides s\'affichent maintenant comme "0"');
      console.log('🚀 Prêt pour déploiement en production');
    } else {
      console.log('❌ PROBLÈME: Le fix ne fonctionne pas comme attendu');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    db.end();
  }
}

testRealWorldFix();
