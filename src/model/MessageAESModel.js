
const crypto = require('crypto'); 
const db = require('../database/db'); 

class MessageAESModel {
    // Fonction pour envoyer un message chiffré avec AES
    static async sendMessage(expediteur, destinataire, message) {
        try {
            // 🔹 Générer une clé aléatoire de 32 octets (256 bits)
            const key = crypto.randomBytes(32); // Cela génère une clé aléatoire de 32 octets
            console.log('Clé générée (en octets) :', key.toString('hex')); // Affiche la clé en hexadécimal

            // 🔹 Générer un vecteur d'initialisation (IV) aléatoire pour AES CBC
            const iv = crypto.randomBytes(16); // 16 octets pour AES CBC

            // 🔹 Chiffrement du message avec AES-256-CBC
            const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
            let messageChiffre = cipher.update(message, 'utf8', 'hex');
            messageChiffre += cipher.final('hex');

            // 🔹 Sauvegarde du message chiffré dans la base de données
            await new Promise((resolve, reject) => {
                db.query(`
                    INSERT INTO messages_aes (expediteur, destinataire, message_chiffre, iv, cle) 
                    VALUES (?, ?, ?, ?, ?)`,
                    [expediteur, destinataire, messageChiffre, iv.toString('hex'), key.toString('hex')],
                    (error, results) => {
                        if (error) return reject(error);
                        resolve(results);
                    }
                );
            });

            return { message: 'Message envoyé avec succès' };
        } catch (error) {
            console.error("Erreur lors de l'envoi du message:", error.message);
            throw error;
        }
    }

    // Fonction pour récupérer les conversations de l'utilisateur
    static async getConversations(userId) {
        try {
            // Récupérer tous les messages où l'utilisateur est soit l'expéditeur, soit le destinataire
            const rows = await new Promise((resolve, reject) => {
                db.query(`
                    SELECT id_message, expediteur, destinataire, message_chiffre, iv, cle, date_envoi
                    FROM messages_aes
                    WHERE expediteur = ? OR destinataire = ?`,
                    [userId, userId],
                    (error, results) => {
                        if (error) return reject(error);
                        resolve(results);
                    }
                );
            });

            // Déchiffrer les messages récupérés
            const messagesDechiffres = rows.map(msg => {
                // Convertir la clé secrète stockée en Buffer
                const key = Buffer.from(msg.cle, 'hex');

                // Déchiffrer le message
                const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(msg.iv, 'hex'));
                let messageDechiffre = decipher.update(msg.message_chiffre, 'hex', 'utf8');
                messageDechiffre += decipher.final('utf8');
                return {
                    id_message: msg.id_message,
                    expediteur: msg.expediteur,
                    destinataire: msg.destinataire,
                    message_dechiffre: messageDechiffre,
                    date_envoi: msg.date_envoi
                };
            });

            return messagesDechiffres;
        } catch (error) {
            console.error("Erreur lors de la récupération des messages :", error.message);
            throw error;
        }
    }
}

module.exports = MessageAESModel;
