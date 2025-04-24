const db = require('../database/db');

class StatutUtilisateurModel {
    // 🔹 Ajouter un statut utilisateur
    static async createStatut(idUtilisateur) {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO statut_utilisateur (id_utilisateur) VALUES (?)`;
            db.query(query, [idUtilisateur], (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });
    }

    // 🔹 Lire tous les statuts utilisateurs
    static getAllStatuts() {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM statut_utilisateur', (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });
    }

    // 🔹 Lire un statut utilisateur par ID
    static getStatutById(id) {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM statut_utilisateur WHERE id_utilisateur = ?', [id], (error, results) => {
                if (error) reject(error);
                resolve(results[0]);
            });
        });
    }

    // 🔹 Mettre à jour l'état de connexion
    static updateStatut(id, estConnecte) {
        return new Promise((resolve, reject) => {
            db.query('UPDATE statut_utilisateur SET est_connecte = ?, derniere_activite = CURRENT_TIMESTAMP WHERE id_utilisateur = ?', [estConnecte, id], (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });
    }

    // 🔹 Supprimer un statut utilisateur
    static deleteStatut(id) {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM statut_utilisateur WHERE id_utilisateur = ?', [id], (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });
    }
}

module.exports = StatutUtilisateurModel;
