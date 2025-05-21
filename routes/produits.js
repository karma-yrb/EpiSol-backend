const express = require('express');
const router = express.Router();
const db = require('../db');

// GET produits filtrés (recherche)
router.get('/', (req, res) => {
  const search = req.query.search;
  if (search && search.length >= 3) {
    db.query(
      'SELECT * FROM produits WHERE nom LIKE ? ORDER BY nom ASC',
      [`%${search}%`],
      (err, results) => {
        if (err) {
          res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
        } else {
          res.json(results);
        }
      }
    );
  } else {
    db.query('SELECT * FROM produits', (err, results) => {
      if (err) {
        res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
      } else {
        res.json(results);
      }
    });
  }
});

// POST add produit
router.post('/', (req, res) => {
  const { nom, categorie_id, prix } = req.body;
  if (!nom || !categorie_id || prix === undefined) {
    return res.status(400).json({ error: 'Nom, catégorie et prix requis' });
  }
  db.query('INSERT INTO produits (nom, categorie_id, prix) VALUES (?, ?, ?)', [nom, categorie_id, prix], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Erreur lors de l\'ajout du produit' });
    } else {
      res.status(201).json({ id: result.insertId, nom, categorie_id, prix });
    }
  });
});

// PUT update produit
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nom, categorie_id, prix } = req.body;
  db.query('UPDATE produits SET nom = ?, categorie_id = ?, prix = ? WHERE id = ?', [nom, categorie_id, prix, id], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Erreur lors de la modification du produit' });
    } else {
      res.json({ id, nom, categorie_id, prix });
    }
  });
});

// DELETE produit
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM produits WHERE id = ?', [id], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Erreur lors de la suppression du produit' });
    } else {
      res.json({ success: true });
    }
  });
});

module.exports = router;
