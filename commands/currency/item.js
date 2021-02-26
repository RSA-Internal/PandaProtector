const helper = require('../../util/helper');
const dataHelper = require('../../util/dataHelper');

module.exports = {
    name: 'item',
    description: 'Display all items, or item specific details',
    guildOnly: true,
    cooldown: 10,
    owner: true,
    async execute(message, args) {
        if (args.length) {
            let query = args.join(' ');
            let item = dataHelper.getItem(query);

            if (item) {
                let data = [];
                for (var info in item) {
                    data.push(`${info}: ${item[info]}`);
                }

                const embed = helper.generateEmptyEmbed('', `${item.name}'s Details`);
                embed.addField('\u200b', data.join('\n'), false);

                return message.channel.send(embed);
            } else {
                return message.channel.send(`Could not find an item ${query.replace('@', '')}`);
            }
        } else {
            let items = require('../../util/containers/item');
            let list = [];
            for (var index in items) {
                let item = items[index];
                list.push(`${item.name} [${item.localized}]`);
            }

            const embed = helper.generateEmptyEmbed('', 'Item List');
            embed.setDescription('Listing goes \'Item Name\' [localized name]');
            embed.addField('\u200b', list.join('\n'), false);

            return message.channel.send(embed);
        }
    }
}