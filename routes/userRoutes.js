const express = require('express');
const router = express.Router();
const UserController = require('../src/controller/UserController');
const verifyToken = require('../src/middleware/authMiddleware');

router.post('/users', UserController.createUser);
router.get('/users', UserController.getAllUsers);
router.get('/users/:id', UserController.getUserById);
router.put('/users/:id', UserController.updateUser);
router.delete('/users/:id', UserController.deleteUser);
router.post('/login', UserController.login);
router.get('/profil', verifyToken, UserController.getProfile);

module.exports = router;
