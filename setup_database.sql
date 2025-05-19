-- Script pour configurer la base de données et la table des bénéficiaires

-- Créer la base de données
CREATE DATABASE IF NOT EXISTS episol;

-- Utiliser la base de données
USE episol;

-- Création de la table users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) DEFAULT NULL,
    prenom VARCHAR(255) DEFAULT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion de l'utilisateur admin (mots de passe hashés)
INSERT INTO users (nom, prenom, email, username, password, role) 
VALUES 
('Admin', 'User', 'admin@episol.com', 'admin', '$2b$10$KEDTeyVWBYaF1m2DPtJji.y/VmHq8lycC2PuMVCrDyn2yiXdkmswS', 'admin'),
('Test', 'User', 'test@episol.com', 'test', '$2b$10$IKnPXdR70U8wSYkJR76wAO6B3uyFNHZf8OGpA2QgWYTC/Wmdhg.fK', 'user')
ON DUPLICATE KEY UPDATE username = username;

-- Création de la table beneficiaires
CREATE TABLE IF NOT EXISTS beneficiaires (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    date_naissance DATE NOT NULL,
    adresse VARCHAR(255) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    email VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion de bénéficiaires
INSERT INTO beneficiaires (nom, prenom, date_naissance, adresse, telephone, email) 
VALUES 
('Dupont', 'Jean', '1980-05-13', '123 Rue Principale', '0123456789', 'jean.dupont@example.com'),
('Martin', 'Claire', '1990-07-21', '456 Avenue des Fleurs', '0987654321', 'claire.martin@example.com'),
('Durand', 'Paul', '1975-03-30', '789 Boulevard du Soleil', '0678901234', 'paul.durand@example.com')
ON DUPLICATE KEY UPDATE nom = nom;

-- Création de la table categories
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL UNIQUE
);

-- Création de la table produits avec clé étrangère vers categories
CREATE TABLE IF NOT EXISTS produits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    categorie_id INT NOT NULL,
    prix DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (categorie_id) REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Insertion des catégories synchronisées avec la base réelle
INSERT INTO categories (id, nom) VALUES 
(1, 'Alimentaire'), 
(2, 'Hygiène'), 
(3, 'Entretien'),
(4, 'Boisson'),
(5, 'Petit-déjeuner'),
(6, 'Frais'),
(7, 'Conserves'),
(8, 'Epicerie sucrée'),
(9, 'Epicerie salée'),
(10, 'Bébé'),
(11, 'Surgelés'),
(12, 'Produits laitiers'),
(13, 'Pain'),
(14, 'Viande'),
(15, 'Poisson'),
(16, 'Fruits et légumes'),
(17, 'Produits ménagers'),
(18, 'Animaux'),
(19, 'Autres')
ON DUPLICATE KEY UPDATE nom = nom;

-- Insertion des produits synchronisés avec la base réelle
INSERT INTO produits (id, nom, categorie_id, prix) VALUES
(1, 'Baguette de pain', 5, 1.05),
(2, 'Croissant', 5, 1.20),
(3, 'Lait demi-écrémé 1L', 12, 1.10),
(4, 'Beurre doux 250g', 12, 2.30),
(5, 'Camembert', 12, 2.50),
(6, 'Yaourt nature', 12, 0.60),
(7, 'Pâtes 500g', 1, 1.00),
(8, 'Riz 1kg', 1, 1.80),
(9, 'Café moulu 250g', 4, 2.90),
(10, 'Sucre 1kg', 1, 1.40),
(11, 'Farine 1kg', 1, 1.20),
(12, 'Huile de tournesol 1L', 1, 2.10),
(13, 'Pommes', 16, 2.00),
(14, 'Bananes', 16, 2.20),
(15, 'Carottes 1kg', 16, 1.50),
(16, 'Pommes de terre 2kg', 16, 3.00),
(17, 'Jambon blanc 4 tranches', 14, 3.50),
(18, 'Poulet entier', 14, 8.90),
(19, 'Oeufs x12', 18, 2.80),
(20, 'Eau minérale 6x1.5L', 4, 3.60),
(21, 'Jus d’orange 1L', 4, 2.00),
(22, 'Biscuits sablés', 9, 1.70),
(23, 'Chocolat tablette', 8, 1.50),
(24, 'Lessive liquide 2L', 17, 5.90),
(25, 'Papier toilette 6 rouleaux', 2, 3.40)
ON DUPLICATE KEY UPDATE nom = VALUES(nom), categorie_id = VALUES(categorie_id), prix = VALUES(prix);

-- Exemple d'insertion de produits (facultatif, à commenter si tu veux éviter tout ajout)
-- INSERT INTO produits (nom, categorie_id, prix) VALUES
-- ('Pâtes', 1, 1.50),
-- ('Gel douche', 2, 2.30),
-- ('Liquide vaisselle', 3, 1.80);

-- Table principale des achats (factures/paniers)
CREATE TABLE IF NOT EXISTS achats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    beneficiaire_id INT NOT NULL,
    date_achat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) DEFAULT NULL,
    FOREIGN KEY (beneficiaire_id) REFERENCES beneficiaires(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Table des lignes d'achat (détail des produits achetés)
CREATE TABLE IF NOT EXISTS achats_lignes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    achat_id INT NOT NULL,
    produit_id INT NOT NULL,
    quantite INT NOT NULL,
    prix_unitaire DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (achat_id) REFERENCES achats(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (produit_id) REFERENCES produits(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);
