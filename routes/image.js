const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer');
const Image = require('../models/Image');
const fs = require('fs');

router.get('/:id', async(req, res) => {

    let item = await Image.findOne({
        _id: req.params.id
    });

    if (!item) {
        return res.status(404).json({
            message: 'Image not found'
        });
    }

    let read = fs.createReadStream('./uploads/' + item.filename);
    read.pipe(res);
});

router.post('/', upload.single('image'), (req, res, next) => {

    const file = req.file

    if (!file) {
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400
        return next(error)
    }

    let item = new Image({
        filename: file.filename,
        contentType: file.mimetype
    });

    item.save();

    res.send({
        message: 'Image added successfully',
        id: item._id,
        name: file.filename,
        contentType: file.mimetype,
        url: 'http://' + process.env['URL'] + ':' + process.env['PORT'] + '/api/image/' + item._id
    })
});

module.exports = router;