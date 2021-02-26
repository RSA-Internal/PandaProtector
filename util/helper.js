const Discord = require('discord.js');
const { emojiTixId } = require('../config.json');

const chars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];
const displayNameCache = [];

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
    /** async */
    queryMember: async function(message, args) {
        if (args[0]) {
            user = getUserFromMention(message.client, args[0]);
            let userId = null;

            if (!user) {
                let user = message.guild.members.resolve(args[0]);

                if (!user) {
                    let res = await message.guild.members.fetch({query: args[0], limit: 1});
                    let first = res.entries().next().value;
                    if (first) {
                        userId = first[0];
                    }
                } else {
                    userId = user.id;
                }
            } else {
                userId = user.id;
            }
            
            if (userId) {
                user = await message.guild.members.fetch(userId);

                return user;
            }
        }

        return message.member;
    },

    getMoneyEmoji: function(message) {
        return message.guild.emojis.resolve(emojiTixId);
    },

    randomColorHex: function() {
        let hex = '';
        for (var i=0;i<6;i++) {
            let rand = Math.floor(Math.random()*16);
            hex += chars[rand];
        }

        return '#' + hex;
    },

    generateEmptyEmbed: function(avatarURL, title) {
        const embed = new Discord.MessageEmbed()
            .setTitle(title)
            .setColor(this.randomColorHex())
            .setThumbnail(avatarURL);

        return embed;
    },

    prependRarity: function(rarity, display) {
        if (rarity === 'Common') { display = `[C] ${display}` }
        else if (rarity === 'Uncommon') { display = `[U] ${display}` }
        else if (rarity === 'Rare') { display = `[R] ${display}` }
        else if (rarity === 'Epic') { display = `[E] ${display}` }
        else if (rarity === 'Forbidden') { display = `[F] ${display}` }
        else if (rarity === '???') { display = `[?] ${display}` }

        return display;
    },

    getDisplayNameFromId: async function(guild, id) {
        if (!displayNameCache[id]) {
            let member = await guild.members.resolve(id);

            if (!member) {
                member = await guild.members.fetch(id);

                if (!member) {
                    displayNameCache[id] = id;
                }
            }

            if (member) {
                displayNameCache[id] = member.displayName;
            }

            setTimeout(function() { delete displayNameCache[id] }, 1000*60*5);
        }

        return displayNameCache[id];
    }
}