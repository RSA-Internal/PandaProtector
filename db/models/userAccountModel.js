var mongoose = require('mongoose');
require('mongoose-long')(mongoose);
var Schema = mongoose.Schema;
var Long = Schema.Types.Long;

var userAccountModelSchema = new Schema({
    holderId: {
        type: String,
        required: true
    },
    wallet: {
        type: [],
        default: undefined
    },
    inventory: {
        type: [],
        default: undefined
    },
    stats: {
        type: [],
        default: undefined
    },
    lastLogin: {
        type: Long,
        default: 0
    }
});

module.exports = mongoose.model('userAccount', userAccountModelSchema);