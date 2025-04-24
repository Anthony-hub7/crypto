
CREATE DATABASE messagerie_rsa;


USE messagerie_rsa;
-- Création de la table des utilisateurs avec stockage des clés RSA
CREATE TABLE utilisateurs (
    id_utilisateur INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    mot_de_passe TEXT NOT NULL, -- Haché avec bcrypt ou Argon2
    cle_publique TEXT NOT NULL, -- Clé publique RSA pour chiffrer les messages
    cle_privee_chiffree TEXT NOT NULL -- Clé privée RSA chiffrée pour sécuriser son stockage
);

-- Création de la table des messages
CREATE TABLE messages (
    id_message INT AUTO_INCREMENT PRIMARY KEY,
    expediteur INT NOT NULL,
    destinataire INT NOT NULL,
    message_chiffre_expediteur TEXT NOT NULL,  -- Chiffré avec la clé publique de l'expéditeur
    message_chiffre_destinataire TEXT NOT NULL,  -- Chiffré avec la clé publique du destinataire
    est_lu BOOLEAN DEFAULT FALSE,
    date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (expediteur) REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    FOREIGN KEY (destinataire) REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE
);

-- Table pour le statut des utilisateurs (connecté/déconnecté)
CREATE TABLE statut_utilisateur (
    id_utilisateur INT PRIMARY KEY,
    est_connecte BOOLEAN DEFAULT FALSE, 
    derniere_activite TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE
);


CREATE TABLE contacts (
    id_contact INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur1 INT NOT NULL,
    utilisateur2 INT NOT NULL,
    statut ENUM('en attente', 'accepté', 'bloqué') DEFAULT 'en attente',
    UNIQUE(utilisateur1, utilisateur2), 
    FOREIGN KEY (utilisateur1) REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    FOREIGN KEY (utilisateur2) REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE
);
