const isProduction = process.env.RENDER === 'true' || process.env.NODE_ENV === 'production';
const isTiDB = process.env.DATABASE_PROVIDER === 'tidb';
const mysql = require('mysql2');

// Configuration selon le provider de base de données
let dbConfig;

if (isTiDB) {
  // Configuration TiDB Cloud avec Pool
  dbConfig = {
    host: process.env.TIDB_HOST,
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_DATABASE,
    port: process.env.TIDB_PORT ? parseInt(process.env.TIDB_PORT) : 4000,
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: false
    },
    connectionLimit: 10,
    reconnect: true,
    acquireTimeout: 60000,
    timeout: 60000,
    keepAliveInitialDelay: 0,
    enableKeepAlive: true,
    charset: 'utf8mb4',
    timezone: 'Z'
  };
  console.log('🌐 Configuration TiDB Cloud activée (Pool)');
} else {
  // Configuration Railway/MySQL classique
  dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    charset: 'utf8mb4',
    timezone: 'Z'
  };
  console.log('🚂 Configuration Railway activée');
}

const db = isTiDB ? mysql.createPool(dbConfig) : mysql.createConnection(dbConfig);

// Test de connexion différent selon le type
if (isTiDB) {
  // Pour un pool, on teste avec getConnection
  db.getConnection((err, connection) => {
    if (err) {
      console.error('❌ Erreur de connexion TiDB Pool:', err);
    } else {
      console.log('✅ Pool TiDB Cloud connecté avec succès');
      connection.release(); // Libérer la connexion de test
    }
  });
} else {
  // Pour une connexion simple
  db.connect((err) => {
    if (err) {
      console.error('❌ Erreur de connexion à la base de données:', err);
      console.error('🔧 Vérifiez vos variables d\'environnement:', {
        provider: isTiDB ? 'TiDB Cloud' : 'Railway',
        host: isTiDB ? process.env.TIDB_HOST : process.env.DB_HOST,
        database: isTiDB ? process.env.TIDB_DATABASE : process.env.DB_NAME,
        port: isTiDB ? process.env.TIDB_PORT : process.env.DB_PORT
      });
    } else {
      console.log(`✅ Connexion à la base de données réussie (${isTiDB ? 'TiDB Cloud' : 'Railway'})`);
    }
  });
}

module.exports = db;
