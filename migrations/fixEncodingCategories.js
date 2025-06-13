// Script de migration UTF-8 pour les catégories
// Usage: node migrations/fixEncodingCategories.js

require('dotenv').config();
const mysql = require('mysql2');

// Configuration de connexion avec charset UTF-8
const dbConfig = {
  host: process.env.TIDB_HOST,
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE,
  port: process.env.TIDB_PORT ? parseInt(process.env.TIDB_PORT) : 4000,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false
  },
  charset: 'utf8mb4',
  timezone: 'Z'
};

const connection = mysql.createConnection(dbConfig);

const fixEncodingCategories = async () => {
  console.log('🔧 Début de la correction UTF-8 des catégories...');
  
  try {
    // Connexion
    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Connexion à TiDB établie');
    
    // Liste des corrections à appliquer
    const corrections = [
      { search: 'Hygi�ne', correct: 'Hygiène' },
      { search: 'Epicerie sucr�e', correct: 'Epicerie sucrée' },
      { search: 'Epicerie sal�e', correct: 'Epicerie salée' },
      { search: 'Surgel�s', correct: 'Surgelés' },
      { search: 'D�riv�e v�g�tal', correct: 'Dérivés végétaux' },
      { search: 'Produits m�nagers', correct: 'Produits ménagers' },
      { search: 'B�b�', correct: 'Bébé' }
    ];
    
    // Appliquer chaque correction
    for (const { search, correct } of corrections) {
      const query = 'UPDATE categories SET nom = ? WHERE nom LIKE ?';
      const result = await new Promise((resolve, reject) => {
        connection.query(query, [correct, `%${search}%`], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      
      if (result.affectedRows > 0) {
        console.log(`✅ Corrigé "${search}" → "${correct}" (${result.affectedRows} lignes)`);
      }
    }
    
    // Vérifier les résultats
    const checkQuery = 'SELECT id, nom FROM categories ORDER BY nom';
    const categories = await new Promise((resolve, reject) => {
      connection.query(checkQuery, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    console.log('\n📋 État final des catégories :');
    categories.forEach(cat => {
      const hasIssue = cat.nom.includes('�');
      console.log(`${hasIssue ? '❌' : '✅'} ID ${cat.id}: "${cat.nom}"`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    connection.end();
    console.log('\n🔚 Migration terminée');
  }
};

// Exécuter la migration
fixEncodingCategories();
