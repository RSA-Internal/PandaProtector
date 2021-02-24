const items = ['fish', 'boot', 'kelp', '5 tix', 'fish', 'boot', 'kelp', 'boot', 'kelp', 'fish', 'boot', 'kelp', 'kelp'];

const helper = require('../../util/helper');
const userEco = require('../../db/models/userEcoModel');
const userInv = require('../../db/models/userInventoryModel');

module.exports = {
    name: 'fish',
    description: 'Go fishing',
    guildOnly: true,
    cooldown: 30,
    async execute(message, args) {
        let chance = Math.floor(Math.random()*100)

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
                let inv = await helper.getUserInventory(message.author.id);
                let jsonInv = JSON.parse(inv.inventory);
                let quantity = 1;

                if (jsonInv[item]) {
                    quantity = quantity + parseInt(jsonInv[item]);
                }

                jsonInv[item] = quantity;
                inv.inventory = JSON.stringify(jsonInv);

                await userInv.updateOne({userId: message.author.id}, inv);
            }

            return message.channel.send(`You obtained ${item}`);
        } else {
            return message.channel.send('Better luck next time.');
        }
    }
}