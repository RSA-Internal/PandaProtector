const userEco = require('../db/models/userEcoModel')
const { emojiTixId } = require('../config.json');

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
    queryUser: async function(message, args) {
        user = getUserFromMention(message.client, args[0]);
        let userId = null;

        if (!user) {
            let user = message.guild.members.resolve(args[0]);

            if (!user) {
                let res = await message.guild.members.fetch({query: args[0], limit: 1});
                let first = res.entries().next().value;
                userId = first[0];
            } else {
                userId = user.id;
            }
        } else {
            userId = user.id;
        }
        
        user = await message.guild.members.fetch(userId);

        return user;
    },

    getUserEcoAccount: async function(userId) {
        let account = await userEco.findOne({
            userId: userId
        })

        if (!account) {
            account = new userEco({
                userId: userId,
                balance: 0
            })

            await account.save()
        }

        return account
    },

    getMoneyEmoji: function(message) {
        return message.guild.emojis.resolve(emojiTixId);
    }
}