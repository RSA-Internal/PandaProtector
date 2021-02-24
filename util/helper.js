const userEco = require('../db/models/userEcoModel');
const userInv = require('../db/models/userInventoryModel');
const shopItem = require('../db/models/shopItemModel');
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
    }
}