const helper = require('../../util/helper')
const dataHelper = require('../../util/dataHelper')

module.exports = {
    name: 'baltop',
    description: 'Get the top money holders',
    guildOnly: true,
    cooldown: 5,
    async execute(message, args) {
        let money = helper.getMoneyEmoji(message);
        const leaderboard = helper.generateEmptyEmbed('', `${money} board`);
        leaderboard.setDescription(`Top 10 ${money} holders`);

        let data = await dataHelper.getAllBalances();
        let balances = data['tempBalance'];

        let count = 0;

        for (var userId in balances) {
            if (count >= 10) { break; }
            count++;
            let displayName = userId;
            if (userId > 0) {
                displayName = await helper.getDisplayNameFromId(message.guild, userId);
            } else if (userId == -1) {
                displayName = '[Server]';
            }
            leaderboard.addField(displayName, `${balances[userId]} ${money}`, false);
        }

        leaderboard.setFooter(`Last Updated: ${data['lastUpdated']}`);

        message.channel.send(leaderboard);
    }
}