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
            let categories = await shopItem.find().distinct('category', function(err, categories) {
                if (err) {
                    console.log(err);
                    return message.channel.send('Error fetching shop data. Please try again later.');
                }
            })

            let list = [];

            for (var category in categories) {
                console.log(category);
                console.log(categories[category]);
                list.push(categories[category]);
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

            const embed = new Discord.MessageEmbed()
                .setTitle(`${localized} Shop`)
                .setColor('#328823');

            for (var item in items) {
                let data = items[item];

                let sellDisplay = 'Unsellable';
                if (data.sell > 0) {
                    sellDisplay = `${data.sell} ${money}`
                }

                embed.addField(data['name'], `Buy: ${data.buy}\nSell: ${sellDisplay}\nAmount in shop: ${data.amount}\nID: ${data._id}`, false);
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
            let amount = args[2] || 1;
            
            if (subCommand === 'buy') {
                let item = await shopItem.findOne({ name: itemQuery });
                if (!item) {
                    item = await shopItem.findById(itemQuery);
                }

                if (!item) {
                    return message.channel.send('Failed to find the item specified.');
                } else {
                    let shopHave = item.amount;
                    let itemCost = item.buy;
                    let totalCost = itemCost * amount;

                    /* Set purchase amount to store amount, unless store has infinite */
                    if (amount > shopHave && shopHave != -1) {
                        amount = shopHave;
                    }

                    let itemDisplay = item.name;
                    if (amount > 1 || amount == 0) {
                        itemDisplay = itemDisplay + 's';
                    }

                    let userAccount = await helper.getUserEcoAccount(message.author.id);
                    let balance = userAccount.balance;

                    let userInventory = await helper.getUserInventory(message.author.id);

                    if (shopHave == 0) {
                        return message.channel.send(`The shop has 0 ${itemDisplay}`);
                    }

                    if (balance < totalCost) {
                        return message.channel.send(`You do not have enough ${money} to purchase ${amount} ${itemDisplay}`);
                    }

                    item.amount = item.amount - amount;
                    userAccount.balance = balance - totalCost;

                    await shopItem.updateOne({name: item.name}, item);
                    await userEco.updateOne({userId: message.author.id}, userAccount);
                    //update inventory

                    let jsonInv = JSON.parse(userInventory.inventory);
                    let count = 0;
                    if (jsonInv[item.name]) {
                        count = jsonInv[item.name];
                    }

                    count = count + amount;
                    jsonInv[item.name] = count;
                    userInventory.inventory = JSON.stringify(jsonInv);

                    await userInv.updateOne({userId: message.author.id}, userInventory);

                    return message.channel.send(`Successfully purchased ${amount} ${itemDisplay} for ${totalCost} ${money}`);
                }
            }
        }
    }
}