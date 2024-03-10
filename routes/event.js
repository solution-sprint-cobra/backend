const express = require('express');
const router = express.Router();
const controller = require('../controllers/event');

router.get('/participant', controller.getParticipants);
router.put('/participant', controller.addParticipant);
router.delete('/participant', controller.removeParticipant);

router.get('/', controller.get);
router.put('/', controller.create);
router.post('/', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;