const express = require('express');
const router = express.Router();
const StatutUtilisateurModel = require('../src/model/userModel');

// 🔹 Ajouter un statut utilisateur
router.post('/statuts', async (req, res) => {
    try {
        const { id_utilisateur } = req.body;
        await StatutUtilisateurModel.createStatut(id_utilisateur);
        res.status(201).json({ message: 'Statut utilisateur ajouté avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Récupérer tous les statuts utilisateurs
router.get('/statuts', async (req, res) => {
    try {
        const statuts = await StatutUtilisateurModel.getAllStatuts();
        res.json(statuts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Récupérer un statut utilisateur par ID
router.get('/statuts/:id', async (req, res) => {
    try {
        const statut = await StatutUtilisateurModel.getStatutById(req.params.id);
        if (!statut) return res.status(404).json({ message: 'Statut utilisateur non trouvé' });
        res.json(statut);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Mettre à jour l'état de connexion
router.put('/statuts/:id', async (req, res) => {
    try {
        const { est_connecte } = req.body;
        await StatutUtilisateurModel.updateStatut(req.params.id, est_connecte);
        res.json({ message: 'Statut utilisateur mis à jour' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Supprimer un statut utilisateur
router.delete('/statuts/:id', async (req, res) => {
    try {
        await StatutUtilisateurModel.deleteStatut(req.params.id);
        res.json({ message: 'Statut utilisateur supprimé' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
