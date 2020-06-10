const mongoose = require('mongoose');

class NotAuthorizedError extends Error {
    constructor(message) {
        super(message);
        this.name = "NotAuthorizedError"
    }
}

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });

let db = mongoose.connection;
db.on('error', console.error.bind(console), 'MongoDB connection error:');

let Token = mongoose.model('Token', new mongoose.Schema({
    appId: String,
    team: {
        id: String,
        name: String
    },
    user: {
        token: String,
        id: String,
        scopes: [String]
    }
}));

module.exports = {
    NotAuthorizedError,
    Token
}