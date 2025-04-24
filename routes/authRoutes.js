const express = require('express');
const router = express.Router();
const SessionHelper = require('../src/session/session_helper');
router.post('/auth/login', SessionHelper.login);


module.exports = router;
