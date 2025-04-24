const crypto = require('crypto');

// Génération d'une clé secrète pour AES-256
const secretKey = crypto.randomBytes(32);  // 256 bits

// Exemple de chiffrement AES-256-CBC
const iv = crypto.randomBytes(16);  // 128 bits
const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);

let encryptedMessage = cipher.update('Hello, world!', 'utf8', 'hex');
encryptedMessage += cipher.final('hex');

// Exemple de déchiffrement AES-256-CBC
const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, iv);

let decryptedMessage = decipher.update(encryptedMessage, 'hex', 'utf8');
decryptedMessage += decipher.final('utf8');

console.log('Message chiffré:', encryptedMessage);
console.log('Message déchiffré:', decryptedMessage);
