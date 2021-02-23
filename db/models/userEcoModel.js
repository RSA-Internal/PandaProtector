var mongoose = require('mongoose');
require('mongoose-long')(mongoose);
var Long = mongoose.Schema.Types.Long;

var Schema = mongoose.Schema;

var userEcoModelSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    balance: {
        type: Long,
        required: true
    }
})

module.exports = mongoose.model('userEco', userEcoModelSchema);