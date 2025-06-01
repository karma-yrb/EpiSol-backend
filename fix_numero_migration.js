const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'episol'
});

async function executeQuery(query, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔄 ${description}`);
    console.log(`SQL: ${query.substring(0, 100)}${query.length > 100 ? '...' : ''}`);
    
    db.query(query, (err, results) => {
      if (err) {
        console.error(`❌ Erreur: ${err.message}`);
        reject(err);
      } else {
        console.log(`✅ Succès`);
        if (results && results.length > 0) {
          console.log('Résultats:', results);
        } else if (results && results.affectedRows !== undefined) {
          console.log(`Lignes affectées: ${results.affectedRows}`);
        }
        resolve(results);
      }
    });
  });
}

async function fixNumeroBeneficiaire() {
  try {
    console.log('🚀 Début de la migration: Correction et limitation numéro bénéficiaire');
    
    // Étape 1: Vérifier les données problématiques
    await executeQuery(
      "SELECT id, nom, prenom, numero, LENGTH(numero) as longueur FROM beneficiaires WHERE numero = '' OR numero IS NULL OR LENGTH(numero) > 5",
      "Vérification des numéros problématiques"
    );
    
    // Étape 2: Trouver le numéro maximum
    const maxResult = await executeQuery(
      "SELECT COALESCE(MAX(CAST(numero AS UNSIGNED)), 0) as max_numero FROM beneficiaires WHERE numero REGEXP '^[0-9]+$'",
      "Recherche du numéro maximum"
    );
    
    const maxNumero = maxResult[0].max_numero;
    const nextNumero = maxNumero + 1;
    console.log(`📊 Numéro maximum trouvé: ${maxNumero}, prochain: ${nextNumero}`);
    
    // Étape 3: Corriger les numéros vides
    await executeQuery(
      `UPDATE beneficiaires SET numero = '${nextNumero}' WHERE numero = '' OR numero IS NULL`,
      "Correction des numéros vides"
    );
    
    // Étape 4: Vérifier que tous les numéros sont maintenant valides
    await executeQuery(
      "SELECT numero, LENGTH(numero) as longueur FROM beneficiaires WHERE NOT (numero REGEXP '^[0-9]{1,5}$')",
      "Vérification des numéros invalides restants"
    );
    
    // Étape 5: Modifier la colonne
    await executeQuery(
      "ALTER TABLE beneficiaires MODIFY COLUMN numero VARCHAR(5) NOT NULL",
      "Modification de la colonne numero (VARCHAR(5) NOT NULL)"
    );
    
    // Étape 6: Ajouter la contrainte CHECK
    await executeQuery(
      "ALTER TABLE beneficiaires ADD CONSTRAINT chk_numero_format CHECK (numero REGEXP '^[0-9]{1,5}$')",
      "Ajout de la contrainte CHECK"
    );
    
    // Vérification finale
    await executeQuery(
      "SELECT id, nom, prenom, numero, LENGTH(numero) as longueur FROM beneficiaires ORDER BY CAST(numero AS UNSIGNED)",
      "Vérification finale - tous les bénéficiaires"
    );
    
    console.log('\n🎉 Migration terminée avec succès !');
    
  } catch (error) {
    console.error('\n💥 Erreur durant la migration:', error.message);
  } finally {
    db.end();
  }
}

// Exécuter la migration
fixNumeroBeneficiaire();
