const Discord = require('discord.js');
const shopItem = require('../../db/models/shopItemModel');
const userEco = require('../../db/models/userEcoModel');
const userInv = require('../../db/models/userInventoryModel');
const helper = require('../../util/helper');

const localization = {['items']: 'Items',
                      ['currency']: 'Currency',
                      ['roles']: 'Roles'};

module.exports = {
    name: 'shop',
    description: 'Interact with the Global Shop',
    guildOnly: true,
    async execute(message, args) {
        let money = helper.getMoneyEmoji(message);

        if (args.length == 0) {
            //display categories to choose from
            let categories = await helper.getCategories();
            let list = [];

            for (var category in categories) {
                console.log(category);
                console.log(categories[category]);
                list.push(categories[category])
            }

            return message.channel.send(`Please use \`;shop [category]\` to get a list of items in that category.\n${"-".repeat(75)}\n${list.join('\n')}`);
        }
        if (args.length == 1) {
            /**
             * ;shop [category]
             * ;shop [itemName]
             * ;shop [itemID]
             */
            let localized = localization[args[0].toLowerCase()];
            if (localized === undefined) {
                return message.channel.send('Please provide a valid shop category to browse available items.');
            }
            let items = await shopItem.find({ category: localized });

            const embed = helper.generateEmptyEmbed('https://cdn2.iconfinder.com/data/icons/market-and-economics-21/48/23-512.png', `${localized} Shop`);

            let added = false;
            let count = 0;

            for (var item in items) {
                let data = items[item];

                if (data.amount > 0) {
                    count += 1;
                    added = true;
                    let sellDisplay = 'Unsellable';
                    if (data.sell > 0) {
                        sellDisplay = `${data.sell} ${money}`
                    }

                    let itemLocalized = data['name'];
                    while (itemLocalized.includes(' ')) {
                        itemLocalized = itemLocalized.replace(' ', '_');
                    }

                    embed.addField(`${data['name']}: ${data.buy} ${money}`, `Amount in shop: ${data.amount}`, true);
                }
            }

            for (var i=count%3;i<3;i++) {
                embed.addField('\u200b', '\u200b', true);
            }

            if (!added) {
                embed.addField('\u200b', 'Unfortunately we do not sell cobwebs.', false);
            }

            message.channel.send(embed);
        }
        if (args.length >= 2) {
            /**
             * ;shop buy [itemName](or itemID {will be mongo _id}) <amount>
             * ;shop sell [itemName](or itemID {will be mongo _id}) <amount>
             */
            let subCommand = args[0].toLowerCase();
            let itemQuery = args[1];
            let amount = parseInt(args[2]) || 1;
            
            if (subCommand === 'buy') {
                let localized = itemQuery;
                while (localized.includes('_')) {
                    localized = localized.replace('_', ' ');
                }

                let item = await shopItem.findOne({ name: itemQuery });
                if (!item) {
                    item = await shopItem.findOne({ name: localized });
                    if (!item) {
                        if (itemQuery.length == 24) {
                            item = await shopItem.findById(itemQuery)
                        }
                    }
                }

                if (!item) {
                    return message.channel.send('Failed to find the item specified. Perhaps it is a forbidden item?');
                } else {
                    let shopHave = parseInt(item.amount);
                    let itemCost = parseInt(item.buy);
                    let totalCost = itemCost * amount;

                    /* Set purchase amount to store amount, unless store has infinite */
                    if (amount > shopHave && shopHave != -1) {
                        amount = shopHave;
                    }

                    let itemDisplay = item.name;
                    if (amount > 1 || amount == 0) {
                        itemDisplay = itemDisplay + 's';
                    }

                    let balance = await helper.getUserBalance(message.author.id);

                    if (shopHave == 0) {
                        return message.channel.send(`The shop has 0 ${itemDisplay}`);
                    }

                    if (balance < totalCost) {
                        return message.channel.send(`You do not have enough ${money} to purchase ${amount} ${itemDisplay}`);
                    }

                    await helper.updateShopItem(item.name, -amount);
                    await helper.updateBalance(message.author.id, -totalCost);
                    await helper.updateInventory(message.author.id, item.name, amount);

                    return message.channel.send(`Successfully purchased ${amount} ${itemDisplay} for ${totalCost} ${money}`);
                }
            } else if (subCommand === 'sell') {
                let localized = itemQuery;
                while (localized.includes('_')) {
                    localized = localized.replace('_', ' ');
                }

                let foundBy = itemQuery;
                let foundById = false;

                let item = await shopItem.findOne({ name: itemQuery });
                if (!item) {
                    item = await shopItem.findOne({ name: localized });
                    foundBy = localized;
                    if (!item) {
                        if (itemQuery.length == 24) {
                            item = await shopItem.findById(itemQuery);
                            foundById = true;
                        }
                    }
                }

                if (!item) {
                    return message.channel.send('The shop can not buy this item. Perhaps it is a forbidden item?');
                }

                let itemDisplay = item.name;
                if (amount > 1 || amount == 0) {
                    itemDisplay = itemDisplay + 's';
                }

                let sellPrice = parseInt(item.sell);

                if (sellPrice == 0) {
                    return message.channel.send(`The shop can not buy ${itemDisplay}.`);
                }

                let userInventory = await helper.getUserInventory(message.author.id);
                var jsonInv = JSON.parse(userInventory.inventory);

                if (jsonInv[itemQuery]) {
                    let userHave = parseInt(jsonInv[itemQuery]);

                    if (userHave < amount) {
                        amount = userHave;
                    }

                    let totalSell = sellPrice * amount;
                    let shopBal = await helper.getUserBalance(-1);

                    if (shopBal < totalSell) {
                        return message.channel.send('The server does not have enough money for this transaction.');
                    }

                    await helper.updateShopItem(item.name, amount);
                    await helper.updateInventory(message.author.id, item.name, -amount);
                    await helper.updateBalance(-1, -totalSell);
                    await helper.updateBalance(message.author.id, totalSell);
                    
                    return message.channel.send(`Sold ${amount} ${itemDisplay} for ${totalSell} ${money}`);
                } else {
                    return message.channel.send(`You don't have any ${itemQuery}s to sell`);
                }
            }
        }
    }
}