const express = require('express');
const router = express.Router();
const MessageModel = require('../src/model/messageModel');


// 🔹 Envoyer un message chiffré
router.post('/send', async (req, res) => {
    try {
        const { expediteur, destinataire, message } = req.body;
        console.log(req.body);
        if (!expediteur || !destinataire || !message) {
            return res.status(400).json({ error: "Tous les champs sont requis." });
        }

        const response = await MessageModel.sendMessage(expediteur, destinataire, message);
        res.json(response);  // Répondre avec la réponse du modèle
    } catch (error) {
        console.error("Erreur lors de l'envoi du message:", error);
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Récupérer les messages reçus
// 🔹 Récupérer les messages reçus
router.get('/received/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const password = req.headers['password']; 

        if (!password) {
            return res.status(400).json({ error: 'Mot de passe manquant dans les en-têtes' });
        }

        const messages = await MessageModel.getReceivedMessages(userId);

        // 🔹 Déchiffrement des messages avant envoi
        const decryptedMessages = await Promise.all(messages.map(async (msg) => {
            if (msg.message_chiffre_destinataire) {
                try {
                    const decryptedMessage = await MessageModel.decryptReceivedMessage(userId, msg.id_message, password);
                    msg.message_dechiffre = decryptedMessage.message; // Ajoute le message déchiffré à la réponse
                } catch (error) {
                    console.error("❌ Erreur de déchiffrement du message :", error.message);
                    msg.message_dechiffre = " "; // Indique que le message est chiffré
                }
            }
            return msg;
        }));

        // 🔹 Envoi des messages déchiffrés ou chiffrés selon le cas
        res.json({
            receivedMessages: decryptedMessages, // Renvoie les messages déchiffrés
            sentMessages: [] // Si vous avez besoin d'envoyer des messages envoyés, vous pouvez les ajouter ici
        });

    } catch (error) {
        console.error("❌ Erreur API /received :", error);
        if (!res.headersSent) {  // Vérification que la réponse n'a pas été envoyée
            res.status(500).json({ error: error.message });
        }
    }
});
router.get('/messages/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const password = req.headers['password']; // Récupérer le mot de passe depuis les en-têtes

        if (!password) {
            return res.status(400).json({ error: 'Mot de passe manquant dans les en-têtes' });
        }
        console.log(password);

        const messages = await MessageModel.getMessagesByUser (userId, password); // Passer le mot de passe à la méthode
        res.json(messages);
    } catch (error) {
        console.error("Erreur lors de la récupération des messages :", error.message);
        res.status(500).json({ error: error.message });
    }
});



router.post('/received/decrypt/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { messageId, motDePasse } = req.body;

        // Vérification que le mot de passe et le messageId sont fournis
        if (!messageId || !motDePasse) {
            return res.status(400).json({ error: "Le mot de passe et l'ID du message sont requis." });
        }

        // Appel du modèle pour déchiffrer le message reçu
        const response = await MessageModel.decryptReceivedMessage(userId, messageId, motDePasse);

        // Retourner la réponse déchiffrée
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 🔹 Déchiffrer un message envoyé
router.post('/decryptSent', async (req, res) => {
    try {
        const { expediteur, messageId, motDePasse } = req.body;
        if (!expediteur || !messageId || !motDePasse) {
            return res.status(400).json({ error: "Tous les champs sont requis." });
        }

        const response = await MessageModel.decryptSentMessage(expediteur, messageId, motDePasse);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;
