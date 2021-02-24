const Discord = require('discord.js');
const shopItem = require('../../db/models/shopItemModel');
const userEco = require('../../db/models/userEcoModel');
const userInv = require('../../db/models/userInventoryModel');
const helper = require('../../util/helper');
const { execute } = require('../currency/shop');

module.exports = {
    name: 'adjust',
    description: 'Sets a user, or all users, balance to provided amount',
    guildOnly: true,
    owner: true,
    async execute(message, args) {
        if (args.length == 1) {
            await userEco.updateMany({}, { balance: args[0] })
        } else {
            await userEco.updateOne({userId: args[0]}, {balance:args[1]})
        }
    }
}