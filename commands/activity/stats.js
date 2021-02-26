const dataHelper = require('../../util/dataHelper');
const helper = require('../../util/helper');

module.exports = {
    name: 'stats',
    description: 'Display your current stats',
    cooldown: 30,
    guildOnly: true,
    async execute(message, args) {
        let member = await helper.queryMember(message, args);
        let id = member.user.id;

        let account = await dataHelper.getAccount(id);
        let embed = helper.generateEmptyEmbed(member.user.avatarURL(), `${member.displayName}'s Stats`);
        let stats = account.stats;

        if (stats) {
            let ret = [];
            for (var stat in stats[0]) {
                let st = stats[0][stat];
                ret.push(`**${st.name}** [Level: ${st.level}]\nPerformed: ${st.amount}\n`);
            }
            embed.addField('Stats', ret.join('\n'), true);
        }

        return message.channel.send(embed);
    }
}