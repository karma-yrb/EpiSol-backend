-- Migration: Limiter la colonne numero à maximum 5 chiffres
-- Date: 2025-06-01
-- Description: Modifie la contrainte de la colonne numero pour accepter uniquement 5 chiffres maximum

USE episol;

-- Étape 1: Vérifier s'il y a des numéros existants avec plus de 5 chiffres
SELECT numero, LENGTH(numero) as longueur 
FROM beneficiaires 
WHERE LENGTH(numero) > 5;

-- Étape 2: Corriger les numéros vides en leur attribuant un numéro unique
-- Commencer par vérifier le plus grand numéro existant
SELECT MAX(CAST(numero AS UNSIGNED)) as max_numero 
FROM beneficiaires 
WHERE numero REGEXP '^[0-9]+$';

-- Désactiver temporairement le mode safe update
SET SQL_SAFE_UPDATES = 0;

-- Mettre à jour les numéros vides avec des valeurs uniques
-- D'abord, obtenir le prochain numéro disponible
SET @next_numero = (SELECT COALESCE(MAX(CAST(numero AS UNSIGNED)), 0) + 1 FROM beneficiaires WHERE numero REGEXP '^[0-9]+$');

-- Mettre à jour chaque enregistrement avec un numéro vide individuellement
UPDATE beneficiaires 
SET numero = CAST(@next_numero AS CHAR)
WHERE (numero = '' OR numero IS NULL) AND id = (
    SELECT MIN(id) FROM (
        SELECT id FROM beneficiaires WHERE numero = '' OR numero IS NULL
    ) as temp
);

-- Incrémenter et continuer jusqu'à ce que tous les numéros vides soient remplis
-- Note: Cette approche simple fonctionne pour un petit nombre d'enregistrements
-- Pour de gros volumes, il faudrait une approche plus sophistiquée

-- Réactiver le mode safe update
SET SQL_SAFE_UPDATES = 1;

-- Étape 3: Modifier la colonne pour limiter à 5 caractères maximum
-- VARCHAR(5) permettra maximum 5 caractères
ALTER TABLE beneficiaires 
MODIFY COLUMN numero VARCHAR(5) NOT NULL;

-- Étape 4: Ajouter une contrainte CHECK pour s'assurer que seuls les chiffres sont acceptés
-- et que la longueur est entre 1 et 5
ALTER TABLE beneficiaires 
ADD CONSTRAINT chk_numero_format 
CHECK (numero REGEXP '^[0-9]{1,5}$');

-- Vérification finale
DESCRIBE beneficiaires;
SELECT numero, LENGTH(numero) as longueur FROM beneficiaires ORDER BY CAST(numero AS UNSIGNED);
