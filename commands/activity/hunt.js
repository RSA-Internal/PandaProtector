const items = ['hide', 'raw_meat', 'antler', 'tix', '30 tix', 'hide', 'raw_meat', 'antler', 'raw_meat', 'antler'];
const helper = require('../../util/helper');
const dataHelper = require('../../util/dataHelper');

module.exports = {
    name: 'hunt',
    description: 'Go hunting, but beware you might get hurt',
    guildOnly: true,
    cooldown: 30,
    async execute(message, args) {
        let userId = message.author.id;
        let account = await dataHelper.getAccount(userId);

        dataHelper.incrementStatForAccount(account, 'hunting');

        let chance = Math.floor(Math.random()*100)

        if (chance <= 40) {
            let itemChance = Math.floor(Math.random()*items.length);
            let item = items[itemChance];

            if (item === 'tix') {
                let found = Math.floor(Math.random()*4) + 1;
                dataHelper.updateBalanceForAccount(account, 'tix', account.wallet[0]['tix']['amount'] + found);
                return message.reply(`You found ${found} tix!`);
            } else if (item === '30 tix') {
                dataHelper.updateBalanceForAccount(account, 'tix', account.wallet[0]['tix']['amount'] + 30);
                return message.reply(`You found 30 tix!`);
            } else {
                let amount = 1;
                if (account.inventory) {
                    if (account.inventory[0] && account.inventory[0][item]) {
                        amount += account.inventory[0][item]['amount'];
                    }
                }
                dataHelper.updateItemForAccount(account, item, amount);
                return message.reply(`You found a ${item}`);
            }
        } else {
            let bearAccount = await dataHelper.getAccount(dataHelper.BEAR_ID);
            let bearInv = bearAccount.inventory[0];

            let inv = account.inventory[0];
            let modifier = 0;
            if (inv['raw_meat']['amount'] > 0) {
                modifier = Math.min(inv['raw_meat']['amount'], 20);
            }

            let findChance = Math.floor(Math.random()*1000);
            if (findChance == 273) {
                let caughtChance = Math.floor(Math.random()*50);

                if (caughtChance == 36) {
                    //caught by bear, lose everything.
                    let lost = false;

                    for (var it in inv) {
                        let item = inv[it];
                        let loc = item.localized;
                        let toBear = item.amount;

                        if (toBear > 0) {
                            lost = true;
                            await dataHelper.updateItemForAccount(account, loc, 0);
                            await dataHelper.updateItemForAccount(bearAccount, loc, bearInv[loc]['amount'] + toBear);
                        }
                    }

                    if (lost) {
                        return message.reply('You found the bear cave, but were caught by the bear and have lost everything.');
                    } else {
                        return message.reply('You found the bear cave, but were caught by the bear, luckily you did not have anything to lose.');
                    }
                } else {
                    //found bear cave, take everything from bear
                    let gained = false;

                    for (var it in bearInv) {
                        let item = bearInv[it];
                        let loc = item.localized;
                        let toUser = item.amount;

                        if (toUser > 0) {
                            gained = true;
                            await dataHelper.updateItemForAccount(bearAccount, loc, 0);
                            await dataHelper.updateItemForAccount(account, loc, inv[loc]['amount'] + toUser);
                        }
                    }

                    if (gained) {
                        return message.reply('You have found the bear cave and escaped unseen. You gained everything from the cave.');
                    } else {
                        return message.reply('You have found the bear cave and escaped unseen. However, there was nothing to be found in the cave.');
                    }
                }
            } else {
                if (chance >= 80-modifier) {
                    //got into a fight with a bear, lose a random item.
                    let items = [];
                    
                    for (var index in inv) {
                        let item = inv[index];
                        if (item['amount'] > 0) {
                            items.push(item);
                        }
                    }
    
                    if (items.length > 0) {
                        let random = Math.floor(Math.random()*items.length);
                        let item = items[random];
                        let count = item.amount;
                        
                        let bearCount = bearInv[item.localized]['amount'];
                        
                        await dataHelper.updateItemForAccount(account, item.localized, 0);
                        await dataHelper.updateItemForAccount(bearAccount, item.localized, bearCount + count);
                        
                        if (count > 1) {
                            item = item + 's';
                        }
    
                        return message.reply(`got into a fight with a bear, and lost ${count} ${item.name}`);
                    } else {
                        return message.reply('got into a fight with a bear');
                    }
                } else {
                    return message.reply('Better luck next time.');
                }
            }
        }
    }
}