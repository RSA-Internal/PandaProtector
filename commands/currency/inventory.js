const Discord = require('discord.js')
const helper = require('../../util/helper')

module.exports = {
    name: 'inventory',
    description: 'Display your inventory',
    guildOnly: true,
    aliases: ['inv'],
    cooldown: 15,
    async execute(message, args) {
        let member = message.member;
        if (args[0]) { member = await helper.queryMember(message, args); }
        let user = member.user;

        if (!user) { return message.channel.send('Failed to find user.'); };

        let inventory = await helper.getUserInventory(user.id);
        let account = await helper.getUserEcoAccount(user.id);
        let money = await helper.getMoneyEmoji(message);

        let jsonInv = JSON.parse(inventory.inventory);

        const embed = helper.generateEmptyEmbed(user.avatarURL(), `${member.displayName}'s Inventory`)
            .addField('Balance', `${account.balance} ${money}`)

        if (Object.keys(jsonInv).length === 0) {
            embed.addField('Backpack', 'Not even a cobweb to be seen.', false);
        } else {
            var ret = "";
            var worth = 0;

            for (var item in jsonInv) {
                let itemData = await helper.getItem(item);
                let display = helper.prependRarity(itemData.rarity, itemData.name);

                ret += `${display}: ${jsonInv[item]}\n`;

                worth += parseInt(itemData.sell);
            }

            embed.addField(`Backpack (worth: ${worth} ${money})`, ret, false);
        }

        return message.channel.send(embed);
    }
}