const dataHelper = require('../../util/dataHelper');
const helper = require('../../util/helper');

module.exports = {
    name: 'inventory',
    description: 'Display your inventory',
    guildOnly: true,
    aliases: ['inv'],
    cooldown: 15,
    async execute(message, args) {
        let account = null;
        let displayName = '';
        let avatar = '';
        if (args[0] && args[0] == -2) {
            account = await dataHelper.getAccount(-2);
            displayName = 'Bear';
            avatar = 'https://www.clipartmax.com/png/middle/185-1850409_pixel-bear-icon.png';
        } else {
            let member = await helper.queryMember(message, args);
            let id = member.user.id;
            account = await dataHelper.getAccount(id);
            displayName = member.displayName;
            avatar = member.user.avatarURL();
        }
        
        let money = await helper.getMoneyEmoji(message);

        let inventory = account.inventory[0];
        let wallet = account.wallet[0];

        const embed = helper.generateEmptyEmbed(avatar, `${displayName}'s Inventory`)

        let moneyRet = [];
        for (var currency in wallet) {
            let cur = wallet[currency];
            moneyRet.push(`${money}: ${cur.amount}`);
        }
        embed.addField('Wallet', moneyRet.join('\n'), false);

        let worth = 0;
        let itemRet = [];
        for (var item in inventory) {
            let it = inventory[item];
            if (it.amount > 0) {
                itemRet.push(`[${it.rarity.slice(0,1)}] ${it.name}: ${it.amount}`);
                worth += it.sell;
            }
        }

        let title = 'Backpack';
        let display = 'Not even a cobweb to be seen.';
        if (itemRet.length) {
            title = `Backpack (worth: ${worth} ${money})`
            display = itemRet.join('\n');
        }

        embed.addField(title, display, true);
        embed.addField('\u200b', '\u200b', true);

        return message.channel.send(embed);
    }
}