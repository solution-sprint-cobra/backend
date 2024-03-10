const multer = require('multer');
const path = require('path');

const upload = multer({ dest: './uploads/' })

module.exports = upload;