const Discord = require('discord.js');
const https = require('https');
const rbxAccount = require('../../db/models/rbxAccountModel');

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
    args: true,
    guildOnly: true,
    cooldown: 15,
    async execute(message, args) {
        if (args[0]) {
            let user = getUserFromMention(message.client, args[0]);
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

            let boundAccount = await rbxAccount.findOne({
                authorId: userId
            });

            if (boundAccount) {
                const options = new URL(`https://users.roblox.com/v1/users/${boundAccount.robloxId}`)
                
                const req = https.get(options, res => {
                    res.setEncoding('utf-8');
                    
                    res.on('data', function(chunk) {
                        let robloxData = JSON.parse(chunk);

                        const statusOptions = new URL(`https://users.roblox.com/v1/users/${boundAccount.robloxId}/status`);

                        const statusReq = https.get(statusOptions, statusRes => {
                            statusRes.setEncoding('utf-8');

                            statusRes.on('data', function(chunk) {
                                let status = JSON.parse(chunk)['status'];

                                const usernameHistoryOptions = new URL(`https://users.roblox.com/v1/users/${boundAccount.robloxId}/username-history`);

                                const usernameHistoryReq = https.get(usernameHistoryOptions, usernameHistoryRes => {
                                    usernameHistoryRes.setEncoding('utf-8');

                                    usernameHistoryRes.on('data', function(chunk) {
                                        let usernameHistory = JSON.parse(chunk)['data'];

                                        if (usernameHistory.length) {
                                            usernameHistory = usernameHistory.join(', ');
                                        } else {
                                            usernameHistory = 'No history.'
                                        }

                                        const thumbnailOption = new URL(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${boundAccount.robloxId}&size=100x100&format=Png&isCircular=true`);

                                        const thumbnailReq = https.get(thumbnailOption, thumbnailRes => {
                                            thumbnailRes.setEncoding('utf-8');

                                            thumbnailRes.on('data', function(chunk) {
                                                let thumbnail = JSON.parse(chunk)['data'][0]['imageUrl'];

                                                const robloxEmbed = new Discord.MessageEmbed()
                                                .setColor('#0099ff')
                                                .setTitle(user.displayName)
                                                .setThumbnail(thumbnail)
                                                .setURL(`https://www.roblox.com/users/${robloxData['id']}/profile`)
                                                .addFields(
                                                    { name: 'Username', value: robloxData['name'], inline: true },
                                                    { name: 'Display Name', value: robloxData['displayName'], inline: true},
                                                    { name: '\u200B', value: '\u200B', inline: true },
                                                    { name: 'Description', value: robloxData['description'], inline: true },
                                                    { name: 'Status', value: status, inline: true },
                                                    { name: '\u200B', value: '\u200B', inline: true },
                                                    { name: 'Creation Time', value: robloxData['created'], inline: true },
                                                    { name: 'IsBanned', value: robloxData['isBanned'], inline: true },
                                                    { name: '\u200B', value: '\u200B', inline: true },
                                                    { name: 'Username History', value: usernameHistory, inline: true},
                                                );

                                                return message.channel.send(robloxEmbed);
                                            })
                                        });
                                    })
                                })
                            })
                        })
                    });
                });

                req.on('error', error => {
                    console.error(error);
                })
            } else {
                return message.channel.send('That user does not have a linked Roblox account.');
            }
        }
    }
}