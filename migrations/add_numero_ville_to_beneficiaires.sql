-- Migration : Ajout des champs 'numero' et 'ville' à la table beneficiaires
-- Ces champs sont utilisés par l'interface frontend mais manquaient dans la structure de base

ALTER TABLE beneficiaires
ADD COLUMN numero VARCHAR(50) DEFAULT '',
ADD COLUMN ville VARCHAR(255) DEFAULT '';

-- Ajouter un index unique sur le numéro pour éviter les doublons
-- (le code backend vérifie déjà l'unicité)
ALTER TABLE beneficiaires
ADD UNIQUE INDEX idx_numero_unique (numero);
