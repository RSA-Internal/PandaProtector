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