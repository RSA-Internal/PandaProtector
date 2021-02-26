const items = ['wheat', 'seeds', 'carrot', 'tix', 'wheat', 'potato', 'seeds', 'carrot', 'boot', 'carrot', 'wheat', 'seeds', 'carrot', 'potato', 'carrot'];

const helper = require('../../util/helper');
const dataHelper = require('../../util/dataHelper');

module.exports = {
    name: 'farm',
    description: 'Go farming',
    guildOnly: true,
    cooldown: 30,
    async execute(message, args) {
        let userId = message.author.id;
        let account = await dataHelper.getAccount(userId);

        dataHelper.incrementStatForAccount(account, 'farming');

        let chance = Math.floor(Math.random()*100)
        let _count = account.inventory[0]['seeds']['amount'];
        let count = _count;

        if (_count > 0) { 
            if (chance >= 80) {
                if (chance >= 80) {
                    count = Math.floor(count * 0.2);
                } else if(chance >= 90) {
                    count = Math.floor(count * 0.45);
                } else if(chance >= 96) {
                    count = count;
                }

                if (count < 1) {
                    count = 1;
                }

                dataHelper.updateItemForAccount(account, 'seeds', _count-count);
                dataHelper.updateItemForAccount(account, 'wheat', account.inventory[0]['wheat']['amount'] + count);
            }
        }

        chance = Math.floor(Math.random()*100);

        if (chance <= 40) {
            let itemChance = Math.floor(Math.random()*items.length);
            let item = items[itemChance];

            if (item === '5 tix') {
                let found = Math.floor(Math.random()*4) + 1;
                dataHelper.updateBalanceForAccount(account, 'tix', account.wallet[0]['tix']['amount'] + found);
                return message.reply(`You found ${found} tix!`);
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
            return message.reply('Better luck next time.');
        }
    }
}