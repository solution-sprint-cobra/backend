const mongoose = require('mongoose');

connectDB = async(logger) => {
    try {
        mongoose.set('strictQuery', false);
        const conn = await mongoose.connect(process.env.DB_STRING)
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        logger.error(err.message);
        logger.error('Exiting the app');
        process.exit(9)
    }
}

module.exports = connectDB;