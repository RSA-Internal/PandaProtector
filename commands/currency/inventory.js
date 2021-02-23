const Discord = require('discord.js')
const helper = require('../../util/helper')

module.exports = {
    name: 'inventory',
    description: 'Display your inventory',
    guildOnly: true,
    cooldown: 15,
    async execute(message, args) {
        let inventory = await helper.getUserInventory(message.author.id);

        console.log(inventory);

        let jsonInv = JSON.parse(inventory.inventory);

        console.log(jsonInv);

        if (Object.keys(jsonInv).length === 0) {
            return message.channel.send('You want some cobwebs for that empty space?');
        } else {
            var ret = "";
            for (var item in jsonInv) {
                console.log(item);
                ret += `${item}: ${jsonInv[item]}\n`;
            }

            return message.channel.send(ret);
        }
    }
}