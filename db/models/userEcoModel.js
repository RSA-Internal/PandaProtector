var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userEcoModelSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('userEco', userEcoModelSchema);