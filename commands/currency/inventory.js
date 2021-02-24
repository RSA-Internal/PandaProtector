const Discord = require('discord.js')
const helper = require('../../util/helper')

module.exports = {
    name: 'inventory',
    description: 'Display your inventory',
    guildOnly: true,
    aliases: ['inv'],
    cooldown: 15,
    async execute(message, args) {
        let inventory = await helper.getUserInventory(message.author.id);
        let account = await helper.getUserEcoAccount(message.author.id);
        let money = await helper.getMoneyEmoji(message);

        let jsonInv = JSON.parse(inventory.inventory);

        const embed = helper.generateEmptyEmbed(message.author.avatarURL(), `${message.member.displayName}'s Inventory`)
            .addField('Balance', `${account.balance} ${money}`)

        if (Object.keys(jsonInv).length === 0) {
            embed.addField('Backpack', 'Not even a cobweb to be seen.', false);
        } else {
            var ret = "";

            for (var item in jsonInv) {
                ret += `${item}: ${jsonInv[item]}\n`;
            }

            embed.addField('Backpack', ret, false);
        }

        return message.channel.send(embed);
    }
}