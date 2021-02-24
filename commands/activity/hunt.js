const items = ['hide', 'raw_meat', 'antler', '5 tix', '30 tix', 'hide', 'raw_meat', 'antler', 'raw_meat', 'antler'];
const helper = require('../../util/helper');

module.exports = {
    name: 'hunt',
    description: 'Go hunting, but beware you might get hurt',
    guildOnly: true,
    cooldown: 30,
    async execute(message, args) {
        await helper.updateUserStat(message.author.id, 'hunting');
        let chance = Math.floor(Math.random()*100)

        if (chance <= 60) {
            let itemChance = Math.floor(Math.random()*items.length);
            let item = items[itemChance];

            if (item === '5 tix') {
                await helper.updateBalance(message.author.id, 5);
            } else if (item === '30 tix') {
                await helper.updateBalance(message.author.id, 30);
            } else {
                await helper.updateInventory(message.author.id, item, 1);
            }

            return message.reply(`You obtained ${item}`);
        } else {
            if (chance >= 80) {
                //got into a fight with a bear, lose a random item.
                let inv = await helper.getUserInventory(message.author.id);
                let jsonInv = JSON.parse(inv.inventory);
                let items = [];

                for (var i in jsonInv) {
                    items.push(i);
                }

                let random = Math.floor(Math.random()*items.length);
                let item = items[random];
                let count = parseInt(jsonInv[item]);

                await helper.updateInventory(message.author.id, item, -count);
                
                if (count > 1) {
                    item = item + 's';
                }

                return message.reply(`got into a fight with a bear, and lost ${count} ${item}`);
            } else {
                return message.reply('Better luck next time.');
            }
        }
    }
}