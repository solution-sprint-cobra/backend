const mongoose = require('mongoose');
const Schema = mongoose.Schema

const schema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: 'No description'
    },
    type: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    location: {
        type: Object,
        default: {
            address: '',
            lat: 0,
            long: 0
        }
    },
    image: {
        type: Schema.Types.ObjectId,
        ref: 'Image'
    },
    status: {
        type: Number,
        default: 1
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', schema);