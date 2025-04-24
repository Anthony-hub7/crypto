const db = require('../database/db');
const forge = require('node-forge');
const bcrypt = require('bcrypt');
const crypto = require('crypto'); 
class MessageModel {
    static async sendMessage(expediteur, destinataire, message) {
        try {
            
            const rows = await new Promise((resolve, reject) => {
                db.query(`
                    SELECT id_utilisateur, cle_publique FROM utilisateurs 
                    WHERE id_utilisateur IN (?, ?)`, 
                    [expediteur, destinataire],
                    (error, results) => {
                        if (error) return reject(error);
                        resolve(results);
                    }
                );
            });
    
            console.log("Résultat de la requête SQL:", rows);
    
            if (!Array.isArray(rows) || rows.length < 2) {
                throw new Error('Les deux utilisateurs (expéditeur et destinataire) doivent être présents dans la base de données.');
            }
    
            let clePubliqueExpediteur, clePubliqueDestinataire;
            rows.forEach(user => {
                if (user.id_utilisateur === expediteur) {
                    clePubliqueExpediteur = forge.pki.publicKeyFromPem(user.cle_publique);
                }
                if (user.id_utilisateur === destinataire) {
                    clePubliqueDestinataire = forge.pki.publicKeyFromPem(user.cle_publique);
                }
            });
    
            if (!clePubliqueExpediteur || !clePubliqueDestinataire) {
                throw new Error("Impossible de récupérer les clés publiques des utilisateurs.");
            }
    
            // Chiffrement du message pour l'expéditeur et le destinataire
            const messageChiffreExpediteur = forge.util.encode64(clePubliqueExpediteur.encrypt(message));
            const messageChiffreDestinataire = forge.util.encode64(clePubliqueDestinataire.encrypt(message));
    
            // Sauvegarde du message chiffré
            await new Promise((resolve, reject) => {
                db.query(`
                    INSERT INTO messages (expediteur, destinataire, message_chiffre_expediteur, message_chiffre_destinataire) 
                    VALUES (?, ?, ?, ?)`,
                    [expediteur, destinataire, messageChiffreExpediteur, messageChiffreDestinataire],
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

    static async decryptSentMessage(expediteur, messageId, motDePasse) {
        try {
            const rows = await new Promise((resolve, reject) => {
                db.query(`
                    SELECT message_chiffre_expediteur, cle_privee_chiffree, mot_de_passe 
                    FROM messages
                    INNER JOIN utilisateurs ON messages.expediteur = utilisateurs.id_utilisateur
                    WHERE id_message = ? AND expediteur = ?`,
                    [messageId, expediteur],
                    (error, results) => {
                        if (error) return reject(error);
                        resolve(results);
                    }
                );
            });

            if (rows.length === 0) {
                throw new Error('Message non trouvé ou accès non autorisé');
            }

            const { message_chiffre_expediteur, cle_privee_chiffree, mot_de_passe } = rows[0];

            // Vérification du mot de passe
            const passwordMatch = await bcrypt.compare(motDePasse, mot_de_passe);
            if (!passwordMatch) throw new Error('Mot de passe incorrect');

            // Déchiffrement de la clé privée (via AES-256-CBC)
            const passphrase = 'ma_phrase_secrete_ultra_confidentielle';
            const parts = cle_privee_chiffree.split(':');
            const iv = Buffer.from(parts[0], 'hex');
            const encryptedData = parts[1];
            const key = crypto.scryptSync(passphrase, 'sel_unique', 32);
            const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
            let decryptedPem = decipher.update(encryptedData, 'hex', 'utf8');
            decryptedPem += decipher.final('utf8');

            const privateKey = forge.pki.privateKeyFromPem(decryptedPem);
            const messageDechiffre = privateKey.decrypt(forge.util.decode64(message_chiffre_expediteur));

            return { message: messageDechiffre };
        } catch (error) {
            throw error;
        }
    }

    static async getReceivedMessages(userId) {
        try {
            const rows = await new Promise((resolve, reject) => {
                db.query(`
                    SELECT messages.id_message, messages.expediteur, messages.message_chiffre_destinataire, utilisateurs.cle_privee_chiffree
                    FROM messages
                    INNER JOIN utilisateurs ON messages.destinataire = utilisateurs.id_utilisateur
                    WHERE messages.destinataire = ?`, 
                    [userId],
                    (error, results) => {
                        if (error) return reject(error);
                        resolve(results);
                    }
                );
            });
            return rows;
        } catch (error) {
            throw error;
        }
    }
    
    static async decryptReceivedMessage(destinataire, messageId, motDePasse) {
        try {
            const rows = await new Promise((resolve, reject) => {
                db.query(`
                    SELECT messages.message_chiffre_destinataire, utilisateurs.cle_privee_chiffree, utilisateurs.mot_de_passe
                    FROM messages
                    INNER JOIN utilisateurs ON messages.destinataire = utilisateurs.id_utilisateur
                    WHERE messages.id_message = ? AND messages.destinataire = ?`,
                    [messageId, destinataire],
                    (error, results) => {
                        if (error) return reject(error);
                        resolve(results);
                    }
                );
            });
    
            if (rows.length === 0) {
                throw new Error('Message non trouvé ou accès non autorisé');
            }
    
            const { message_chiffre_destinataire, cle_privee_chiffree, mot_de_passe } = rows[0];
    
            // Vérification du mot de passe du destinataire
            const passwordMatch = await bcrypt.compare(motDePasse, mot_de_passe);
            if (!passwordMatch) throw new Error('Mot de passe incorrect');
    
            // Déchiffrement de la clé privée du destinataire (via AES-256-CBC)
            const passphrase = 'ma_phrase_secrete_ultra_confidentielle';
            const parts = cle_privee_chiffree.split(':');
            const iv = Buffer.from(parts[0], 'hex');
            const encryptedData = parts[1];
            const key = crypto.scryptSync(passphrase, 'sel_unique', 32);
            const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
            let decryptedPem = decipher.update(encryptedData, 'hex', 'utf8');
            decryptedPem += decipher.final('utf8');

            const privateKey = forge.pki.privateKeyFromPem(decryptedPem);
            const messageDechiffre = privateKey.decrypt(forge.util.decode64(message_chiffre_destinataire));
    
            console.log("Message déchiffré :", messageDechiffre);
    
            return { message: messageDechiffre };
        } catch (error) {
            console.error("Erreur lors du déchiffrement du message du destinataire:", error.message);
            throw error;
        }
    }
    
    static async getMessagesByUser (userId, motDePasse) {
        try {
            // Récupérer le mot de passe de l'utilisateur
            const userRows = await new Promise((resolve, reject) => {
                db.query(`
                    SELECT mot_de_passe FROM utilisateurs WHERE id_utilisateur = ?`, 
                    [userId],
                    (error, results) => {
                        if (error) return reject(error);
                        resolve(results);
                    }
                );
            });
    
            if (userRows.length === 0) {
                throw new Error('Utilisateur non trouvé');
            }
    
            const mot_de_passe_hache = motDePasse;
    
            // Récupérer les messages reçus
            const receivedMessages = await new Promise((resolve, reject) => {
                db.query(`
                    SELECT messages.id_message, messages.expediteur, messages.message_chiffre_destinataire, messages.date_envoi, utilisateurs.cle_privee_chiffree
                    FROM messages
                    INNER JOIN utilisateurs ON messages.destinataire = utilisateurs.id_utilisateur
                    WHERE messages.destinataire = ?
                    ORDER BY messages.date_envoi ASC`, 
                    [userId],
                    (error, results) => {
                        if (error) return reject(error);
                        resolve(results);
                    }
                );
            });
    
            // Récupérer les messages envoyés
            const sentMessages = await new Promise((resolve, reject) => {
                db.query(`
                    SELECT messages.id_message, messages.destinataire, messages.message_chiffre_expediteur, messages.date_envoi
                    FROM messages
                    WHERE messages.expediteur = ?
                    ORDER BY messages.date_envoi ASC`, 
                    [userId],
                    (error, results) => {
                        if (error) return reject(error);
                        resolve(results);
                    }
                );
            });
    
            // Déchiffrer les messages reçus
            const decryptedReceivedMessages = await Promise.all(receivedMessages.map(async (msg) => {
                try {
                    const decryptedMessage = await MessageModel.decryptReceivedMessage(userId, msg.id_message, mot_de_passe_hache);
                    return {
                        id_message: msg.id_message,
                        expediteur: msg.expediteur,
                        message_dechiffre: decryptedMessage.message,
                        date_envoi: msg.date_envoi,
                    };
                } catch (error) {
                    console.error("Erreur de déchiffrement du message reçu :", error.message);
                    return {
                        id_message: msg.id_message,
                        expediteur: msg.expediteur,
                        message_dechiffre: "🔒 Message chiffré",
                        date_envoi: msg.date_envoi,
                    };
                }
            }));
    
            // Déchiffrer les messages envoyés
            const decryptedSentMessages = await Promise.all(sentMessages.map(async (msg) => {
                try {
                    const decryptedMessage = await MessageModel.decryptSentMessage(userId, msg.id_message, mot_de_passe_hache);
                    return {
                        id_message: msg.id_message,
                        destinataire: msg.destinataire,
                        message_dechiffre: decryptedMessage.message,
                        date_envoi: msg.date_envoi,
                    };
                } catch (error) {
                    console.error("Erreur de déchiffrement du message envoyé :", error.message);
                    return {
                        id_message: msg.id_message,
                        destinataire: msg.destinataire,
                        message_dechiffre: "🔒 Message chiffré",
                        date_envoi: msg.date_envoi,
                    };
                }
            }));
    
            // Rassembler tous les messages et les trier par date d'envoi
            const allMessages = [
                ...decryptedReceivedMessages,
                ...decryptedSentMessages
            ];
    
            allMessages.sort((a, b) => new Date(a.date_envoi) - new Date(b.date_envoi));
    
            return allMessages;
        } catch (error) {
            console.error("Erreur lors de la récupération des messages :", error.message);
            throw error;
        }
    }
}
    
module.exports = MessageModel;
