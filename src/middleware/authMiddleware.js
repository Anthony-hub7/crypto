const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token manquant ou mal formaté' });
    }

    // Extraire le token sans "Bearer "
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token invalide ou expiré' });
        }

        // Ajouter les infos de l'utilisateur dans req
        req.userId = decoded.id_utilisateur;
        req.email = decoded.email;
        next();
    });
}

module.exports = verifyToken;
