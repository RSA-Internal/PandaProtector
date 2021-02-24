const items = ['fish', 'boot', 'kelp', '5 tix', 'fish', 'boot', 'kelp', 'boot', 'kelp', 'fish', 'boot', 'kelp', 'kelp'];
const helper = require('../../util/helper');

module.exports = {
    name: 'fish',
    description: 'Go fishing',
    guildOnly: true,
    cooldown: 30,
    async execute(message, args) {
        await helper.updateUserStat(message.author.id, 'fishing');
        let chance = Math.floor(Math.random()*100)

        if (chance <= 40) {
            let itemChance = Math.floor(Math.random()*items.length);
            let item = items[itemChance];

            if (item === '5 tix') {
                await helper.updateBalance(message.author, 5);
            } else {
                await helper.updateInventory(message.author, item, 1);
            }

            return message.channel.send(`You obtained ${item}`);
        } else {
            return message.channel.send('Better luck next time.');
        }
    }
}