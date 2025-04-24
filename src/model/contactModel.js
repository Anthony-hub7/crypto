const db = require('../database/db');

class ContactModel {
   
    static async createContact(utilisateur1, utilisateur2) {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO contacts (utilisateur1, utilisateur2) VALUES (?, ?)`;
            db.query(query, [utilisateur1, utilisateur2], (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });
    }

  
    static getAllContacts() {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM contacts', (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });
    }


    static getContactById(id) {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM contacts WHERE id_contact = ?', [id], (error, results) => {
                if (error) reject(error);
                resolve(results[0]);
            });
        });
    }


    static updateContactStatus(id, statut) {
        return new Promise((resolve, reject) => {
            db.query('UPDATE contacts SET statut = ? WHERE id_contact = ?', [statut, id], (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });
    }

    static deleteContact(id) {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM contacts WHERE id_contact = ?', [id], (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });
    }
    static async getContactByName(utilisateur1Name, utilisateur2Name) {
        return new Promise(async (resolve, reject) => {
            try {
                // Trouver les utilisateurs par leur nom
                const user1 = await UserModel.getUserByName(utilisateur1Name);
                const user2 = await UserModel.getUserByName(utilisateur2Name);

                // Vérifier si les utilisateurs existent
                if (!user1 || !user2) {
                    return reject(new Error('Un ou les deux utilisateurs n\'existent pas'));
                }

                // Rechercher le contact entre les deux utilisateurs par leurs IDs
                db.query('SELECT * FROM contacts WHERE (utilisateur1 = ? AND utilisateur2 = ?) OR (utilisateur1 = ? AND utilisateur2 = ?)', 
                [user1.id, user2.id, user2.id, user1.id], (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                });
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = ContactModel;
