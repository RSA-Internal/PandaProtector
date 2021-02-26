const dataHelper = require('../../util/dataHelper')

module.exports = {
    name: 'daily',
    description: 'Obtain your daily login reward',
    aliases: ['login'],
    async execute(message, args) {
        //let lastLogin = await helper.getUserLastLogin(message.author);
        //let currentMilli = new Date().getTime();

        let userId = message.author.id;
        let account = await dataHelper.getAccount(userId);

        let lastLogin = account.lastLogin || 0;
        let currentMilli = new Date().getTime();

        if (currentMilli - lastLogin >= 1000*60*60*24) {
            await dataHelper.updateBalanceForAccount(account, 'tix', account.wallet[0]['tix']['amount'] + 25);
            account.lastLogin = currentMilli;
            dataHelper.updateAccount(account);

            return message.reply('Thank you for your daily login! Hopefully you help a few people today.')
        } else {
            return message.reply('You have already received the daily reward in the past 24 hours.');
        }
    }
}