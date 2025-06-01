-- Migration : Rendre optionnels les champs date_naissance, adresse et telephone
-- Ces champs étaient obligatoires (NOT NULL) mais causaient des erreurs lors de l'ajout de bénéficiaires
-- avec des informations partielles depuis le frontend

-- Modifier la colonne date_naissance pour accepter NULL
ALTER TABLE beneficiaires 
MODIFY COLUMN date_naissance DATE NULL;

-- Modifier la colonne adresse pour accepter NULL
ALTER TABLE beneficiaires 
MODIFY COLUMN adresse VARCHAR(255) NULL;

-- Modifier la colonne telephone pour accepter NULL
ALTER TABLE beneficiaires 
MODIFY COLUMN telephone VARCHAR(20) NULL;

-- Vérification : afficher la structure de la table après modification
-- (décommenter la ligne suivante pour voir le résultat)
-- DESCRIBE beneficiaires;
