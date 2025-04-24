// routes/messageRouter.js
const express = require('express');
const router = express.Router();
const MessageAESModel = require('../src/model/MessageAESModel'); // Assurez-vous que l'importation est correcte

// Envoi d'un message chiffré
router.post('/sendMessage', async (req, res) => {
    const { expediteur, destinataire, message } = req.body; // Pas besoin de cleSecrete ici
    try {
        const result = await MessageAESModel.sendMessage(expediteur, destinataire, message);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Récupération des conversations de l'utilisateur
router.get('/conversations', async (req, res) => {
    const { userId } = req.query; // Pas besoin de cleSecrete ici non plus
    try {
        const conversations = await MessageAESModel.getConversations(userId);
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
