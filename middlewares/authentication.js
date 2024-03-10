async function authentication(req, res, next) {
    let token = req.headers['x-api-key']
    if (token == null) return res.status(401).json({
        message: 'Token is required'
    });
    if (token != process.env.API_TOKEN) return res.status(401).json({
        message: 'Invalid token'
    });
    next()
}

module.exports = authentication;