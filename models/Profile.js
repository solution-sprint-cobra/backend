const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        min: 6,
        max: 20,
        required: true,
    },
    bio: {
        type: String,
        default: 'Need to update bio'
    },
    disabilities: {
        type: Array,
        default: []
    },
    status: {
        type: Number,
        default: 1
    },
    gender: {
        type: String,
        required: true,
    },
    likedActivities: {
        type: Array,
        default: []
    },
    disLikedActivities: {
        type: Array,
        default: []
    },
    hobbies: {
        type: Array,
        default: []
    },
    image: {
        type: Schema.Types.ObjectId,
        ref: 'Image'
    }
}, { timestamps: true });

module.exports = mongoose.model('Profile', schema);