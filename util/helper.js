const Discord = require('discord.js');

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

var client;
var useToken;
var useAppId;
var useKey;
var useGuild;
var folder;
var requestChannelId;
var staffId;

module.exports = {
    useToken: function() { return useToken; },
    useAppId: function() { return useAppId; },
    useKey: function() { return useKey; },
    useGuild: function() { return useGuild; },
    folder: function() { return folder; },
    useRequestChannelId: function() { return requestChannelId; },
    staffId: function() { return staffId; },

    setToken: function(newToken) { useToken = newToken; },
    setAppId: function(newAppId) { useAppId = newAppId; },
    setKey: function(newKey) { useKey = newKey; },
    setGuild: function(newGuild) { useGuild = newGuild; },
    setFolder: function(newFolder) { folder = newFolder; },
    setRequestChannel: function(newChannelId) { requestChannelId = newChannelId; },
    setStaffId: function(newId) { staffId = newId; },

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
    },

    setClient: function(newClient) {
        client = newClient;
    },

    getClient: function() {
        return client;
    },

    shouldBeEphemeral: function(channelId) {
        console.log(`Checking: ${channelId}`)
        let ret = channelId != '424636584609054721';
        console.log(`VISIBLE: ${ret}`);
        return ret
    }
}