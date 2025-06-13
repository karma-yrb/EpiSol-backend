-- Migration pour corriger l'encodage UTF-8 des catégories
-- Fichier: migrations/fix_utf8_encoding_categories.sql

-- Mettre à jour les catégories avec des caractères accentués corrompus
UPDATE categories SET nom = 'Hygiène' WHERE nom LIKE '%Hygi%ne%' OR nom LIKE 'Hygi�ne';
UPDATE categories SET nom = 'Epicerie sucrée' WHERE nom LIKE '%sucr%e%' OR nom LIKE '%sucr�%';
UPDATE categories SET nom = 'Epicerie salée' WHERE nom LIKE '%sal%e%' OR nom LIKE '%sal�%';
UPDATE categories SET nom = 'Surgelés' WHERE nom LIKE '%Surgel%s%' OR nom LIKE '%Surgel�s%';
UPDATE categories SET nom = 'Dérivés végétaux' WHERE nom LIKE '%riv%e%v%g%tal%' OR nom LIKE '%D�riv�e v�g�tal%';
UPDATE categories SET nom = 'Produits ménagers' WHERE nom LIKE '%m%nagers%' OR nom LIKE '%m�nagers%';

-- Vérifier les résultats
SELECT id, nom, LENGTH(nom) as longueur, CHAR_LENGTH(nom) as nb_chars FROM categories WHERE nom LIKE '%�%' OR nom REGEXP '[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]';
