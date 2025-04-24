const UserModel = require('../model/userModel');
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcrypt');

class UserController {
    // 🔹 Ajouter un utilisateur
    static async createUser(req, res) {
        try {
            const { nom, email, mot_de_passe } = req.body;
            await UserModel.createUser(nom, email, mot_de_passe);
            res.status(201).json({ message: 'Utilisateur ajouté avec succès' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // 🔹 Récupérer tous les utilisateurs
    static async getAllUsers(req, res) {
        try {
            const users = await UserModel.getAllUsers();
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // 🔹 Récupérer un utilisateur par ID
    static async getUserById(req, res) {
        try {
            const user = await UserModel.getUserById(req.params.id);
            if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // 🔹 Mettre à jour un utilisateur
    static async updateUser(req, res) {
        try {
            const { nom, email } = req.body;
            await UserModel.updateUser(req.params.id, nom, email);
            res.json({ message: 'Utilisateur mis à jour' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // 🔹 Supprimer un utilisateur
    static async deleteUser(req, res) {
        try {
            await UserModel.deleteUser(req.params.id);
            res.json({ message: 'Utilisateur supprimé' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // 🔹 Connexion
    static async login(req, res) {
        try {
            const { email, mot_de_passe } = req.body;
            const user = await UserModel.getUserByEmail(email);
            if (!user) {
                return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
            }

            const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
            if (!isMatch) {
                return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
            }

            const token = jwt.sign({ userId: user.id }, 'henstoa', { expiresIn: '1h' });

            res.status(200).json({ message: 'Connexion réussie', token });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // 🔹 Profil de l'utilisateur (Route protégée)
    static async getProfile(req, res) {
        try {
            console.log("🔍 Vérification de req.userId :", req.userId);  // DEBUG
    
            if (!req.userId) {
                return res.status(400).json({ message: 'ID utilisateur non trouvé dans la requête' });
            }
    
            const user = await UserModel.getUserById(req.userId);
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }
            console.log("Le id : ",user.id_utilisateur );
    
            res.status(200).json({
                id: user.id_utilisateur,
                nom: user.nom,
                email: user.email
            });
            

        } catch (error) {
            console.error("❌ Erreur serveur :", error);
            res.status(500).json({ message: 'Erreur serveur' });
        }
    }
    
}

module.exports = UserController;
