const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth');

router.post('/signup', controller.create);
router.post('/signin', controller.login);

module.exports = router;