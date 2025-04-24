const jwt = require('jsonwebtoken');
const UserModel = require('../model/userModel');
const { JWT_SECRET } = require('../config/config');
const bcrypt = require('bcrypt'); 


class SessionHelper {
    static async login(req, res) {
        console.log("🔹 Requête reçue :", req.body); // Vérifie les données envoyées
    
        const { email, mot_de_passe } = req.body;

        if (!email || !mot_de_passe) {
            console.log("❌ Email ou mot de passe manquant !");
            return res.status(400).json({ message: "Email et mot de passe requis" });
        }
    
        try {
            const user = await UserModel.getUserByEmail(email);
            if (!user) {
                console.log("❌ Utilisateur non trouvé :", email);
                return res.status(404).json({ message: "Utilisateur non trouvé" });
            }
    
            const match = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
            if (!match) {
                console.log("❌ Mot de passe incorrect !");
                return res.status(401).json({ message: "Mot de passe incorrect" });
            }
    
            console.log("✅ Connexion réussie pour :", email);
            const token = jwt.sign({ id_utilisateur: user.id_utilisateur, email: user.email }, JWT_SECRET, {
                expiresIn: '1h'
            });
           
            
    
            res.status(200).json({ message: "Connexion réussie", token });
        } catch (err) {
            console.error("🚨 Erreur serveur :", err);
            res.status(500).json({ message: "Erreur serveur" });
        }
    }
    static async getMessages(req, res) {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            if (!token) return res.status(401).json({ message: "Accès non autorisé" });
    
            const decoded = jwt.verify(token, JWT_SECRET);
            const userId = decoded.id_utilisateur;
    
            const password = req.headers.password;
            if (!password) return res.status(400).json({ message: "Mot de passe requis" });
    
            const user = await UserModel.getUserById(userId);
            const match = await bcrypt.compare(password, user.mot_de_passe);
            if (!match) return res.status(401).json({ message: "Mot de passe incorrect" });
    
            const messages = await MessageModel.getMessagesByUserId(userId);
            res.status(200).json(messages);
        } catch (err) {
            console.error("🚨 Erreur serveur :", err);
            res.status(500).json({ message: "Erreur serveur" });
        }
    }
    
    
}

module.exports = SessionHelper;
