// src/aes/aes_helper.js
class AESHelper {
    static encrypt(req, res) {
        // Logique d'encryptage
        res.json({ message: "Encrypted data" });
    }

    static decrypt(req, res) {
        // Logique de décryptage
        res.json({ message: "Decrypted data" });
    }
}

module.exports = AESHelper;
