const Discord = require('discord.js')
const helper = require('../../util/helper')

module.exports = {
    name: 'inventory',
    description: 'Display your inventory',
    guildOnly: true,
    cooldown: 15,
    async execute(message, args) {
        let inventory = await helper.getUserInventory(message.author.id);
        let account = await helper.getUserEcoAccount(message.author.id);
        let money = await helper.getMoneyEmoji(message);

        console.log(inventory);

        let jsonInv = JSON.parse(inventory.inventory);

        console.log(jsonInv);

        const embed = new Discord.MessageEmbed()
            .setTitle(`${message.member.displayName}'s Inventory`)
            .setColor(helper.randomColorHex())
            .addField('Balance', `${account.balance} ${money}`)
            .setThumbnail(message.author.avatarURL())

        if (Object.keys(jsonInv).length === 0) {
            embed.addField('Backpack', 'Not even a cobweb to be seen.', false);
        } else {
            var ret = "";

            for (var item in jsonInv) {
                console.log(item);
                ret += `${item}: ${jsonInv[item]}\n`;
            }

            embed.addField('Backpack', ret, false);
        }

        return message.channel.send(embed);
    }
}