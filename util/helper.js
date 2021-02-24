const Discord = require('discord.js');

const userEco = require('../db/models/userEcoModel');
const userInv = require('../db/models/userInventoryModel');
const shopItem = require('../db/models/shopItemModel');
const userStats = require('../db/models/userStatsModel');
const { emojiTixId } = require('../config.json');

const chars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];

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
        return null;
    },

    getUserEcoAccount: async function(userId) {
        let account = await userEco.findOne({
            userId: userId
        })

        if (!account) {
            account = new userEco({
                userId: userId,
                balance: 500
            })

            await account.save()
        }

        return account
    },

    getUserInventory: async function(userId) {
        let inv = await userInv.findOne({
            userId: userId
        })

        if (!inv) {
            inv = new userInv({
                userId: userId
            })

            await inv.save();
        }

        return inv;
    },

    getMoneyEmoji: function(message) {
        return message.guild.emojis.resolve(emojiTixId);
    },

    getCategories: async function() {
        let categories = await shopItem.find().distinct('category', function(err, categories) {
            if (err) {
                console.log(err);
                return message.channel.send('Error fetching shop data. Please try again later.');
            }
        })
    
        return categories;
    },

    randomColorHex: function() {
        let hex = '';
        for (var i=0;i<6;i++) {
            let rand = Math.floor(Math.random()*16);
            hex += chars[rand];
        }

        return '#' + hex;
    },

    getUserStats: async function(userId) {
        let stats = await userStats.findOne({userId: userId});
        if (!stats) {
            stats = new userStats({
                userId: userId
            });

            await stats.save();
        }

        return stats;
    },

    updateUserStat: async function(userId, statName) {
        let stats = await this.getUserStats(userId);

        stats[statName] = parseInt(stats[statName]) + 1

        await userStats.updateOne({userId: userId}, stats);
    },

    generateEmptyEmbed: function(avatarURL, title) {
        const embed = new Discord.MessageEmbed()
            .setTitle(title)
            .setColor(this.randomColorHex())
            .setThumbnail(avatarURL);

        return embed;
    },

    renderUserStats: async function(message) {
        let user = message.author;
        let member = message.member;

        let stats = await this.getUserStats(user.id);
        let embed = this.generateEmptyEmbed(user.avatarURL(), `${member.displayName}'s Stats`);

        userStats.schema.eachPath(function(path) {
            if (path != 'userId' && path != '_id' && path != '__v') {
                embed.addField(path, `Performed: ${stats[path]}\nLevel: 1`, false)
            }
        });
        
        return embed;
    },

    updateInventory: async function(userId, item, quantity) {
        let inv = await this.getUserInventory(userId);
        let jsonInv = JSON.parse(inv.inventory);

        if (jsonInv[item]) {
            quantity = quantity + parseInt(jsonInv[item]);
        }

        jsonInv[item] = quantity;

        let empty = [];

        for (var item in jsonInv) {
            let count = parseInt(jsonInv[item]);
            if (count == 0) {
                empty.push(item);
            }
        }

        for (var emp in empty) {
            delete jsonInv[empty[emp]];
        }

        inv.inventory = JSON.stringify(jsonInv);

        await userInv.updateOne({userId: userId}, inv);
    },

    updateBalance: async function(userId, amount) {
        let account = await this.getUserEcoAccount(userId);
        let balance = parseInt(account.balance);
        balance = balance + parseInt(amount);
        account.balance = balance;
        await userEco.updateOne({userId: userId}, account);
    },

    getUserLastLogin: async function(user) {
        let account = await this.getUserEcoAccount(user.id);
        return account.login || 0;
    },
    
    getUserBalance: async function(userId) {
        let account = await this.getUserEcoAccount(userId);
        return parseInt(account.balance);
    },

    updateShopItem: async function(itemName, amount) {
        let item = await shopItem.findOne({name: itemName});
        item['amount'] = parseInt(item['amount']) + amount;
        
        await shopItem.updateOne({name: itemName}, item);
    }
}