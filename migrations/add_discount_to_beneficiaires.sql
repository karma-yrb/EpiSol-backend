-- Migration : Ajout d'un champ 'discount' (rabais en %) à la table beneficiaires
-- Par défaut, le rabais est de 50%

ALTER TABLE beneficiaires
ADD COLUMN discount FLOAT NOT NULL DEFAULT 50;
