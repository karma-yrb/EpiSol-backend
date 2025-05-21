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
  db.query(SQL_LISTE_ACHATS, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des achats' });
    }
    res.json(results);
  });
});

// GET détail d'un achat
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query(SQL_DETAIL_ACHAT, [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'Achat non trouvé' });
    }
    const achat = results[0];
    db.query(SQL_DETAIL_LIGNES, [id], (err2, lignes) => {
      if (err2) {
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

module.exports = router;
