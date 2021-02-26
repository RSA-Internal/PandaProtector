var mongoose = require('mongoose');
require('mongoose-long')(mongoose);
var Schema = mongoose.Schema;
var Long = Schema.Types.Long;

var currencyModelSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    amount: {
        type: Long,
        default: 0
    }
});

module.exports = mongoose.model('currencyModel', currencyModelSchema);