-- Migration: Corriger et limiter la colonne numero à maximum 5 chiffres
-- Date: 2025-06-01
-- Description: Version simplifiée pour corriger le numéro vide et ajouter les contraintes

USE episol;

-- Étape 1: Vérifier les données actuelles
SELECT id, nom, prenom, numero, LENGTH(numero) as longueur 
FROM beneficiaires 
WHERE numero = '' OR numero IS NULL OR LENGTH(numero) > 5;

-- Étape 2: Corriger le numéro vide en utilisant l'ID comme base
-- Trouver le prochain numéro disponible
SET @max_numero = (SELECT COALESCE(MAX(CAST(numero AS UNSIGNED)), 0) FROM beneficiaires WHERE numero REGEXP '^[0-9]+$');

-- Mettre à jour l'enregistrement avec numéro vide
UPDATE beneficiaires 
SET numero = CAST((@max_numero + 1) AS CHAR)
WHERE numero = '' OR numero IS NULL;

-- Étape 3: Vérifier que tous les numéros sont valides avant d'ajouter les contraintes
SELECT numero, LENGTH(numero) as longueur 
FROM beneficiaires 
WHERE NOT (numero REGEXP '^[0-9]{1,5}$');

-- Étape 4: Modifier la colonne pour limiter à 5 caractères maximum
ALTER TABLE beneficiaires 
MODIFY COLUMN numero VARCHAR(5) NOT NULL;

-- Étape 5: Ajouter une contrainte CHECK pour s'assurer que seuls les chiffres sont acceptés
-- et que la longueur est entre 1 et 5
ALTER TABLE beneficiaires 
ADD CONSTRAINT chk_numero_format 
CHECK (numero REGEXP '^[0-9]{1,5}$');

-- Vérification finale
DESCRIBE beneficiaires;
SELECT id, nom, prenom, numero, LENGTH(numero) as longueur 
FROM beneficiaires 
ORDER BY CAST(numero AS UNSIGNED);
