var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var rbxAccountModelSchema = new Schema({
    authorId: {
        type: String,
        required: true,
    },
    robloxId: {
        type: String,
        required: true,
    },
    robloxUsername: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('rbxAccount', rbxAccountModelSchema);