const helper = require('../../util/helper');

module.exports = {
    name: 'item',
    description: 'Display all items, or item specific details',
    guildOnly: true,
    cooldown: 30,
    async execute(message, args) {
        let items = await helper.getItemList();

        if (args[0]) {
            if (items.includes(args[0].toLowerCase())) {
                let item = await helper.getItem(args[0].toLowerCase());
                let money = await helper.getMoneyEmoji(message);

                let embed = helper.generateEmptyEmbed('https://image.flaticon.com/icons/png/512/1710/1710414.png', `${item.name} details`);

                embed.addField('Buy Price', `${item.buy} ${money}`, true);
                embed.addField('Sell Price', `${item.sell} ${money}`, true);
                embed.addField('Rarity', `${item.rarity}`, true);
                embed.addField('Category', `${item.category}`, true);
                embed.addField('Amount in shop', `${item.amount}`, true);
                embed.addField('Total in world', await helper.getAllItemsInWorld(item.name), true);

                return message.channel.send(embed);
            } else {
                return message.channel.send('That is not a valid item');
            }
        } else {
            return message.channel.send(`Item List\n---------\n${items.join('\n')}`);
        }
    }
}