const rbxAccount = require('../db/models/rbxAccountModel');

function getUserFromMention(client, mention) {
    if (!mention) return;

    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        if (mention.startsWith('!')) {
            mention = mention.slice(1);
        }

        return client.users.cache.get(mention);
    }
}

module.exports = {
    name: 'whois',
    description: 'Get info on a user',
    guildOnly: true,
    args: true,
    cooldown: 30,
    async execute(message, args) {
        if (args[0]) {
            const user = getUserFromMention(message.client, args[0]);
            var userId = '';
            if (!user) {
                let user = message.guild.members.resolve(args[0]);

                if (user) {
                    userId = user.id;
                } else {
                    let res = await message.guild.members.fetch({query: args[0], limit: 1});
                    let first = res.entries().next().value;
                    userId = first[0];
                }
            } else {
                userId = user.id;
            }
            
            let boundAccount = await rbxAccount.findOne({
                authorId: userId
            });

            if (boundAccount) {
                return message.channel.send(`That user is linked to ${boundAccount.robloxUsername}`);
            } else {
                return message.channel.send('That user does not have a linked Roblox account.');
            }
        }
    }
}