var mongoose = require('mongoose');
require('mongoose-long')(mongoose);
var Long = mongoose.Schema.Types.Long;

var Schema = mongoose.Schema;

var shopItemModelSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    buy: {
        type: Long,
        required: true
    },
    sell: {
        type: Long,
        required: false
    },
    amount: {
        type: Number,
        required: false
    },
    category: {
        type: String,
        required: true
    },
    rarity: {
        type: String,
        default: "Common"
    }
});

module.exports = mongoose.model('shopItem', shopItemModelSchema);