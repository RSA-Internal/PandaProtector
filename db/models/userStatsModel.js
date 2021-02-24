var mongoose = require('mongoose');
require('mongoose-long')(mongoose);
var Long = mongoose.Schema.Types.Long;

var Schema = mongoose.Schema;

var userStatsModelSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    fishing: {
        type: Long,
        default: 0
    },
    farming: {
        type: Long,
        default: 0
    },
    mining: {
        type: Long,
        default: 0
    },
    crafting: {
        type: Long,
        default: 0
    },
    hunting: {
        type: Long,
        default: 0
    }
});

module.exports = mongoose.model('userStats', userStatsModelSchema);