const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    username: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
        lowercase: true
    },
    lastName: {
        type: String,
        required: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    phone: {
        type: Number,
        default: 905555555555
    },
    hash: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        default: 1
    },
    location: {
        type: Object,
        default: { lat: 0, long: 0 }
    },
    role: {
        type: String,
        default: 'user'
    },
}, { timestamps: true })

module.exports = mongoose.model('User', schema);