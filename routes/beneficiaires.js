const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all beneficiaires
router.get('/', (req, res) => {
  console.log('[BACKEND] GET /api/beneficiaires - accès reçu');
  db.query('SELECT * FROM beneficiaires', (err, results) => {
    if (err) {
      console.error('[BACKEND] GET /api/beneficiaires - erreur SQL:', err);
      res.status(500).json({ error: 'Erreur lors de la récupération des bénéficiaires' });
    } else {
      res.json(results);
    }
  });
});

// GET one beneficiaire by id
router.get('/:id', (req, res) => {
  const id = req.params.id;
  console.log(`[BACKEND] GET /api/beneficiaires/${id} - accès reçu`);
  db.query('SELECT * FROM beneficiaires WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error(`[BACKEND] GET /api/beneficiaires/${id} - erreur SQL:`, err);
      res.status(500).json({ error: 'Erreur lors de la récupération du bénéficiaire' });
    } else if (results.length === 0) {
      console.warn(`[BACKEND] GET /api/beneficiaires/${id} - bénéficiaire non trouvé`);
      res.status(404).json({ error: 'Bénéficiaire non trouvé' });
    } else {
      console.log(`[BACKEND] GET /api/beneficiaires/${id} - bénéficiaire trouvé:`, results[0]);
      res.json(results[0]);
    }
  });
});

// DELETE beneficiaire
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM beneficiaires WHERE id = ?', [id], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Erreur lors de la suppression du bénéficiaire' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Bénéficiaire non trouvé' });
    } else {
      res.json({ success: true });
    }
  });
});

// PUT update beneficiaire
router.put('/:id', (req, res) => {
  const { id } = req.params;
  let { nom, prenom, adresse, telephone, email, numero, ville, dateNaissance, discount } = req.body;
  function toMysqlDate(val) {
    if (!val) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    return null;
  }
  const date_naissance_final = toMysqlDate(dateNaissance);
  db.query('SELECT id FROM beneficiaires WHERE numero = ? AND id != ?', [numero, id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Erreur lors de la vérification du numéro de bénéficiaire" });
    }
    if (results.length > 0) {
      return res.status(400).json({ error: "Ce numéro de bénéficiaire est déjà enregistré pour un autre bénéficiaire." });
    }    const sql = 'UPDATE beneficiaires SET nom = ?, prenom = ?, date_naissance = ?, adresse = ?, telephone = ?, email = ?, numero = ?, ville = ?, discount = ? WHERE id = ?';
    const values = [
      nom || '', 
      prenom || '', 
      date_naissance_final || null, 
      adresse || null, 
      telephone || null, 
      email || null, 
      numero || '', 
      ville || null, 
      (discount !== undefined ? discount : 50), 
      id
    ];
    db.query(sql, values, (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: "Ce numéro de bénéficiaire est déjà enregistré (contrainte d'unicité)." });
        }
        res.status(500).json({ error: 'Erreur lors de la mise à jour du bénéficiaire', details: err });
      } else if (result.affectedRows === 0) {
        res.status(404).json({ error: 'Bénéficiaire non trouvé' });
      } else {
        res.json({ success: true });
      }
    });
  });
});

// POST add beneficiaire
router.post('/', (req, res) => {
  console.log('[BACKEND] POST /api/beneficiaires - Données reçues:', req.body);
  let { nom, prenom, adresse, telephone, email, numero, ville, dateNaissance, discount } = req.body;
  function toMysqlDate(val) {
    if (!val) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    return null;
  }
  const date_naissance_final = toMysqlDate(dateNaissance);  console.log('[BACKEND] Date de naissance convertie:', date_naissance_final);
  console.log('[BACKEND] Vérification du numéro:', numero);
  db.query('SELECT id FROM beneficiaires WHERE numero = ?', [numero], (err, results) => {
    if (err) {
      console.error('[BACKEND] Erreur lors de la vérification du numéro:', err);
      return res.status(500).json({ error: "Erreur lors de la vérification du numéro de bénéficiaire" });
    }
    console.log('[BACKEND] Résultats de la vérification du numéro:', results);
    if (results.length > 0) {
      console.warn('[BACKEND] Numéro déjà existant:', numero);
      return res.status(400).json({ error: "Ce numéro de bénéficiaire est déjà enregistré." });
    }    const sql = 'INSERT INTO beneficiaires (nom, prenom, date_naissance, adresse, telephone, email, numero, ville, discount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [
      nom || '', 
      prenom || '', 
      date_naissance_final || null, 
      adresse || null, 
      telephone || null, 
      email || null, 
      numero || '', 
      ville || null, 
      (discount !== undefined ? discount : 50)
    ];
    console.log('[BACKEND] SQL:', sql);
    console.log('[BACKEND] Valeurs:', values);
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('[BACKEND] Erreur lors de l\'insertion:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: "Ce numéro de bénéficiaire est déjà enregistré (contrainte d'unicité)." });
        }
        res.status(500).json({ error: 'Erreur lors de l\'ajout du bénéficiaire', details: err });
      } else {
        console.log('[BACKEND] Bénéficiaire ajouté avec succès, ID:', result.insertId);
        res.status(201).json({ id: result.insertId, nom, prenom, date_naissance: date_naissance_final, adresse, telephone, email, numero, ville, discount: (discount !== undefined ? discount : 50) });
      }
    });
  });
});

module.exports = router;
