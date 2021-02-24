const items = ['wheat', 'seeds', 'carrot', '5 tix', 'wheat', 'potato', 'seeds', 'carrot', 'boot', 'carrot', 'wheat', 'seeds', 'carrot', 'potato', 'carrot'];

const helper = require('../../util/helper');
const userEco = require('../../db/models/userEcoModel');
const userInv = require('../../db/models/userInventoryModel');

module.exports = {
    name: 'farm',
    description: 'Go farming',
    guildOnly: true,
    cooldown: 30,
    async execute(message, args) {
        await helper.updateUserStat(message.author.id, 'farming');
        let chance = Math.floor(Math.random()*100)

        let inv = await helper.getUserInventory(message.author.id);
        let jsonInv = JSON.parse(inv.inventory);
        let _count = parseInt(jsonInv['seeds']);
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

                console.log(`Grew ${count} seeds`);

                await helper.updateInventory(message.author, 'seeds', -count);
                await helper.updateInventory(message.author, 'wheat', count);
            }
        }

        chance = Math.floor(Math.random()*100);

        if (chance <= 40) {
            let itemChance = Math.floor(Math.random()*items.length);
            let item = items[itemChance];

            if (item === '5 tix') {
                let userAccount = await helper.getUserEcoAccount(message.author.id);
                let bal = parseInt(userAccount.balance);
                bal = bal + 5;

                userAccount.balance = bal;
                await userEco.updateOne({userId: message.author.id}, userAccount);
            } else {
                await helper.updateInventory(message.author, item, 1);
            }

            return message.channel.send(`You obtained ${item}`);
        } else {
            return message.channel.send('Better luck next time.');
        }
    }
}