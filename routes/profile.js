const express = require('express');
const router = express.Router();
const controller = require('../controllers/profile');

router.get('/', controller.get);
router.post('/', controller.update);
router.put('/', controller.create);
router.delete('/:id', controller.delete);

module.exports = router;