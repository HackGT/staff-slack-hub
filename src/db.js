const mongoose = require('mongoose');

class NotAuthorizedError extends Error {
    constructor() {
        super();
        this.name = "NotAuthorizedError"
    }
}

class WrongTeamError extends Error {
    constructor() {
        super();
        this.name = "WrongTeamError"
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
    WrongTeamError,
    Token
}