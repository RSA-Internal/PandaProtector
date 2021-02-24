const helper = require('../../util/helper');

module.exports = {
    name: 'stats',
    description: 'Display your current stats',
    cooldown: 30,
    guildOnly: true,
    async execute(message, args) {
        const embed = await helper.renderUserStats(message);

        return message.channel.send(embed);
    }
}