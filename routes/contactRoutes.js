const express = require('express');
const router = express.Router();
const ContactModel = require('../src/model/contactModel');

// 🔹 Ajouter un contact
router.post('/contacts', async (req, res) => {
    try {
        console.log('Données reçues:', req.body); // Affiche les données reçues
        const [utilisateur1, utilisateur2] = req.body; // Récupère les deux objets du tableau

        if (!utilisateur1 || !utilisateur2) {
            return res.status(400).json({ error: "Les champs 'utilisateur1' et 'utilisateur2' sont obligatoires." });
        }

        // Utilisation des valeurs id et nom des utilisateurs
        await ContactModel.createContact(utilisateur1.id, utilisateur2.id);
        res.status(201).json({ message: 'Contact ajouté avec succès' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




// 🔹 Récupérer tous les contacts
router.get('/contacts', async (req, res) => {
    try {
        const contacts = await ContactModel.getAllContacts();
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Récupérer un contact par ID
router.get('/contacts/:id', async (req, res) => {
    try {
        const contact = await ContactModel.getContactById(req.params.id);
        if (!contact) return res.status(404).json({ message: 'Contact non trouvé' });
        res.json(contact);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Récupérer un contact par noms des utilisateurs
router.get('/contacts/names', async (req, res) => {
    try {
        const { utilisateur1, utilisateur2 } = req.query; // Prendre les noms des utilisateurs dans les paramètres de la requête

        // Appel à la méthode getContactByName du modèle
        const contact = await ContactModel.getContactByName(utilisateur1, utilisateur2);
        
        if (contact.length === 0) {
            return res.status(404).json({ message: 'Aucun contact trouvé entre ces utilisateurs' });
        }

        res.json(contact);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Mettre à jour le statut d'un contact
router.put('/contacts/:id/statut', async (req, res) => {
    try {
        const { statut } = req.body;
        await ContactModel.updateContactStatus(req.params.id, statut);
        res.json({ message: 'Statut du contact mis à jour' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Supprimer un contact
router.delete('/contacts/:id', async (req, res) => {
    try {
        await ContactModel.deleteContact(req.params.id);
        res.json({ message: 'Contact supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
