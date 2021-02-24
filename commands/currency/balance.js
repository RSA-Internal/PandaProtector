const helper = require('../../util/helper');

module.exports = {
    name: 'balance',
    description: 'Get balance of a user (or yourself)',
    aliases: ['bal'],
    guildOnly: true,
    cooldown: 5,
    async execute(message, args) {
        let user = message.author;

        if (args[0]) { user = await helper.queryUser(message, args); }
        if (!user) { return message.channel.send('Failed to retrieve user account.'); }

        let account = await helper.getUserEcoAccount(user.id);

        return message.channel.send(`Balance of ${message.guild.members.resolve(user).displayName}: ${account.balance} ${helper.getMoneyEmoji(message)}`);
    }
}