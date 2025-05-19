const express = require('express');
const router = express.Router();
const db = require('../db');

// Suppression des logs de debug inutiles

// GET all categories
router.get('/', (req, res) => {
  db.query('SELECT * FROM categories', (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
    } else {
      res.json(results);
    }
  });
});

// POST add category
router.post('/', (req, res) => {
  const { nom } = req.body;
  if (!nom) return res.status(400).json({ error: 'Nom requis' });
  db.query('INSERT INTO categories (nom) VALUES (?)', [nom], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Erreur lors de l\'ajout de la catégorie' });
    } else {
      res.status(201).json({ id: result.insertId, nom });
    }
  });
});

// PUT update category
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nom } = req.body;
  if (!nom) return res.status(400).json({ error: 'Nom requis' });
  db.query('UPDATE categories SET nom = ? WHERE id = ?', [nom, id], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Erreur lors de la modification de la catégorie' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Catégorie non trouvée' });
    } else {
      res.json({ id, nom });
    }
  });
});

// DELETE category
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM categories WHERE id = ?', [id], (err, result) => {
    if (err) {
      if (err.code === 'ER_ROW_IS_REFERENCED_2' || (err.sqlMessage && err.sqlMessage.includes('a foreign key constraint fails'))) {
        return res.status(400).json({ error: "Impossible de supprimer cette catégorie : elle est utilisée par au moins un produit." });
      }
      res.status(500).json({ error: 'Erreur lors de la suppression de la catégorie' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Catégorie non trouvée' });
    } else {
      res.json({ success: true });
    }
  });
});

module.exports = router;
