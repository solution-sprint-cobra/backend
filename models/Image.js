const mongoose = require('mongoose');
const Schema = mongoose.Schema

const schema = new Schema({
    filename: {
        type: String,
        required: true
    },
    contentType: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Image', schema);