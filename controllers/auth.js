const functions = require('../libs/functions')
const { genPassword, validPassword } = require('../libs/password');
const User = require('../models/User');

exports.create = async(req, res) => {
    try {
        const {
            email,
            username,
            firstName,
            lastName,
            phone,
            role,
            location,
            password
        } = req.body;

        // check if all required fields are present
        if (!email || !username || !firstName || !lastName || !phone || !role || !location || !password) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        // Check if user with the same email and username already exists
        let user = await User.findOne({
            email
        });
        if (user) return res.status(400).json({
            message: 'User already exists'
        });

        user = await User.findOne({
            username
        });

        if (user) return res.status(400).json({
            message: 'Username already exists'
        });

        const saltHash = genPassword(password);
        const salt = saltHash.salt;
        const hash = saltHash.hash;
        const newUser = new User({
            email,
            hash,
            username,
            firstName,
            lastName,
            phone,
            role,
            location,
        });
        const nUser = await newUser.save();
        res.json(nUser);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

exports.login = async(req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        const user = await User.findOne({
            email
        });

        if (!user) return res.status(400).json({
            message: 'User does not exist'
        });

        const isValid = validPassword(password, user.hash, process.env['SALT']);
        if (isValid) {
            res.json({
                message: 'Login successful'
            });
        } else {
            res.status(401).json({
                message: 'Invalid credentials'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}