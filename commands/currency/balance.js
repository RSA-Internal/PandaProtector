const dataHelper = require('../../util/dataHelper');
const helper = require('../../util/helper');

module.exports = {
    name: 'balance',
    description: 'Get balance of a user (or yourself)',
    aliases: ['bal'],
    guildOnly: true,
    cooldown: 5,
    async execute(message, args) {
        let member = await helper.queryMember(message, args);
        let id = member.user.id;

        let account = await dataHelper.getAccount(id);

        let balance = account.wallet[0]['tix']['amount'];

        return message.channel.send(`Balance of ${member.displayName}: ${balance} ${helper.getMoneyEmoji(message)}`);
    }
}