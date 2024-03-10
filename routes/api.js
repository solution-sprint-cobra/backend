const express = require('express');
const router = express.Router();

const authRoute = require('./auth');
const imageRoute = require('./image');
const userRoute = require('./user');
const profileRoute = require('./profile');
const eventRoute = require('./event');

const authentication = require('../middlewares/authentication');

router.use(function(req, res, next) {
    // is req.query is, check is there any key value equals to 'null' exclude key
    if (req.query) {
        for (let key in req.query) {
            if (req.query[key] === 'null') {
                req.query[key] = undefined
            }
        }
    }

    // is req.body is, check is there any key value equals to 'null' exclude key
    if (req.body) {
        for (let key in req.body) {
            if (req.body[key] === 'null') {
                req.body[key] = undefined
            }
        }
    }

    next();
})

router.use('/auth', authentication, authRoute);
router.use('/image', imageRoute);
router.use('/user', authentication, userRoute);
router.use('/profile', authentication, profileRoute);
router.use('/event', authentication, eventRoute);

module.exports = router;