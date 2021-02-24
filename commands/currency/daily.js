const { execute } = require("../activity/farm");

const helper = require('../../util/helper')
const userEco = require('../../db/models/userEcoModel');

module.exports = {
    name: 'daily',
    description: 'Obtain your daily login reward',
    aliases: ['login'],
    async execute(message, args) {
        let userAccount = await helper.getUserEcoAccount(message.author.id);
        let lastLogin = userAccount.login || 0;
        let currentMilli = new Date().getTime();

        if (currentMilli - lastLogin >= 1000*60*60*24) {
            let balance = parseInt(userAccount.balance);
            balance = balance + 25;

            userAccount.balance = balance;
            userAccount.login = currentMilli;
            await userEco.updateOne({userId: message.author.id}, userAccount);

            return message.channel.send('Thank you for your daily login! Hopefully you help a few people today.')
        }
    }
}