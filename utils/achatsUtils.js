// Fonctions utilitaires pour la gestion des achats

// Calcule le total d'un achat à partir des lignes
function calcTotalAchat(lignes) {
  return lignes.reduce((sum, l) => sum + (l.quantite * l.prix_unitaire), 0);
}

// Requêtes SQL principales pour la gestion des achats
const SQL_INSERT_ACHAT = 'INSERT INTO achats (beneficiaire_id, date_achat, total) VALUES (?, NOW(), ?)';
const SQL_INSERT_ACHAT_LIGNES = 'INSERT INTO achats_lignes (achat_id, produit_id, quantite, prix_unitaire) VALUES ?';
const SQL_LISTE_ACHATS = `SELECT a.id, a.date_achat, a.total, b.nom AS beneficiaire_nom, b.prenom AS beneficiaire_prenom,
  (SELECT SUM(al.quantite) FROM achats_lignes al WHERE al.achat_id = a.id) AS quantite
  FROM achats a
  JOIN beneficiaires b ON a.beneficiaire_id = b.id
  ORDER BY a.date_achat DESC, a.id DESC`;
const SQL_DETAIL_ACHAT = `SELECT a.id, a.date_achat, a.total, b.nom AS beneficiaire_nom, b.prenom AS beneficiaire_prenom
  FROM achats a
  JOIN beneficiaires b ON a.beneficiaire_id = b.id
  WHERE a.id = ?`;
const SQL_DETAIL_LIGNES = `SELECT al.quantite, al.prix_unitaire, p.nom AS produit_nom
  FROM achats_lignes al
  JOIN produits p ON al.produit_id = p.id
  WHERE al.achat_id = ?`;
const SQL_DELETE_ACHAT = 'DELETE FROM achats WHERE id = ?';

module.exports = {
  calcTotalAchat,
  SQL_INSERT_ACHAT,
  SQL_INSERT_ACHAT_LIGNES,
  SQL_LISTE_ACHATS,
  SQL_DETAIL_ACHAT,
  SQL_DETAIL_LIGNES,
  SQL_DELETE_ACHAT
};
