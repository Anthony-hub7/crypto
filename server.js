// server.js
const express    = require('express');
const bodyParser = require('body-parser');
const cors       = require('cors');
const path       = require('path');
const http       = require('http');
const WebSocket  = require('ws');
const db         = require('./src/database/db');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'view')));
app.use(express.json());



// 🔹 Vérification de la connexion à la base de données
db.connect((err) => {
    if (err) {
        console.error('❌ Erreur de connexion à MySQL :', err);
        process.exit(1); // 🔹 Arrête le serveur si la base de données ne fonctionne pas
    }
    console.log('✅ Connecté à la base de données MySQL 🎉');
});

// 🔹 Routes API
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const contactRoutes = require('./routes/contactRoutes');
const messageRoutes = require('./routes/messageRoutes');
const AESRoutes = require('./routes/AESRoutes');
 
app.use('/api', authRoutes);  // 🔹 Préfixe "/api/auth"
app.use('/api', messageRoutes);
app.use('/api', userRoutes);
app.use('/api', contactRoutes);  // Routes utilisateurs
app.use('/api', AESRoutes); 
// 🔹 Route principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'index.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'login.html'));
});
// Route pour afficher la page de profil
app.get('/profil', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'profil.html'));
});
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'contact.html'));
});
app.get('/message', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'profil.html'));
});


const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

//  → Map userId → ws
const clients = new Map();

wss.on('connection', (ws, req) => {
  // 1) Récupérer le userId depuis la query string
  const params = new URLSearchParams(req.url.replace(/^.*\?/, ''));
  const userId = params.get('userId');
  if (!userId) {
    ws.close(1008, 'No userId provided');
    return;
  }

  // 2) Stocker la socket
  clients.set(userId, ws);
  console.log(`🔗 WebSocket connecté pour user ${userId}`);

  ws.on('message', raw => {
    // 3) Parser le message
    let msg;
    try { msg = JSON.parse(raw); }
    catch (e) { return console.error('❌ JSON invalide', raw); }

    if (msg.type === 'chat') {
      const { expediteur, destinataire, message, date_envoi } = msg.payload;

      // → (Optionnel) Persister en BDD ici…

      // 4) Envoyer au destinataire, s’il est en ligne
      const destWs = clients.get(String(destinataire));
      if (destWs && destWs.readyState === WebSocket.OPEN) {
        destWs.send(JSON.stringify({
          type: 'chat',
          payload: { expediteur, destinataire, message_dechiffre: message, date_envoi }
        }));
      }

      // 5) Echo au propre expéditeur pour confirmation immédiate
      ws.send(JSON.stringify({
        type: 'chat',
        payload: { expediteur, destinataire, message_dechiffre: message, date_envoi }
      }));
    }
  });

  ws.on('close', () => {
    clients.delete(userId);
    console.log(`❌ WebSocket déconnecté pour user ${userId}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});