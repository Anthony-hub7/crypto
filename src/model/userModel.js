const db = require('../database/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

class UserModel {
    
    static async createUser(nom, email, motDePasse) {
        return new Promise((resolve, reject) => {
            bcrypt.hash(motDePasse, 10, (err, hashedPassword) => {
                if (err) return reject(err);

                const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
                    modulusLength: 2048,
                });

            
                const passphrase = 'ma_phrase_secrete_ultra_confidentielle'; 
                const iv = crypto.randomBytes(16); 
                const key = crypto.scryptSync(passphrase, 'sel_unique', 32);
                const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
                let encrypted = cipher.update(privateKey.export({ type: 'pkcs1', format: 'pem' }), 'utf8', 'hex');
                encrypted += cipher.final('hex');
                const encryptedPrivateKey = iv.toString('hex') + ':' + encrypted;

                const query = `INSERT INTO utilisateurs (nom, email, mot_de_passe, cle_publique, cle_privee_chiffree) VALUES (?, ?, ?, ?, ?)`;
                db.query(query, [
                    nom,
                    email,
                    hashedPassword,
                    publicKey.export({ type: 'pkcs1', format: 'pem' }),
                    encryptedPrivateKey
                ], (error, results) => {
                    if (error) return reject(error);
                    resolve(results);
                });
            });
        });
    }

    static getAllUsers() {
        return new Promise((resolve, reject) => {
            db.query('SELECT id_utilisateur AS id, nom, email, cle_publique FROM utilisateurs', (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });
    }

    // Lire un utilisateur par ID
    static getUserById(id) {
        return new Promise((resolve, reject) => {
            db.query('SELECT id_utilisateur, nom, email, cle_publique FROM utilisateurs WHERE id_utilisateur = ?', [id], (error, results) => {
                if (error) reject(error);
                resolve(results[0]);
            });
        });
    }

    static updateUser(id, nom, email) {
        return new Promise((resolve, reject) => {
            db.query('UPDATE utilisateurs SET nom = ?, email = ? WHERE id_utilisateur = ?', [nom, email, id], (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });
    }

    static deleteUser(id) {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM utilisateurs WHERE id_utilisateur = ?', [id], (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });
    }

    static async getUserByEmail(email) {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM utilisateurs WHERE email = ?', [email], (error, results) => {
                if (error) reject(error);
                resolve(results[0]);  // Renvoie le premier utilisateur trouvé
            });
        });
    }
}

module.exports = UserModel;
