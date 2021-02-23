var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userInventoryModelSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    inventory: {
        type: String,
        default: '{}'
    }
});

module.exports = mongoose.model('userInv', userInventoryModelSchema);