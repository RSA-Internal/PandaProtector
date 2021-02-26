const helper = require('../../util/helper');
const dataHelper = require('../../util/dataHelper');

module.exports = {
    name: 'shop',
    description: 'Interact with the Global Shop',
    guildOnly: true,
    async execute(message, args) {
        let money = helper.getMoneyEmoji(message);

        if (args.length == 0) {
            //display categories
            let categories = dataHelper.getCategories();

            return message.channel.send(`Please use \`;shop [category]\` to get a list of items in that category.\n${"-".repeat(75)}\n${categories.join('\n')}`);
        }

        if (args.length == 1) {
            //;shop category
            let category = args[0];

            let categories = dataHelper.getCategories();
            for (var cat in categories) {
                console.log(categories[cat]);
                if (categories[cat].toLowerCase() === category.toLowerCase()) {
                    category = categories[cat];
                }
            }

            let shopAccount = await dataHelper.getAccount(-1);
            let inventory = shopAccount.inventory[0];

            const embed = helper.generateEmptyEmbed('https://cdn2.iconfinder.com/data/icons/market-and-economics-21/48/23-512.png', `${category} Shop`);

            let available = [];

            for (var it in inventory) {
                let item = inventory[it];
                if (item.category.toLowerCase() === category.toLowerCase()) {
                    if (item.amount > 0) {
                        available.push(item);
                    }
                }
            }

            if (available.length) {
                let count = 0;
                
                for (var it in available) {
                    count += 1;
                    let item = available[it];

                    let display = `[${item.rarity.slice(0,1)}] ${item.name}: ${item.buy} ${money}`;
                    let amount = `Amount in shop: ${item.amount}`;
                    
                    embed.addField(display, amount, true);
                }

                for (var i=count%3;i<3;i++) {
                    embed.addField('\u200b', '\u200b', true);
                }
            } else {
                embed.addField('\u200b', 'Alas, we do not sell cobwebs here.', false);
            }

            return message.reply(embed);
        }

        if (args.length >= 2) {
            /**
             * ;shop buy [itemName](or itemId) <amount>
             * ;shop sell [itemName](or itemId) <amount>
             */

            let subCommand = args[0].toLowerCase();
            let amount = 1;
            let sliceFrom = 2;
            if (parseInt(args[1])) {
                amount = parseInt(args[1]);
            } else {
                sliceFrom = 1;
            }
            let itemQuery = args.slice(sliceFrom).join(' ');

            let shopAccount = await dataHelper.getAccount(dataHelper.SHOP_ID);
            let userAccount = await dataHelper.getAccount(message.author.id);

            let shopInventory = shopAccount.inventory[0];
            let userInventory = userAccount.inventory[0];

            let shopBalance = shopAccount.wallet[0]['tix']['amount'];
            let userBalance = userAccount.wallet[0]['tix']['amount'];

            if (subCommand === 'buy') {
                let item = dataHelper.getItem(itemQuery);
                
                if (item) {
                    let identifier = item.localized;
                    let output = identifier;
                    let shopAmount = shopInventory[identifier]['amount'];
                    let userAmount = userInventory[identifier]['amount'];
                    let worth = item.buy;
                    let totalCost = worth * amount;
                    if (amount > 1) {
                        output += 's';
                    }

                    if (shopAmount == 0) { return message.channel.send(`The shop does not have any ${output} to buy.`); }
                    if (shopAmount < amount) { return message.channel.send(`The shop does not have ${amount} ${output} to buy.`); }
                    if (!item.buyable) { return message.channel.send(`${item.name} can not be purchased.`); }
                    if (userBalance < totalCost) { return message.channel.send('You can not afford this transaction.'); }

                    await dataHelper.updateBalanceForAccount(userAccount, 'tix', userBalance-totalCost);
                    await dataHelper.updateBalanceForAccount(shopAccount, 'tix', shopBalance+totalCost);
                    await dataHelper.updateItemForAccount(shopAccount, identifier, shopAmount-amount);
                    await dataHelper.updateItemForAccount(userAccount, identifier, userAmount+amount);

                    return message.channel.send(`Bought ${amount} ${output} for ${totalCost} ${money}`);
                } else {
                    return message.channel.send(`${itemQuery.replace('@', '')} is not a valid item.`);
                }
            } else if (subCommand === 'sell') {
                let item = dataHelper.getItem(itemQuery);
                
                if (item) {
                    let identifier = item.localized;
                    let output = identifier;
                    let shopAmount = shopInventory[identifier]['amount'];
                    let userAmount = userInventory[identifier]['amount'];
                    let worth = item.sell;
                    let totalCost = worth * amount;
                    if (amount > 1) {
                        output += 's';
                    }

                    if (userAmount == 0) { return message.channel.send(`You do not have any ${output} to sell.`); }
                    if (userAmount < amount) { return message.channel.send(`You do not have ${amount} ${output} to sell`); }
                    if (!item.sellable) { return message.channel.send(`${item.name} can not be sold.`); }
                    if (shopBalance < totalCost) { return message.channel.send('The shop can not afford this transaction.'); }

                    await dataHelper.updateItemForAccount(userAccount, identifier, userAmount-amount);
                    await dataHelper.updateItemForAccount(shopAccount, identifier, shopAmount+amount);
                    await dataHelper.updateBalanceForAccount(shopAccount, 'tix', shopBalance-totalCost);
                    await dataHelper.updateBalanceForAccount(userAccount, 'tix', userBalance+totalCost);

                    return message.channel.send(`Sold ${amount} ${output} for ${totalCost} ${money}`);
                } else {
                    return message.channel.send(`${itemQuery.replace('@', '')} is not a valid item.`);
                }
            }
        }
    }
}