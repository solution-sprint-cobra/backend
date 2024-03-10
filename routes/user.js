const express = require('express');
const router = express.Router();
const controller = require('../controllers/user');

router.get('/', controller.get);
router.post('/', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;