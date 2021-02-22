const userEco = require('../../db/models/userEcoModel');
const helper = require('../../util/helper');

module.exports = {
    name: 'balance',
    description: 'Get balance of a user (or yourself)',
    aliases: ['bal'],
    guildOnly: true,
    cooldown: 15,
    async execute(message, args) {
        let user = message.author;

        if (args[0]) {
            user = await helper.queryUser(message, args);
        }

        if (!user) {
            return message.channel.send('Failed to retrieve user account.');
        }

        let account = await userEco.findOne({
            userId: user.id
        });

        if (!account) {
            account = new userEco({
                userId: user.id,
                balance: 0
            });

            await account.save();
        }

        return message.channel.send(`Balance of ${message.guild.members.resolve(user).displayName}: ${account.balance} ${helper.getMoneyEmoji(message)}`);
    }
}