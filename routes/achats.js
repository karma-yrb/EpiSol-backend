const express = require('express');
const router = express.Router();
const db = require('../db');
const {
  calcTotalAchat,
  SQL_INSERT_ACHAT,
  SQL_INSERT_ACHAT_LIGNES,
  SQL_LISTE_ACHATS,
  SQL_DETAIL_ACHAT,
  SQL_DETAIL_LIGNES,
  SQL_DELETE_ACHAT
} = require('../utils/achatsUtils');

// POST enregistrer un achat
router.post('/', (req, res) => {
  const { beneficiaire_id, lignes } = req.body;
  console.log('[BACKEND] POST /achats - body reçu:', req.body);
  if (!beneficiaire_id || !Array.isArray(lignes) || lignes.length === 0) {
    console.log('[BACKEND] POST /achats - requête invalide');
    return res.status(400).json({ error: 'Bénéficiaire et lignes d\'achat requis' });
  }
  const total = calcTotalAchat(lignes);
  db.query(
    SQL_INSERT_ACHAT,
    [beneficiaire_id, total],
    (err, result) => {
      if (err) {
        console.error('[BACKEND] POST /achats - erreur SQL INSERT ACHAT:', err);
        return res.status(500).json({ error: 'Erreur lors de l\'enregistrement de l\'achat' });
      }
      const achat_id = result.insertId;
      const lignesValues = lignes.map(l => [achat_id, l.produit_id, l.quantite, l.prix_unitaire]);
      db.query(
        SQL_INSERT_ACHAT_LIGNES,
        [lignesValues],
        (err2) => {
          if (err2) {
            console.error('[BACKEND] POST /achats - erreur SQL INSERT LIGNES:', err2);
            return res.status(500).json({ error: 'Erreur lors de l\'enregistrement des lignes d\'achat' });
          }
          console.log('[BACKEND] POST /achats - achat enregistré avec succès, id:', achat_id);
          res.status(201).json({ success: true, achat_id });
        }
      );
    }
  );
});

// GET liste des achats (historique)
router.get('/', (req, res) => {
  console.log('[BACKEND] GET /api/achats - accès reçu');
  db.query(SQL_LISTE_ACHATS, (err, results) => {
    if (err) {
      console.error('[BACKEND] GET /api/achats - erreur SQL:', err);
      return res.status(500).json({ error: 'Erreur lors de la récupération des achats' });
    }
    res.json(results);
  });
});

// GET détail d'un achat
router.get('/:id', (req, res) => {
  const { id } = req.params;
  console.log('[BACKEND] GET /api/achats/:id - id reçu:', id); // LOG DEBUG
  db.query(SQL_DETAIL_ACHAT, [id], (err, results) => {
    console.log('[BACKEND] Résultat SQL_DETAIL_ACHAT:', { err, results }); // LOG DEBUG
    if (err || results.length === 0) {
      console.warn('[BACKEND] GET /api/achats/:id - achat non trouvé ou erreur SQL', { id, err, results }); // LOG DEBUG
      return res.status(404).json({ error: 'Achat non trouvé' });
    }
    const achat = results[0];
    db.query(SQL_DETAIL_LIGNES, [id], (err2, lignes) => {
      console.log('[BACKEND] Résultat SQL_DETAIL_LIGNES:', { err2, lignes }); // LOG DEBUG
      if (err2) {
        console.error('[BACKEND] GET /api/achats/:id - erreur SQL_DETAIL_LIGNES', { id, err2 }); // LOG DEBUG
        return res.status(500).json({ error: 'Erreur lors de la récupération des lignes d\'achat' });
      }
      achat.lignes = lignes;
      res.json(achat);
    });
  });
});

// DELETE un achat
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query(SQL_DELETE_ACHAT, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la suppression de l\'achat' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Achat non trouvé' });
    }
    res.json({ success: true });
  });
});

// POST liste des achats par bénéficiaire
router.post('/liste-achats', (req, res) => {
  const { beneficiaireId } = req.body;
  if (!beneficiaireId) {
    return res.status(400).json({ error: 'beneficiaireId is required' });
  }

  // Construction robuste de la requête SQL
  let sql = SQL_LISTE_ACHATS.trim().replace(/;$/, '');
  const hasWhere = /where/i.test(sql);
  if (/order by/i.test(sql)) {
    sql = sql.replace(/order by/i, `${hasWhere ? 'AND' : 'WHERE'} a.beneficiaire_id = ? ORDER BY`);
  } else {
    sql += `${hasWhere ? ' AND' : ' WHERE'} a.beneficiaire_id = ?`;
  }

  db.query(
    sql,
    [beneficiaireId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la récupération des achats', details: err });
      }
      if (!results || results.length === 0) {
        return res.status(404).json({ error: 'No purchases found for this beneficiary' });
      }
      res.status(200).json({ achats: results });
    }
  );
});

module.exports = router;
