var mongoose = require('mongoose');
require('mongoose-long')(mongoose);
var Schema = mongoose.Schema;
var Long = Schema.Types.Long;

var itemModelSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    buy: {
        type: Long,
        default: 0
    },
    sell: {
        type: Long,
        default: 0
    },
    amount: {
        type: Long,
        default: 0
    },
    id: {
        type: Number,
        required: true
    },
    localized: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: "Items"
    },
    rarity: {
        type: String,
        default: "Common"
    },
    rating: {
        type: Number,
        default: 0
    },
    buyable: {
        type: Boolean,
        default: true
    },
    sellable: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('itemModel', itemModelSchema);